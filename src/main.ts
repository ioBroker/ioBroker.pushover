import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import axios from 'axios';
// @ts-expect-error no types
import PushoverNotifications from 'pushover-notifications';
import type { MessagePriority, MessageSound, PushoverAdapterConfig } from './types';
import { formatNotification, isNotificationMessage, type NotificationMessage } from './notification';
import { COMMANDS, HELP } from './help';
import {
    attachmentProblem,
    MAX_ATTACHMENT_BYTES,
    standardAnswer,
    toPushoverMessage,
    type FileSource,
    type PushoverFile,
    type StandardAnswer,
} from './standardMessage';

interface PushoverHeaders {
    'x-limit-app-limit'?: string;
    'x-limit-app-remaining'?: string;
    'x-limit-app-reset'?: string;
    [key: string]: string | string[] | undefined;
}

interface PushoverResponse {
    headers: PushoverHeaders;
}

interface PushoverGlancesResult {
    status?: number;
    errors?: string[] | string;
    [key: string]: unknown;
}

interface PushoverMessage {
    user?: string;
    token?: string;
    title?: string;
    message?: string;
    text?: string;
    subtext?: string;
    count?: number | string;
    percent?: number | string;
    device?: string;
    sound?: MessageSound;
    priority?: MessagePriority;
    timestamp?: number;
    retry?: number | string;
    expire?: number | string;
    file?: string | { name: string; data: Buffer; type?: string };
    [key: string]: unknown;
}

const PUSHOVER_NOTIFICATION_FIELDS = [
    'user',
    'token',
    'title',
    'message',
    'device',
    'html',
    'monospace',
    'timestamp',
    'priority',
    'retry',
    'expire',
    'sound',
    'url',
    'url_title',
    'callback',
    'tags',
    'ttl',
    'attachment_base64',
    'attachment_type',
    'encrypted',
    'file',
    'attachment',
] as const;

interface PushoverClientOptions {
    user: string;
    token: string;
    onerror: (error: unknown) => void;
}

interface PushoverClient {
    token?: string;
    send(
        message: PushoverMessage,
        callback: (error: unknown, result: unknown, response: PushoverResponse) => void,
    ): void;
}

interface PushoverClientConstructor {
    new (options: PushoverClientOptions): PushoverClient;
}

const PushoverClient = PushoverNotifications as unknown as PushoverClientConstructor;

function isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === '';
}

/** An Error object arrives as {} over sendTo, so answer its text; a text or no error (null) stays as it is */
function errorText(error: unknown): unknown {
    return error instanceof Error ? error.message : error;
}

export default class Pushover extends Adapter {
    declare config: PushoverAdapterConfig;

    private pushover?: PushoverClient;
    private lastMessageTime = 0;
    private lastMessageText = '';

    public constructor(options: Partial<AdapterOptions> = {}) {
        super({
            ...options,
            name: 'pushover',
        });

        this.on('ready', this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
    }

    private onReady(): void {
        if (!this.config.user || !this.config.token) {
            this.log.error('Cannot send notification while not configured');
        }
    }

    private onMessage(obj: ioBroker.Message): void {
        if (obj.command === 'help') {
            // A description of all commands for AI agents and scripts
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, { help: HELP, commands: COMMANDS }, obj.callback);
            }
        } else if (obj.command === 'send' && obj.message) {
            this.processMessage(obj);
        } else if (obj.command === 'message.send') {
            void this.standardSend(obj);
        } else if (obj.command === 'glances' && obj.message) {
            this.sendGlances(obj);
        } else if (obj.command === 'sendNotification' && obj.message) {
            this.processNotification(obj);
        } else if (obj.callback) {
            this.sendTo(obj.from, obj.command, { error: 'Unsupported' }, obj.callback);
        }
    }

    private processNotification(obj: ioBroker.Message): void {
        const notification: unknown = obj.message;

        if (!isNotificationMessage(notification)) {
            this.log.warn(`Invalid notification received: ${JSON.stringify(notification)}`);
            if (obj.callback) {
                this.sendTo(obj.from, 'sendNotification', { sent: false, error: 'Invalid notification' }, obj.callback);
            }
            return;
        }

        const message: PushoverMessage = {
            ...formatNotification(notification),
            ...this.getNotificationPushoverOptions(notification),
        };

        this.sendNotification(message, error => {
            if (obj.callback) {
                this.sendTo(obj.from, 'sendNotification', { sent: !error }, obj.callback);
            }
        });
    }

    private getNotificationPushoverOptions(notification: NotificationMessage): PushoverMessage {
        const received: Record<string, unknown> = notification;
        const options: Record<string, unknown> = {};

        for (const field of PUSHOVER_NOTIFICATION_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(received, field) && received[field] !== undefined) {
                options[field] = received[field];
            }
        }

        if (!Object.prototype.hasOwnProperty.call(options, 'message') && typeof received.text === 'string') {
            options.message = received.text;
        }

        // The pushover-notifications library uses `file` for the API's multipart `attachment` parameter.
        if (options.attachment !== undefined) {
            if (options.file === undefined) {
                options.file = options.attachment;
            }
            delete options.attachment;
        }

        return options;
    }

    private processMessage(obj: ioBroker.Message): void {
        const message = this.normalizeMessage(obj.message);
        if (!message) {
            return;
        }
        // text and recipient of message.send (the shared catalog): the text and the device of the user
        if (typeof message.message !== 'string' && typeof message.text === 'string') {
            message.message = message.text;
        }
        if (!message.device && typeof message.recipient === 'string' && message.recipient) {
            message.device = message.recipient;
        }
        delete message.text;
        delete message.recipient;

        const json = JSON.stringify(message);
        if (this.isDuplicateMessage(json)) {
            this.log.debug(`Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`);
            if (obj.callback) {
                const error = 'The same message was sent less than 1 s ago';
                this.sendTo(obj.from, 'send', { error, reason: 'DUPLICATE' }, obj.callback);
            }
            return;
        }

        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        if (message.user && message.token && message.user !== this.config.user) {
            const tempPushover = new PushoverClient({
                user: message.user,
                token: message.token,
                onerror: this.onError.bind(this),
            });

            delete message.user;
            delete message.token;

            tempPushover.send(message, (err, result, response) => {
                this.log.debug(`Pushover response: ${JSON.stringify(response?.headers)}`);

                if (err) {
                    try {
                        this.log.error(`Cannot send notification: ${JSON.stringify(err)}`);
                    } catch (jsonError) {
                        this.log.error(`Cannot send notification: ${String(jsonError)}`);
                    }
                }

                if (obj.callback) {
                    // `error` as in the other answers, `err` is kept for scripts written for the former answer
                    this.sendTo(obj.from, 'send', { error: errorText(err), err: errorText(err), result }, obj.callback);
                }
            });
            return;
        }

        this.sendNotification(message, (error, result) => {
            if (obj.callback) {
                this.sendTo(obj.from, 'send', { error: errorText(error), result }, obj.callback);
            }
        });
    }

    /**
     * message.send of the shared catalog {text, recipient?, title?, file?, files?, priority?}, under the full name
     * because send answers error: null on success. Sends through the client of the settings like send; one picture.
     * Answer {ok: true, sent: 1, receipt?} or {error, reason?}.
     *
     * @param obj the message with the command message.send
     */
    private async standardSend(obj: ioBroker.Message): Promise<void> {
        const answer = (result: StandardAnswer): void => {
            if (obj.callback) {
                this.sendTo(obj.from, obj.command, result, obj.callback);
            }
        };
        const mapped = toPushoverMessage(this.normalizeMessage(obj.message) ?? {});
        if ('failure' in mapped) {
            return answer(mapped.failure);
        }
        const message: PushoverMessage = mapped.message;
        if (mapped.file) {
            let file: PushoverFile;
            try {
                file = await this.readStandardFile(mapped.file);
            } catch (error) {
                return answer({
                    error: `Cannot read the picture: ${error instanceof Error ? error.message : String(error)}`,
                    reason: 'BAD_REQUEST',
                });
            }
            const problem = attachmentProblem(file);
            if (problem) {
                return answer(problem);
            }
            message.file = file;
        }

        const json = JSON.stringify(message);
        if (this.isDuplicateMessage(json)) {
            this.log.debug(`Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`);
            return answer({ error: 'The same message was sent less than 1 s ago', reason: 'DUPLICATE' });
        }
        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        this.sendNotification(message, (error, result) => answer(standardAnswer(error, result)));
    }

    /**
     * The picture of message.send: given, read from the files of ioBroker, or loaded from a URL (at most 5 MB).
     *
     * @param source where the picture comes from
     */
    private async readStandardFile(source: FileSource): Promise<PushoverFile> {
        if ('data' in source) {
            return source;
        }
        if ('adapter' in source) {
            const { file, mimeType } = await this.readFileAsync(source.adapter, source.path);
            return {
                name: source.path.split('/').pop() || 'picture',
                data: Buffer.isBuffer(file) ? file : Buffer.from(file),
                type: mimeType || 'application/octet-stream',
            };
        }
        const response = await axios.get<ArrayBuffer>(source.url, {
            responseType: 'arraybuffer',
            timeout: 15000,
            maxContentLength: MAX_ATTACHMENT_BYTES,
        });
        const type = String(response.headers['content-type'] || 'application/octet-stream')
            .split(';')[0]
            .trim();
        return {
            name: new URL(source.url).pathname.split('/').pop() || 'picture',
            data: Buffer.from(response.data),
            type,
        };
    }

    private sendGlances(obj: ioBroker.Message): void {
        const msg = this.normalizeMessage(obj.message);
        if (!msg) {
            return;
        }

        const json = JSON.stringify(msg);
        if (this.isDuplicateMessage(json)) {
            this.log.debug(`Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`);
            return;
        }

        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        const formData = {
            token: typeof msg.token === 'string' && msg.token ? msg.token : this.config.token,
            user: typeof msg.user === 'string' && msg.user ? msg.user : this.config.user,
            title: msg.title !== undefined ? String(msg.title) : this.config.title,
            text: typeof msg.message === 'string' ? msg.message : typeof msg.text === 'string' ? msg.text : undefined,
            subtext: typeof msg.subtext === 'string' ? msg.subtext : undefined,
            count: msg.count ?? undefined,
            percent: msg.percent ?? undefined,
            device: typeof msg.device === 'string' ? msg.device : undefined,
        };

        if (formData.title && formData.title.length > 100) {
            this.log.error('Title too long. Max length is 100');
            if (obj.callback) {
                this.sendTo(obj.from, 'glances', { error: 'Title too long. Max length is 100' }, obj.callback);
            }
            return;
        }

        if (formData.text && formData.text.length > 100) {
            this.log.error('Text too long. Max length is 100');
            if (obj.callback) {
                this.sendTo(obj.from, 'glances', { error: 'Text too long. Max length is 100' }, obj.callback);
            }
            return;
        }

        if (formData.subtext && formData.subtext.length > 100) {
            this.log.error('Subtext too long. Max length is 100');
            if (obj.callback) {
                this.sendTo(obj.from, 'glances', { error: 'Subtext too long. Max length is 100' }, obj.callback);
            }
            return;
        }

        this.log.debug(`Sending pushover glances: ${JSON.stringify(formData)}`);

        void axios
            .post<PushoverGlancesResult>('https://api.pushover.net/1/glances.json', formData)
            .then(async response => {
                this.log.debug(
                    `Pushover glances response: ${JSON.stringify(response.status)} ${JSON.stringify(response.data)}`,
                );

                await this.updateLimitStates(response.headers as PushoverHeaders);

                if (response.data.status !== 1) {
                    this.log.error(`Pushover glances error: ${JSON.stringify(response.data.errors)}`);
                    if (obj.callback) {
                        this.sendTo(obj.from, 'glances', { error: response.data.errors }, obj.callback);
                    }
                } else if (obj.callback) {
                    this.log.debug(`Pushover glances POST succeeded: ${JSON.stringify(response.data)}`);
                    this.sendTo(obj.from, 'glances', { error: null, result: response.data }, obj.callback);
                }
            })
            .catch(error => {
                this.log.error(`Pushover error: ${String(error)}`);
                if (obj.callback) {
                    this.sendTo(obj.from, 'glances', { error: `Pushover error: ${String(error)}` }, obj.callback);
                }
            });
    }

    private onError(error: unknown): void {
        this.log.error(`Error from Pushover: ${String(error)}`);
    }

    private sendNotification(
        message: PushoverMessage | undefined,
        callback?: (error: unknown, result?: unknown) => void,
    ): void {
        const normalizedMessage = this.normalizeMessage(message) ?? {};

        const user =
            typeof normalizedMessage.user === 'string' && normalizedMessage.user
                ? normalizedMessage.user
                : this.config.user;
        const token =
            typeof normalizedMessage.token === 'string' && normalizedMessage.token
                ? normalizedMessage.token
                : this.config.token;
        delete normalizedMessage.user;
        delete normalizedMessage.token;

        if (!user || !token) {
            this.log.error('Cannot send notification while not configured');
            callback?.('Cannot send notification while not configured');
            return;
        }

        let pushover = this.pushover;
        if (!pushover || user !== this.config.user) {
            pushover = new PushoverClient({
                user,
                token,
                onerror: this.onError.bind(this),
            });

            if (user === this.config.user) {
                this.pushover = pushover;
            }
        }
        pushover.token = token;

        // Empty values (e.g. `sound: ''` from Blockly) fall back to the instance settings, an explicit priority 0 does not
        if (isEmpty(normalizedMessage.title)) {
            normalizedMessage.title = this.config.title;
        }
        if (isEmpty(normalizedMessage.sound)) {
            normalizedMessage.sound = this.config.sound || undefined;
        }
        if (isEmpty(normalizedMessage.priority)) {
            normalizedMessage.priority = this.config.priority;
        }
        normalizedMessage.message = typeof normalizedMessage.message === 'string' ? normalizedMessage.message : '';

        if (typeof normalizedMessage.timestamp === 'number' && normalizedMessage.timestamp > 946681200000) {
            normalizedMessage.timestamp = Math.round(normalizedMessage.timestamp / 1000);
        }

        if (Number(normalizedMessage.priority) === 2) {
            normalizedMessage.retry = parseInt(String(normalizedMessage.retry), 10) || 60;
            normalizedMessage.expire = parseInt(String(normalizedMessage.expire), 10) || 3600;
        }

        (this.config.showLog ? this.log.info : this.log.debug)(
            `Sending pushover notification: ${JSON.stringify(normalizedMessage)}`,
        );

        pushover.send(normalizedMessage, async (err, result, response) => {
            this.log.debug(`Pushover response: ${JSON.stringify(response?.headers)}`);

            if (err) {
                try {
                    this.log.error(`Cannot send notification: ${JSON.stringify(err)}`);
                } catch (jsonError) {
                    this.log.error(`Cannot send notification: ${String(jsonError)}`);
                }

                callback?.(err);
                return;
            }

            await this.updateLimitStates(response.headers);
            callback?.(null, result);
        });
    }

    private normalizeMessage(message: string | null | undefined | PushoverMessage): PushoverMessage | undefined {
        if (message === null || message === undefined) {
            return undefined;
        }

        if (typeof message === 'object' && !Array.isArray(message)) {
            return { ...(message as Record<string, unknown>) };
        }

        return { message: String(message) };
    }

    private isDuplicateMessage(json: string): boolean {
        return !!(this.lastMessageTime && this.lastMessageText === json && Date.now() - this.lastMessageTime < 1000);
    }

    private async updateLimitStates(headers: PushoverHeaders): Promise<void> {
        await this.setStateChangedAsync('app.totalLimit', {
            val: Number(headers['x-limit-app-limit']),
            ack: true,
        });
        await this.setStateChangedAsync('app.remainingLimit', {
            val: Number(headers['x-limit-app-remaining']),
            ack: true,
        });
        await this.setStateChangedAsync('app.limitRest', {
            val: Number(headers['x-limit-app-reset']) * 1000,
            ack: true,
        });
    }
}

if (require.main !== module) {
    module.exports = (options?: Partial<AdapterOptions>) => new Pushover(options);
} else {
    (() => new Pushover())();
}

import { Adapter, type AdapterOptions } from '@iobroker/adapter-core';
import axios from 'axios';
// @ts-expect-error no types
import PushoverNotifications from 'pushover-notifications';
import type { MessagePriority, MessageSound, PushoverAdapterConfig } from './types';

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
    [key: string]: unknown;
}

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
        if (obj.command === 'send' && obj.message) {
            this.processMessage(obj);
        } else if (obj.command === 'glances' && obj.message) {
            this.sendGlances(obj);
        } else if (obj.callback) {
            this.sendTo(obj.from, 'send', { error: 'Unsupported' }, obj.callback);
        }
    }

    private processMessage(obj: ioBroker.Message): void {
        const message = this.normalizeMessage(obj.message);
        if (!message) {
            return;
        }

        const json = JSON.stringify(message);
        if (this.isDuplicateMessage(json)) {
            this.log.debug(`Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`);
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
                    this.sendTo(obj.from, 'send', { err, result }, obj.callback);
                }
            });
            return;
        }

        this.sendNotification(message, (error, result) => {
            if (obj.callback) {
                this.sendTo(obj.from, 'send', { error, result }, obj.callback);
            }
        });
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

        if (!this.pushover) {
            if (this.config.user && this.config.token) {
                this.pushover = new PushoverClient({
                    user: this.config.user,
                    token: this.config.token,
                    onerror: this.onError.bind(this),
                });
            } else {
                this.log.error('Cannot send notification while not configured');
            }
        }

        if (!this.pushover) {
            callback?.('Cannot send notification while not configured');
            return;
        }

        if (Object.prototype.hasOwnProperty.call(normalizedMessage, 'token')) {
            this.pushover.token = typeof normalizedMessage.token === 'string' ? normalizedMessage.token : undefined;
        } else {
            this.pushover.token = this.config.token;
        }

        normalizedMessage.title ||= this.config.title;
        normalizedMessage.sound ||= this.config.sound || undefined;
        normalizedMessage.priority ||= this.config.priority;
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

        this.pushover.send(normalizedMessage, async (err, result, response) => {
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

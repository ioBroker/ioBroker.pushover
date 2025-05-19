'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios').default;
const PushoverNotifications = require('pushover-notifications');

class Pushover extends utils.Adapter {
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'pushover',
        });

        this.pushover = undefined;
        this.lastMessageTime = 0;
        this.lastMessageText = '';

        this.on('ready', this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
    }

    async onReady() {
        // do nothing. Only answer on messages.
        if (!this.config.user || !this.config.token) {
            this.log.error('Cannot send notification while not configured');
        }
    }

    /**
     * @param {ioBroker.Message} obj
     */
    onMessage(obj) {
        if (obj && obj.command === 'send' && obj.message) {
            this.processMessage(obj);
        } else if (obj && obj.command === 'glances' && obj.message) {
            this.sendGlances(obj);
        } else if (obj.callback) {
            this.sendTo(obj.from, 'send', { error: 'Unsupported' }, obj.callback);
        }
    }

    processMessage(obj) {
        // filter out the double messages
        const json = JSON.stringify(obj.message);
        if (
            this.lastMessageTime &&
            this.lastMessageText === JSON.stringify(obj.message) &&
            Date.now() - this.lastMessageTime < 1000
        ) {
            return this.log.debug(
                `Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`,
            );
        }

        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        if (obj.message.user && obj.message.token && obj.message.user !== this.config.user) {
            const tempPushover = new PushoverNotifications({
                user: obj.message.user,
                token: obj.message.token,
                onerror: this.onError.bind(this),
            });

            delete obj.message.user;
            delete obj.message.token;

            tempPushover.send(obj.message, (err, result, response) => {
                this.log.debug(`Pushover response: ${JSON.stringify(response && response.headers)}`);

                if (err) {
                    try {
                        this.log.error(`Cannot send notification: ${JSON.stringify(err)}`);
                    } catch (err) {
                        this.log.error(`Cannot send notification: ${err}`);
                    }
                }

                obj.callback && this.sendTo(obj.from, 'send', { err, result: result }, obj.callback);
            });
        } else {
            this.sendNotification(
                obj.message,
                (error, result) =>
                    obj.callback && this.sendTo(obj.from, 'send', { error, result: result }, obj.callback),
            );
        }
    }

    sendGlances(obj) {
        const json = JSON.stringify(obj.message);
        if (
            this.lastMessageTime &&
            this.lastMessageText === JSON.stringify(obj.message) &&
            Date.now() - this.lastMessageTime < 1000
        ) {
            return this.log.debug(
                `Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`,
            );
        }

        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        const msg = obj.message;

        const formData = {
            token: msg.token || this.config.token,
            user: msg.user || this.config.user,
            title: msg.title !== undefined ? msg.title : this.config.title,
            text: msg.message || msg.text,
            subtext: msg.subtext || undefined,
            count: msg.count || undefined,
            percent: msg.percent || undefined,
            device: msg.device || undefined,
        };

        if (formData.title && formData.title.length > 100) {
            this.log.error('Title too long. Max length is 100');
            return (
                obj.callback &&
                this.sendTo(obj.from, 'glances', { error: 'Title too long. Max length is 100' }, obj.callback)
            );
        }

        if (formData.text && formData.text.length > 100) {
            this.log.error('Text too long. Max length is 100');
            return (
                obj.callback &&
                this.sendTo(obj.from, 'glances', { error: 'Text too long. Max length is 100' }, obj.callback)
            );
        }

        if (formData.subtext && formData.subtext.length > 100) {
            this.log.error('Subtext too long. Max length is 100');
            return (
                obj.callback &&
                this.sendTo(obj.from, 'glances', { error: 'Subtext too long. Max length is 100' }, obj.callback)
            );
        }

        this.log.debug(`Sending pushover glances: ${JSON.stringify(formData)}`);

        axios
            .post('https://api.pushover.net/1/glances.json', formData)
            .then(async response => {
                this.log.debug(
                    `Pushover glances response: ${JSON.stringify(response.status)} ${JSON.stringify(response.data)}`,
                );

                await this.setStateChangedAsync('app.totalLimit', {
                    val: Number(response.headers['x-limit-app-limit']),
                    ack: true,
                });
                await this.setStateChangedAsync('app.remainingLimit', {
                    val: Number(response.headers['x-limit-app-remaining']),
                    ack: true,
                });
                await this.setStateChangedAsync('app.limitRest', {
                    val: Number(response.headers['x-limit-app-reset']) * 1000,
                    ack: true,
                });

                if (response.data.status !== 1) {
                    this.log.error(`Pushover glances error: ${JSON.stringify(response.data.errors)}`);
                    obj.callback && this.sendTo(obj.from, 'glances', { error: response.data.errors }, obj.callback);
                } else {
                    this.log.debug(`Pushover glances POST succeeded: ${JSON.stringify(response.data)}`);
                    obj.callback &&
                        this.sendTo(obj.from, 'glances', { error: null, result: response.data }, obj.callback);
                }
            })
            .catch(error => {
                this.log.error(`Pushover error: ${error}`);
                obj.callback && this.sendTo(obj.from, 'glances', { error: `Pushover error: ${error}` }, obj.callback);
            });
    }

    onError(error) {
        this.log.error(`Error from Pushover: ${error}`);
    }

    sendNotification(message, callback) {
        message ||= {};

        if (!this.pushover) {
            if (this.config.user && this.config.token) {
                this.pushover = new PushoverNotifications({
                    user: this.config.user,
                    token: this.config.token,
                    onerror: this.onError.bind(this),
                });
            } else {
                this.log.error('Cannot send notification while not configured');
            }
        }

        if (!this.pushover) {
            callback && callback('Cannot send notification while not configured');
            return;
        }

        if (typeof message !== 'object') {
            message = { message };
        }

        if (Object.prototype.hasOwnProperty.call(message, 'token')) {
            this.pushover.token = message.token;
        } else {
            this.pushover.token = this.config.token;
        }

        message.title = message.title || this.config.title;
        message.sound = message.sound || (this.config.sound ? this.config.sound : undefined);
        message.priority = message.priority || this.config.priority;
        message.message = message.message || '';

        // if timestamp in ms => makes seconds // if greater than 2000.01.01 00:00:00
        if (message.timestamp && message.timestamp > 946681200000) {
            message.timestamp = Math.round(message.timestamp / 1000);
        }

        // mandatory parameters if priority is high (2)
        if (message.priority === 2) {
            message.retry = parseInt(message.retry, 10) || 60;
            message.expire = parseInt(message.expire, 10) || 3600;
        }

        (this.config.showLog ? this.log.info : this.log.debug)(
            `Sending pushover notification: ${JSON.stringify(message)}`,
        );

        this.pushover.send(message, async (err, result, response) => {
            this.log.debug(`Pushover response: ${JSON.stringify(response && response.headers)}`);

            if (err) {
                try {
                    this.log.error(`Cannot send notification: ${JSON.stringify(err)}`);
                } catch (err) {
                    this.log.error(`Cannot send notification: ${err}`);
                }

                callback && callback(err);
                return false;
            }
            await this.setStateChangedAsync('app.totalLimit', {
                val: Number(response.headers['x-limit-app-limit']),
                ack: true,
            });
            await this.setStateChangedAsync('app.remainingLimit', {
                val: Number(response.headers['x-limit-app-remaining']),
                ack: true,
            });
            await this.setStateChangedAsync('app.limitRest', {
                val: Number(response.headers['x-limit-app-reset']) * 1000,
                ack: true,
            });

            callback && callback(null, result);
            return true;
        });
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = options => new Pushover(options);
} else {
    // otherwise start the instance directly
    new Pushover();
}

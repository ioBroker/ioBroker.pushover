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
        this.on('unload', this.onUnload.bind(this));
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
            obj.message && this.processMessage(obj);
        } else
        if (obj && obj.command === 'glances' && obj.message) {
            obj.message && this.sendGlances(obj);
        } else {
            obj.callback && this.sendTo(obj.from, 'send', { error: 'Unsupported' }, obj.callback);
        }
    }

    processMessage(obj) {
        // filter out double messages
        const json = JSON.stringify(obj.message);
        if (this.lastMessageTime && this.lastMessageText === JSON.stringify(obj.message) && Date.now() - this.lastMessageTime < 1000) {
            return this.log.debug(`Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`);
        }

        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        if (obj.message.user && obj.message.token && obj.message.user !== this.config.user) {
            const tempPushover = new PushoverNotifications({
                user: obj.message.user,
                token: obj.message.token,
                onerror: this.onError
            });

            delete obj.message.user;
            delete obj.message.token;

            tempPushover.send(obj.message, (error, response) => {
                error && this.log.error(`Cannot send test message: ${error}`);
                obj.callback && this.sendTo(obj.from, 'send', { error, result: response}, obj.callback);
            });

        } else {
            this.sendNotification(obj.message, (error, response) =>
                obj.callback && this.sendTo(obj.from, 'send', { error, result: response}, obj.callback));
        }
    }

    sendGlances(obj) {
        const json = JSON.stringify(obj.message);
        if (this.lastMessageTime && this.lastMessageText === JSON.stringify(obj.message) && Date.now() - this.lastMessageTime < 1000) {
            return this.log.debug(`Filter out double message [first was for ${Date.now() - this.lastMessageTime}ms]: ${json}`);
        }

        this.lastMessageTime = Date.now();
        this.lastMessageText = json;

        const msg = obj.message;

        const formData = {
            token:   msg.token   || this.config.token,
            user:    msg.user    || this.config.user,
            title:   msg.title !== undefined ? msg.title : this.config.title,
            text:    msg.message || msg.text,
            subtext: msg.subtext || undefined,
            count:   msg.count   || undefined,
            percent: msg.percent || undefined,
            device:  msg.device  || undefined
        };

        if (formData.title && formData.title.length > 100) {
            this.log.error('Title too long. Max length is 100');
            return obj.callback && this.sendTo(obj.from, 'glances', { error: 'Title too long. Max length is 100'}, obj.callback);
        }

        if (formData.text && formData.text.length > 100) {
            this.log.error('Text too long. Max length is 100');
            return obj.callback && this.sendTo(obj.from, 'glances', { error: 'Text too long. Max length is 100'}, obj.callback);
        }

        if (formData.subtext && formData.subtext.length > 100) {
            this.log.error('Subtext too long. Max length is 100');
            return obj.callback && this.sendTo(obj.from, 'glances', { error: 'Subtext too long. Max length is 100'}, obj.callback);
        }

        axios
            .post('https://api.pushover.net/1/glances.json', formData)
            .then(body => {
                if (body.data.status !== 1) {
                    this.log.error(`Pushover error: ${JSON.stringify(body.data.errors)}`);
                    return obj.callback && this.sendTo(obj.from, 'glances', { error: body.data.errors}, obj.callback);
                } else {
                    this.log.debug(`pushover POST succeeded: ${JSON.stringify(body.data)}`);
                    return obj.callback && this.sendTo(obj.from, 'glances', { result: body.data.status}, obj.callback);
                }
            })
            .catch(error => {
                this.log.error(`Pushover error: ${error}`);
                return obj.callback && this.sendTo(obj.from, 'glances', { error: `Pushover error: ${error}`}, obj.callback);
            });
    }

    onError(error) {
        this.log.error(`Error from Pushover: ${error}`);
    }

    sendNotification(message, callback) {
        message = message || {};

        if (!this.pushover) {
            if (this.config.user && this.config.token) {
                this.pushover = new PushoverNotifications({
                    user: this.config.user,
                    token: this.config.token,
                    onerror: this.onError
                });
            } else {
                this.log.error('Cannot send notification while not configured');
            }
        }

        if (!this.pushover) {
            return;
        }

        if (typeof message !== 'object') {
            message = { message };
        }

        if (message.hasOwnProperty('token')) {
            this.pushover.token = message.token;
        } else {
            this.pushover.token = this.config.token;
        }

        message.title     = message.title     || this.config.title;
        message.sound     = message.sound     || (this.config.sound ? this.config.sound : undefined);
        message.priority  = message.priority  || this.config.priority;
        message.url       = message.url       || this.config.url;
        message.url_title = message.url_title || this.config.url_title;
        message.device    = message.device    || this.config.device;
        message.message   = message.message   || '';

        // if timestamp in ms => make seconds // if greater than 2000.01.01 00:00:00
        if (message.timestamp && message.timestamp > 946681200000) {
            message.timestamp = Math.round(message.timestamp / 1000);
        }

        // mandatory parameters if priority is high (2)
        if (message.priority === 2) {
            message.retry  = parseInt(message.retry, 10)  || 60;
            message.expire = parseInt(message.expire, 10) || 3600;
        }

        this.log.info(`Sending pushover notification: ${JSON.stringify(message)}`);

        this.pushover.send(message, (err, result) => {
            if (err) {
                try {
                    this.log.error(`Cannot send notification: ${JSON.stringify(err)}`);
                } catch (err) {
                    this.log.error('Cannot send notification: Error');
                }
                callback && callback(err);
                return false;
            } else {
                callback && callback(null, result);
                return true;
            }
        });
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            callback();
        } catch (e) {
            callback();
        }
    }
}

if (require.main !== module) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<utils.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Pushover(options);
} else {
    // otherwise start the instance directly
    new Pushover();
}
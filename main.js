/**
 *
 *      ioBroker pushover Adapter
 *
 *      (c) 2014-2020 bluefox <dogafox@gmail.com>
 *
 *      MIT License
 *
 */

/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';
const utils        = require('@iobroker/adapter-core'); // Get common adapter utils
const Pushover    = require('pushover-notifications');
const adapterName = require('./package.json').name.split('.').pop();

let adapter;

function startAdapter(options) {
    options = options || {};
    Object.assign(options, {name: adapterName});
    adapter = new utils.Adapter(options);

    adapter.on('message', obj => obj && obj.command === 'send' && obj.message && processMessage(adapter, obj));

    adapter.on('ready', () => main(adapter));

    return adapter;
}

let pushover;
let lastMessageTime = 0;
let lastMessageText = '';

function processMessage(adapter, obj) {
    // filter out double messages
    const json = JSON.stringify(obj.message);
    if (lastMessageTime && lastMessageText === JSON.stringify(obj.message) && new Date().getTime() - lastMessageTime < 1000) {
        return adapter.log.debug('Filter out double message [first was for ' + (new Date().getTime() - lastMessageTime) + 'ms]: ' + json);
    }

    lastMessageTime = new Date().getTime();
    lastMessageText = json;

    sendNotification(adapter, obj.message, (err, response) =>
        obj.callback && adapter.sendTo(obj.from, 'send', { error: err, response: response}, obj.callback));
}

function main(adapter) {
    // do nothing. Only answer on messages.
    if (!adapter.config.user || !adapter.config.token) {
        adapter.log.error('Cannot send notification while not configured');
    }
}

function sendNotification(adapter, message, callback) {
    message = message || {};

    if (!pushover) {
        if (adapter.config.user && adapter.config.token) {
            pushover = new Pushover({
                user:  adapter.config.user,
                token: adapter.config.token
            });
        } else {
            adapter.log.error('Cannot send notification while not configured');
        }
    }

    if (!pushover) return;

    if (typeof message !== 'object') {
        message = {message};
    }
    if (message.hasOwnProperty('token')) {
        pushover.token  =  message.token
    } else {
        pushover.token  = adapter.config.token
    }
    message.title     = message.title     || adapter.config.title;
    message.sound     = message.sound     || (adapter.config.sound ? adapter.config.sound : undefined);
    message.priority  = message.priority  || adapter.config.priority;
    message.url       = message.url       || adapter.config.url;
    message.url_title = message.url_title || adapter.config.url_title;
    message.device    = message.device    || adapter.config.device;
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

    adapter.log.info('Send pushover notification: ' + JSON.stringify(message));

    pushover.send(message, (err, result) => {
        if (err) {
            adapter.log.error('Cannot send notification: ' + JSON.stringify(err));
            if (callback) callback(err);
            return false;
        } else {
            if (callback) callback(null, result);
            return true;
        }
    });
}

// If started as allInOne/compact mode => return function to create instance
if (module && module.parent) {
    module.exports = startAdapter;
} else {
    // or start the instance directly
    startAdapter();
}

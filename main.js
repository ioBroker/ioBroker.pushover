/**
 *
 *      ioBroker pushover Adapter
 *
 *      (c) 2014-2021 bluefox <dogafox@gmail.com>
 *
 *      MIT License
 *
 */

/* jshint -W097 */
/* jshint strict: false */
/* jslint node: true */
'use strict';
const utils       = require('@iobroker/adapter-core'); // Get common adapter utils
const Pushover    = require('pushover-notifications');
const adapterName = require('./package.json').name.split('.').pop();
const axios       = require('axios')
let adapter;

function startAdapter(options) {
    options = options || {};
    Object.assign(options, {name: adapterName});
    adapter = new utils.Adapter(options);

    adapter.getEncryptedConfig = adapter.getEncryptedConfig || getEncryptedConfig;

    try {
        adapter.tools = adapter.tools || require(utils.controllerDir + '/lib/tools');
        adapter.tools.migrateEncodedAttributes = adapter.tools.migrateEncodedAttributes || migrateEncodedAttributes;
    } catch (e) {
        adapter.tools = {decrypt, migrateEncodedAttributes};
    }

    adapter.on('message', obj => {
        if (obj && obj.command === 'send' && obj.message) {
            obj.message && processMessage(adapter, obj);
        } else
        if (obj && obj.command === 'glances' && obj.message) {
            obj.message && sendGlances(adapter, obj);
        } else {
            obj.callback && adapter.sendTo(obj.from, 'send', { error: 'Unsupported'}, obj.callback);
        }
    });

    adapter.on('ready', () => {
        if (!adapter.supportsFeature || !adapter.supportsFeature('ADAPTER_AUTO_DECRYPT_NATIVE')) {
            adapter.getEncryptedConfig('token')
                .then(value => {
                    adapter.config.token = value;
                    main(adapter);
                })
                .catch(e => {
                    adapter.config.token = '';
                    main(adapter);
                });
        } else {
            main(adapter);
        }
    });

    return adapter;
}

let pushover;
let lastMessageTime = 0;
let lastMessageText = '';

function processMessage(adapter, obj) {
    // filter out double messages
    const json = JSON.stringify(obj.message);
    if (lastMessageTime && lastMessageText === JSON.stringify(obj.message) && Date.now() - lastMessageTime < 1000) {
        return adapter.log.debug(`Filter out double message [first was for ${Date.now() - lastMessageTime}ms]: ${json}`);
    }

    lastMessageTime = Date.now();
    lastMessageText = json;

    if (obj.message.user && obj.message.token && obj.message.user !== adapter.config.user) {
        const tempPushover = new Pushover({
            user:  obj.message.user,
            token: obj.message.token,
            onerror: onError
        });

        delete obj.message.user;
        delete obj.message.token;

        tempPushover.send(obj.message, (error, response) => {
            error && adapter.log.error('Cannot send test message: ' + error);
            obj.callback && adapter.sendTo(obj.from, 'send', { error, result: response}, obj.callback);
        })

    } else {
        sendNotification(adapter, obj.message, (error, response) =>
            obj.callback && adapter.sendTo(obj.from, 'send', { error, result: response}, obj.callback));
    }
}

function migrateEncodedAttributes(adapter, attrs, onlyRename) {
    if (typeof attrs === 'string') {
        attrs = [attrs];
    }
    const toMigrate = [];
    attrs.forEach(attr =>
        adapter.config[attr] !== undefined && adapter.config['enc_' + attr] === undefined && toMigrate.push(attr));

    if (toMigrate.length) {
        return new Promise((resolve, reject) => {
            // read system secret
            adapter.getForeignObject('system.config', null, (err, data) => {
                let systemSecret;
                if (data && data.native) {
                    systemSecret = data.native.secret;
                }
                if (systemSecret) {
                    // read instance configuration
                    adapter.getForeignObject('system.adapter.' + adapter.namespace, (err, obj) => {
                        if (obj && obj.native) {
                            toMigrate.forEach(attr => {
                                if (obj.native[attr]) {
                                    if (onlyRename) {
                                        obj.native['enc_' + attr] = obj.native[attr];
                                    } else {
                                        obj.native['enc_' + attr] = adapter.tools.encrypt(systemSecret, obj.native[attr]);
                                    }
                                } else {
                                    obj.native['enc_' + attr] = '';
                                }
                                delete obj.native[attr];
                            });
                            adapter.setForeignObject('system.adapter.' + adapter.namespace, obj, err => {
                                err && adapter.log.error(`Cannot write system.adapter.${adapter.namespace}: ${err}`);
                                !err && adapter.log.info('Attributes are migrated and adapter will be restarted');
                                err ? reject(err) : resolve(true);
                            });
                        } else {
                            adapter.log.error(`system.adapter.${adapter.namespace} not found!`);
                            reject(`system.adapter.${adapter.namespace} not found!`);
                        }
                    });
                } else {
                    adapter.log.error('No system secret found!');
                    reject('No system secret found!');
                }
            });
        })
    } else {
        return Promise.resolve(false);
    }
}

function getEncryptedConfig(attribute, callback) {
    if (adapter.config.hasOwnProperty(attribute)) {
        if (typeof callback !== 'function') {
            return new Promise((resolve, reject) => {
                getEncryptedConfig(attribute, (err, encrypted) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(encrypted);
                    }
                });
            });
        } else {
            adapter.getForeignObject('system.config', null, (err, data) => {
                let systemSecret;
                if (data && data.native) {
                    systemSecret = data.native.secret;
                }
                callback(null, adapter.tools.decrypt(systemSecret, adapter.config[attribute]));
            });
        }
    } else {
        if (typeof callback === 'function') {
            callback('Attribute not found');
        } else {
            return Promise.reject('Attribute not found');
        }
    }
}

function sendGlances(adapter, obj) {
    const json = JSON.stringify(obj.message);
    if (lastMessageTime && lastMessageText === JSON.stringify(obj.message) && Date.now() - lastMessageTime < 1000) {
        return adapter.log.debug(`Filter out double message [first was for ${Date.now() - lastMessageTime}ms]: ${json}`);
    }

    lastMessageTime = Date.now();
    lastMessageText = json;

    const msg = obj.message;

    let formData = {
        token:   msg.token   || adapter.config.token,
        user:    msg.user    || adapter.config.user,
        title:   msg.title !== undefined ? msg.title : adapter.config.title,
        text:    msg.message || msg.text,
        subtext: msg.subtext || undefined,
        count:   msg.count   || undefined,
        percent: msg.percent || undefined,
        device:  msg.device  || undefined
    };
    if (formData.title && formData.title.length > 100) {
        adapter.log.error('Title too long. Max length is 100');
        return obj.callback && adapter.sendTo(obj.from, 'glances', { error: 'Title too long. Max length is 100'}, obj.callback);
    }
    if (formData.text && formData.text.length > 100) {
        adapter.log.error('Text too long. Max length is 100');
        return obj.callback && adapter.sendTo(obj.from, 'glances', { error: 'Text too long. Max length is 100'}, obj.callback);
    }
    if (formData.subtext && formData.subtext.length > 100) {
        adapter.log.error('Subtext too long. Max length is 100');
        return obj.callback && adapter.sendTo(obj.from, 'glances', { error: 'Subtext too long. Max length is 100'}, obj.callback);
    }

    axios
        .post('https://api.pushover.net/1/glances.json', formData)
        .then(body => {
            if (body.data.status !== 1) {
                adapter.log.error('Pushover error: ' + JSON.stringify(body.data.errors));
                return obj.callback && adapter.sendTo(obj.from, 'glances', { error: body.data.errors}, obj.callback);
            } else {
                adapter.log.debug('pushover POST succeeded:\n' + JSON.stringify(body.data));
                return obj.callback && adapter.sendTo(obj.from, 'glances', { result: body.data.status}, obj.callback);
            }
        })
        .catch(error => {
            adapter.log.error('Pushover error: ' + error);
            return obj.callback && adapter.sendTo(obj.from, 'glances', { error: 'Pushover error: ' + error}, obj.callback);
        });
}

/**
 * Decrypt the password/value with given key
 * @param {string} key - Secret key
 * @param {string} value - value to decript
 * @returns {string}
 */
function decrypt(key, value) {
    let result = '';
    for(let i = 0; i < value.length; i++) {
        result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ value.charCodeAt(i));
    }
    return result;
}

function main(adapter) {
    // do nothing. Only answer on messages.
    if (!adapter.config.user || !adapter.config.token) {
        adapter.log.error('Cannot send notification while not configured');
    }
}

function onError(error, _res) {
    adapter.log.error('Error from Pushover: ' + error);
}

function sendNotification(adapter, message, callback) {
    message = message || {};

    if (!pushover) {
        if (adapter.config.user && adapter.config.token) {
            pushover = new Pushover({
                user:  adapter.config.user,
                token: adapter.config.token,
                onerror: onError
            });
        } else {
            adapter.log.error('Cannot send notification while not configured');
        }
    }

    if (!pushover) {
        return;
    }

    if (typeof message !== 'object') {
        message = {message};
    }
    if (message.hasOwnProperty('token')) {
        pushover.token = message.token;
    } else {
        pushover.token = adapter.config.token;
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
            callback && callback(err);
            return false;
        } else {
            callback && callback(null, result);
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

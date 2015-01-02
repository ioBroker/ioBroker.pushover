/**
 *
 *      ioBroker pushover Adapter
 *
 *      (c) 2014 bluefox
 *
 *      MIT License
 *
 */

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var po_notif = require('pushover-notifications');

var adapter = utils.adapter('pushover');

adapter.on('message', function (obj) {
    if (obj && obj.command == "send") processMessage(obj.message);
    processMessages();
});

adapter.on('ready', function () {
    main();
});

var stopTimer = null;
var pushover;

// Terminate adapter after 30 seconds idle
function stop() {
    if (stopTimer) {
        clearTimeout(stopTimer);
    }

    // Stop only if subscribe mode
    if (adapter.common && adapter.common.mode == 'subscribe') {
        stopTimer = setTimeout(function () {
            stopTimer = null;
            adapter.stop();
        }, 30000);
    }
}

function processMessage(message) {
    if (stopTimer) {
        clearTimeout(stopTimer);
    }

    sendNotification(message);

    stop();
}

function processMessages() {
    adapter.getMessage(function (err, obj) {
        if (obj) {
            processMessage(obj.message);
            processMessages();
        }
    });
}

function main() {
    // Adapter is started only if some one writes into "system.adapter.pushover.X.messagebox" new value
    processMessages();
    stop();
}

function sendNotification(message, callback) {
    if (!message) {
        message = {};
    }
    
    if (!pushover) {
        if (adapter.config.user && adapter.config.token) {
            pushover = new po_notif({
                user:  adapter.config.user,
                token: adapter.config.token
            });
        } else {
            adapter.log.error("Cannot send notification while not configured");
        }
    }

    if (!pushover) return;

    if (typeof message != "object") {
        message = {message: message};
    }

    message.title     = message.title     || adapter.config.title;
    message.sound     = message.sound     || (adapter.config.sound ? adapter.config.sound : undefined);
    message.priority  = message.priority  || adapter.config.priority;
    message.url       = message.url       || adapter.config.url;
    message.url_title = message.url_title || adapter.config.url_title;
    message.device    = message.device    || adapter.config.device;

    adapter.log.info("Send pushover notification: " + JSON.stringify(message));

    pushover.send(message, function (err, result) {
        if (err) {
            adapter.log.error('Cannot send notification: ' + JSON.stringify(err));
            if (callback) callback(err);
            return false;
        } else {
            if (callback) callback();
            return true;
        }
    });
}

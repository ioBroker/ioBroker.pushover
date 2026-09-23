"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotificationMessage = isNotificationMessage;
exports.formatNotification = formatNotification;
function isNotificationMessage(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const category = value.category;
    if (!category || typeof category !== 'object') {
        return false;
    }
    const instances = category.instances;
    return !!instances && typeof instances === 'object' && !Array.isArray(instances);
}
/** Builds the title and the text of a pushover message from a notification */
function formatNotification(notification) {
    const instances = Object.entries(notification.category.instances).map(([instance, entry]) => {
        const messages = Array.isArray(entry?.messages) ? entry.messages : [];
        const newestMessage = [...messages].sort((a, b) => b.ts - a.ts)[0];
        const instanceName = instance.startsWith('system.adapter.')
            ? instance.substring('system.adapter.'.length)
            : instance;
        if (!newestMessage) {
            return instanceName;
        }
        return `${instanceName}: ${new Date(newestMessage.ts).toLocaleString()} ${newestMessage.message}`;
    });
    const description = notification.category.description ? `${notification.category.description}\n` : '';
    const host = notification.host ? `${notification.host}:\n` : '';
    return {
        title: notification.category.name || '',
        message: `${description}${host}${instances.join('\n')}`,
    };
}

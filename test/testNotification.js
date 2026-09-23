const assert = require('node:assert');
const { formatNotification, isNotificationMessage } = require('../build/notification');

const notification = {
    host: 'system.host.raspi',
    scope: { id: 'system', name: 'System', description: 'System notifications' },
    category: {
        id: 'restartLoop',
        name: 'Adapter restart loop',
        description: 'An adapter was restarted too often.',
        severity: 'alert',
        instances: {
            'system.adapter.hm-rpc.0': {
                messages: [
                    { ts: 1000, message: 'old message' },
                    { ts: 3000, message: 'newest message' },
                    { ts: 2000, message: 'middle message' },
                ],
            },
            'system.adapter.zigbee.0': { messages: [] },
        },
    },
};

describe('notification', () => {
    it('accepts a notification of the notification-manager', () => {
        assert.strictEqual(isNotificationMessage(notification), true);
    });

    it('rejects invalid payloads', () => {
        for (const value of [undefined, null, 'text', 5, [], {}, { category: 'x' }, { category: {} }]) {
            assert.strictEqual(isNotificationMessage(value), false, JSON.stringify(value));
        }
        assert.strictEqual(isNotificationMessage({ category: { instances: [] } }), false);
    });

    it('formats title and message', () => {
        const { title, message } = formatNotification(notification);
        assert.strictEqual(title, 'Adapter restart loop');

        const lines = message.split('\n');
        assert.strictEqual(lines[0], 'An adapter was restarted too often.');
        assert.strictEqual(lines[1], 'system.host.raspi:');
        assert.strictEqual(lines[2], `hm-rpc.0: ${new Date(3000).toLocaleString()} newest message`);
        assert.strictEqual(lines[3], 'zigbee.0');
        assert.strictEqual(lines.length, 4);
    });

    it('tolerates missing optional fields', () => {
        const { title, message } = formatNotification({ category: { instances: { 'javascript.0': {} } } });
        assert.strictEqual(title, '');
        assert.strictEqual(message, 'javascript.0');
    });
});

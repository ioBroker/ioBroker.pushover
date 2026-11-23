const assert = require('node:assert');
const { EventEmitter } = require('node:events');
const path = require('node:path');

const buildDir = path.join(__dirname, '../build');
const mainPath = require.resolve('../build/main');

/** Puts a fake module into the require cache as the build would resolve it */
function fakeModule(name, exports) {
    const filename = require.resolve(name, { paths: [buildDir] });
    require.cache[filename] = { id: filename, filename, loaded: true, exports };
    return filename;
}

/**
 * The adapter with a fake adapter core and a fake Pushover client that fails with `error` (or succeeds without one);
 * `pushed` gets the messages as they go to the client
 */
function createAdapter(sent, error, pushed = []) {
    class FakeAdapter extends EventEmitter {
        constructor() {
            super();
            this.config = { user: 'user1', token: 'token1' };
            this.log = { debug() {}, info() {}, warn() {}, error() {} };
        }
        sendTo(from, command, message) {
            sent.push({ command, message });
        }
        setStateChangedAsync() {
            return Promise.resolve();
        }
    }
    function FakePushover() {}
    FakePushover.prototype.send = (message, callback) => {
        pushed.push({ ...message });
        error ? callback(error) : callback(null, '{"status":1}', { headers: {} });
    };

    const fakes = [
        fakeModule('@iobroker/adapter-core', { Adapter: FakeAdapter }),
        fakeModule('pushover-notifications', FakePushover),
    ];
    delete require.cache[mainPath];
    try {
        return require(mainPath)();
    } finally {
        for (const filename of [...fakes, mainPath]) {
            delete require.cache[filename];
        }
    }
}

/** Sends `message` with the command send and returns the answers, as they arrive over sendTo */
function send(error, message) {
    const sent = [];
    const adapter = createAdapter(sent, error);
    adapter.emit('message', { command: 'send', from: 'system.adapter.javascript.0', callback: { id: 1 }, message });
    return JSON.parse(JSON.stringify(sent));
}

describe('send', () => {
    it('answers error with another user and token, and keeps err', () => {
        assert.deepStrictEqual(send('connect ECONNREFUSED', { message: 'test', user: 'user2', token: 'token2' }), [
            { command: 'send', message: { error: 'connect ECONNREFUSED', err: 'connect ECONNREFUSED' } },
        ]);
    });

    it('answers the text of an Error object with another user and token', () => {
        const answers = send(new Error('connect ECONNREFUSED'), { message: 'test', user: 'user2', token: 'token2' });
        assert.deepStrictEqual(answers, [
            { command: 'send', message: { error: 'connect ECONNREFUSED', err: 'connect ECONNREFUSED' } },
        ]);
    });

    it('answers the text of an Error object with the user of the settings', () => {
        assert.deepStrictEqual(send(new Error('connect ECONNREFUSED'), { message: 'test' }), [
            { command: 'send', message: { error: 'connect ECONNREFUSED' } },
        ]);
    });
});

describe('send with the names of the shared catalog', () => {
    /** Sends the messages one after the other and returns the answers and what went to Pushover */
    async function sendAll(...messages) {
        const sent = [];
        const pushed = [];
        const adapter = createAdapter(sent, null, pushed);
        for (const [i, message] of messages.entries()) {
            adapter.emit('message', {
                command: 'send',
                from: 'system.adapter.javascript.0',
                callback: { id: i + 1 },
                message,
            });
            await new Promise(resolve => setImmediate(resolve));
        }
        return { answers: JSON.parse(JSON.stringify(sent)), pushed };
    }

    it('takes text as message and recipient as device', async () => {
        const { answers, pushed } = await sendAll({ text: 'hello', recipient: 'phone', title: 'T' });
        assert.deepStrictEqual(answers, [{ command: 'send', message: { error: null, result: '{"status":1}' } }]);
        assert.strictEqual(pushed[0].message, 'hello');
        assert.strictEqual(pushed[0].device, 'phone');
        assert.strictEqual(pushed[0].title, 'T');
        assert.ok(!('text' in pushed[0]) && !('recipient' in pushed[0]));
    });

    it('lets message and device win', async () => {
        const { pushed } = await sendAll({ message: 'm', text: 't', device: 'd', recipient: 'r' });
        assert.strictEqual(pushed[0].message, 'm');
        assert.strictEqual(pushed[0].device, 'd');
    });

    it('answers a double message', async () => {
        const { answers, pushed } = await sendAll({ message: 'twice' }, { message: 'twice' });
        assert.strictEqual(pushed.length, 1);
        assert.deepStrictEqual(answers[1], {
            command: 'send',
            message: { error: 'The same message was sent less than 1 s ago', reason: 'DUPLICATE' },
        });
    });
});

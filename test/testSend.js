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
function createAdapter(sent, error, pushed = [], result = '{"status":1}') {
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
        async readFileAsync(adapter, file) {
            if (adapter === 'camera.0' && file === 'snap.jpg') {
                return { file: Buffer.from('jpeg'), mimeType: 'image/jpeg' };
            }
            throw new Error('Not exists');
        }
    }
    function FakePushover() {}
    FakePushover.prototype.send = (message, callback) => {
        pushed.push({ ...message });
        error ? callback(error) : callback(null, result, { headers: {} });
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

describe('message.send of the shared catalog', () => {
    /**
     * Sends with the command message.send and returns the answers and what went to Pushover; error and result as
     * the Pushover client gives them
     */
    async function standardSend(message, { error = null, result, callback = true } = {}) {
        const sent = [];
        const pushed = [];
        const adapter = createAdapter(sent, error, pushed, result);
        adapter.emit('message', {
            command: 'message.send',
            from: 'system.adapter.assistant.0',
            ...(callback ? { callback: { id: 1 } } : {}),
            message,
        });
        await new Promise(resolve => setTimeout(resolve, 10));
        return { answers: JSON.parse(JSON.stringify(sent)), pushed };
    }

    it('maps text, recipient, title and priority and answers ok without error', async () => {
        const { answers, pushed } = await standardSend({
            text: 'Door open',
            recipient: ['phone', 'tablet'],
            title: 'Alarm',
            priority: 'high',
            sound: 'siren',
        });
        assert.deepStrictEqual(answers, [{ command: 'message.send', message: { ok: true, sent: 1 } }]);
        assert.strictEqual(pushed[0].message, 'Door open');
        assert.strictEqual(pushed[0].device, 'phone,tablet');
        assert.strictEqual(pushed[0].title, 'Alarm');
        assert.strictEqual(pushed[0].priority, 1);
        assert.strictEqual(pushed[0].sound, 'siren');
        for (const key of ['text', 'recipient', 'file', 'files', 'contentType']) {
            assert.ok(!(key in pushed[0]), key);
        }
    });

    it('takes a picture as {data, contentType}, data URL, base64 with contentType and iobfile://', async () => {
        const jpeg = Buffer.from('jpeg');
        const base64 = jpeg.toString('base64');
        for (const [message, name, type] of [
            [{ text: 'a', file: { data: base64, contentType: 'image/jpeg' } }, 'picture.jpeg', 'image/jpeg'],
            [{ text: 'b', files: [`data:image/png;base64,${base64}`] }, 'picture.png', 'image/png'],
            [{ text: 'c', file: base64, contentType: 'image/webp' }, 'picture.webp', 'image/webp'],
            [{ text: 'd', file: 'iobfile://camera.0/snap.jpg' }, 'snap.jpg', 'image/jpeg'],
        ]) {
            const { answers, pushed } = await standardSend(message);
            assert.deepStrictEqual(answers[0].message, { ok: true, sent: 1 }, message.text);
            assert.strictEqual(pushed[0].file.name, name);
            assert.strictEqual(pushed[0].file.type, type);
            assert.ok(Buffer.from(pushed[0].file.data).equals(jpeg));
        }
    });

    it('refuses what Pushover cannot take before sending', async () => {
        const picture = { data: 'AAAA', contentType: 'image/png' };
        for (const [message, reason] of [
            [{ title: 'no text' }, 'BAD_REQUEST'],
            [{ text: 'x', priority: 5 }, 'BAD_REQUEST'],
            [{ text: 'x', files: [picture, picture] }, 'NOT_SUPPORTED'],
            [{ text: 'x', file: { data: 'AAAA', contentType: 'application/pdf' } }, 'NOT_SUPPORTED'],
            [{ text: 'x', file: '/opt/iobroker/picture.jpg' }, 'BAD_REQUEST'],
            [{ text: 'x', file: 'iobfile://camera.0/missing.jpg' }, 'BAD_REQUEST'],
        ]) {
            const { answers, pushed } = await standardSend(message);
            assert.strictEqual(answers[0].message.reason, reason, JSON.stringify(message));
            assert.ok(answers[0].message.error);
            assert.strictEqual(pushed.length, 0);
        }
    });

    it('answers the errors of Pushover with a reason', async () => {
        let { answers } = await standardSend(
            { text: 'x', recipient: 'watch' },
            { result: '{"device":"invalid","errors":["device name is not valid for user"],"status":0}' },
        );
        assert.deepStrictEqual(answers[0].message, { error: 'device name is not valid for user', reason: 'NOT_FOUND' });
        ({ answers } = await standardSend({ text: 'x' }, { error: new Error('connect ECONNREFUSED 1.2.3.4:443') }));
        assert.deepStrictEqual(answers[0].message, {
            error: 'connect ECONNREFUSED 1.2.3.4:443',
            reason: 'NOT_CONNECTED',
        });
        ({ answers } = await standardSend({ text: 'x', priority: 2 }, { result: '{"status":1,"receipt":"r1"}' }));
        assert.deepStrictEqual(answers[0].message, { ok: true, sent: 1, receipt: 'r1' });
    });

    it('sends without a callback too', async () => {
        const { answers, pushed } = await standardSend('just a text', { callback: false });
        assert.strictEqual(pushed[0].message, 'just a text');
        assert.deepStrictEqual(answers, []);
    });
});

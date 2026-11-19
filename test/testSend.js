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

/** The adapter with a fake adapter core and a fake Pushover client that fails with `error` */
function createAdapter(sent, error) {
    class FakeAdapter extends EventEmitter {
        constructor() {
            super();
            this.config = { user: 'user1', token: 'token1' };
            this.log = { debug() {}, info() {}, warn() {}, error() {} };
        }
        sendTo(from, command, message) {
            sent.push({ command, message });
        }
    }
    function FakePushover() {}
    FakePushover.prototype.send = (message, callback) => callback(error);

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

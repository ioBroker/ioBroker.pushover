const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { COMMANDS, HELP } = require('../build/help');

/** The commands of `onMessage` in src/main.ts */
function commandsOfMain() {
    const source = fs.readFileSync(path.join(__dirname, '../src/main.ts'), 'utf8');
    const start = source.indexOf('private onMessage(');
    const end = source.indexOf('private processNotification(');
    assert.ok(start > 0 && end > start, 'onMessage found');
    return [...source.slice(start, end).matchAll(/obj\.command === '([^']+)'/g)].map(m => m[1]);
}

describe('help', () => {
    it('lists exactly the commands onMessage answers', () => {
        assert.deepStrictEqual(COMMANDS.map(c => c.command).sort(), commandsOfMain().sort());
    });

    it('marks only help as read-only', () => {
        for (const { command, write } of COMMANDS) {
            assert.strictEqual(write, command !== 'help', command);
        }
    });

    it('marks message.send by its full name (send answers error: null on success)', () => {
        assert.deepStrictEqual(
            COMMANDS.filter(c => c.standard),
            [{ command: 'message.send', write: true, standard: 'message.send' }],
        );
        assert.ok(!COMMANDS.find(c => c.command === 'send').standard);
        assert.ok(HELP.includes('message.send {text, recipient?, title?, file?, priority?}'));
    });

    it('names every command for an agent', () => {
        for (const word of [...COMMANDS.map(c => c.command), 'sendTo pushover.0', "user's explicit request"]) {
            assert.ok(HELP.includes(word), word);
        }
    });

    it('keeps the lines short', () => {
        for (const line of HELP.split('\n')) {
            assert.ok(line.length <= 120, line);
        }
    });
});

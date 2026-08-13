/**
 * Pieces both pushover blocks share.
 */
import type { Block, Input } from 'blockly/core';

const Blockly = window.Blockly;

/**
 * The instance dropdown: every `pushover.x` the admin knows about, or `pushover.0` .. `pushover.4`
 * while the editor has not reported any instances yet.
 */
export function instanceOptions(): [string, string][] {
    const options: [string, string][] = [[Blockly.Translate('pushover_anyInstance'), '']];

    const instances = window.main?.instances;
    if (instances) {
        for (let i = 0; i < instances.length; i++) {
            const m = instances[i].match(/^system\.adapter\.pushover\.(\d+)$/);
            if (m) {
                const n = parseInt(m[1], 10);
                options.push([`pushover.${n}`, `.${n}`]);
            }
        }
    }

    // Nothing but "all instances" so far - the editor does not know any pushover instance (yet),
    // so offer the usual ones. The original guarded this with `!options.length`, which can never be
    // true because "all instances" is already in, leaving the dropdown with that single entry.
    if (options.length === 1) {
        for (let n = 0; n <= 4; n++) {
            options.push([`pushover.${n}`, `.${n}`]);
        }
    }

    return options;
}

/** The log level dropdown. The values are console method names, an empty one means "do not log". */
export function logLevelOptions(): [string, string][] {
    return [
        [Blockly.Translate('pushover_log_none'), ''],
        [Blockly.Translate('pushover_log_info'), 'log'],
        [Blockly.Translate('pushover_log_debug'), 'debug'],
        [Blockly.Translate('pushover_log_warn'), 'warn'],
        [Blockly.Translate('pushover_log_error'), 'error'],
    ];
}

/**
 * The log line the blocks append after the `sendTo`.
 *
 * `valueToCode` yields an empty string for an unconnected input, so appending the message
 * unconditionally would emit `console.log('…' + );` and break the user's whole script.
 *
 * @param logLevel console method to call, empty when logging is switched off
 * @param prefix what the message starts with, e.g. `pushover.0 (glances)`
 * @param message generated code of the message
 */
export function logLine(logLevel: string, prefix: string, message: string): string {
    if (!logLevel) {
        return '';
    }
    return `console.${logLevel}('${prefix}: '${message ? ` + ${message}` : ''});\n`;
}

/**
 * Marks an input as one the user may leave unconnected.
 *
 * @param input the input to mark
 */
export function makeOptional(input: Input): void {
    if (input.connection) {
        // Blockly has no public API for an optional input
        (input.connection as unknown as { _optional: boolean })._optional = true;
    }
}

/**
 * Registers a generator. Blockly >= 10 looks it up in `forBlock`; registering on the plain slot is
 * not enough, because the editor migrates that slot to `forBlock` before it loads any adapter's
 * `blockly.js`, so an adapter registering the old way is never migrated.
 *
 * @param type block type
 * @param generator turns a block of that type into JavaScript
 */
export function registerGenerator(type: string, generator: (block: Block) => string): void {
    if (Blockly.JavaScript.forBlock) {
        Blockly.JavaScript.forBlock[type] = generator;
    } else {
        Blockly.JavaScript[type] = generator;
    }
}

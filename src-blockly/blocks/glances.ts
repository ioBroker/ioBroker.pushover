/**
 * `glances` - send a short status line to the Pushover Glances widget.
 */
import type { Block } from 'blockly/core';

import { instanceOptions, logLevelOptions, logLine, makeOptional, registerGenerator } from '../helpers';

const Blockly = window.Blockly;

export function installGlances(): void {
    Blockly.Sendto.blocks.glances = `<block type="glances">
  <field name="INSTANCE"></field>
  <field name="LOG"></field>
  <value name="MESSAGE">
    <shadow type="text">
      <field name="TEXT">text</field>
    </shadow>
  </value>
</block>`;

    Blockly.Blocks.glances = {
        init: function (this: Block): void {
            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Translate('glances'))
                .appendField(new Blockly.FieldDropdown(instanceOptions()), 'INSTANCE');

            this.appendValueInput('MESSAGE').appendField(Blockly.Translate('pushover_message'));

            for (const [name, word, check] of [
                ['TITLE', 'pushover_title', 'String'],
                ['SUBTEXT', 'glances_subtext', 'String'],
                ['COUNT', 'glances_count', 'Number'],
                // the original had 'number' here, which matches no output type at all - a number
                // block could not be plugged into this input
                ['PERCENT', 'glances_percent', 'Number'],
                ['DEVICE', 'pushover_device', 'String'],
            ] as const) {
                makeOptional(this.appendValueInput(name).setCheck(check).appendField(Blockly.Translate(word)));
            }

            this.appendDummyInput('LOG')
                .appendField(Blockly.Translate('pushover_log'))
                .appendField(new Blockly.FieldDropdown(logLevelOptions()), 'LOG');

            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);

            this.setColour(Blockly.Sendto.HUE);
            this.setTooltip(Blockly.Translate('pushover_tooltip'));
            this.setHelpUrl(Blockly.Translate('pushover_help'));
        },
    };

    registerGenerator('glances', (block: Block): string => {
        const instance = block.getFieldValue('INSTANCE');
        const logLevel = block.getFieldValue('LOG');
        const message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);

        const lines = ['{\n'];
        // an unconnected message input yields no code at all - `message: ,` would not parse
        if (message) {
            lines.push(`  message: ${message},\n`);
        }

        // Glances wants whole numbers. The value is generated code, not a number, so it has to be
        // rounded where the script runs - `parseInt` on the code itself yields NaN for anything
        // that is not a bare literal, a variable for instance.
        for (const [input, key] of [
            ['COUNT', 'count'],
            ['PERCENT', 'percent'],
        ] as const) {
            const value = Blockly.JavaScript.valueToCode(block, input, Blockly.JavaScript.ORDER_ATOMIC);
            if (value) {
                lines.push(`  ${key}: parseInt(${value}, 10),\n`);
            }
        }

        for (const [input, key] of [
            ['SUBTEXT', 'subtext'],
            ['TITLE', 'title'],
            ['DEVICE', 'device'],
        ] as const) {
            const value = Blockly.JavaScript.valueToCode(block, input, Blockly.JavaScript.ORDER_ATOMIC);
            if (value) {
                lines.push(`  ${key}: ${value},\n`);
            }
        }

        lines.push('}');

        return `sendTo('pushover${instance}', 'glances', ${lines.join('')});\n${logLine(logLevel, `pushover${instance} (glances)`, message)}`;
    });
}

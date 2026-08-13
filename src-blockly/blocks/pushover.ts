/**
 * `pushover` - send a notification.
 */
import type { Block } from 'blockly/core';

import { instanceOptions, logLevelOptions, logLine, makeOptional, registerGenerator } from '../helpers';
import { soundOptions } from '../sounds';

const Blockly = window.Blockly;

export function installPushover(): void {
    Blockly.Sendto.blocks.pushover = `<block type="pushover">
  <field name="INSTANCE"></field>
  <field name="SOUND"></field>
  <field name="PRIORITY">0</field>
  <field name="LOG"></field>
  <value name="MESSAGE">
    <shadow type="text">
      <field name="TEXT">text</field>
    </shadow>
  </value>
  <value name="SOUND_CUSTOM">
    <shadow type="text">
      <field name="TEXT"></field>
    </shadow>
  </value>
</block>`;

    Blockly.Blocks.pushover = {
        init: function (this: Block): void {
            this.appendDummyInput('INSTANCE')
                .appendField(Blockly.Translate('pushover'))
                .appendField(new Blockly.FieldDropdown(instanceOptions()), 'INSTANCE');

            this.appendValueInput('MESSAGE').appendField(Blockly.Translate('pushover_message'));

            this.appendDummyInput('SOUND')
                .appendField(Blockly.Translate('pushover_sound'))
                .appendField(new Blockly.FieldDropdown(soundOptions()), 'SOUND');

            this.appendValueInput('SOUND_CUSTOM')
                .setCheck(null)
                .appendField(Blockly.Translate('pushover_custom_sound'));

            this.appendDummyInput('PRIORITY')
                .appendField(Blockly.Translate('pushover_priority'))
                .appendField(
                    new Blockly.FieldDropdown([
                        [Blockly.Translate('pushover_normal'), '0'],
                        [Blockly.Translate('pushover_high'), '1'],
                        [Blockly.Translate('pushover_quiet'), '-1'],
                        [Blockly.Translate('pushover_lowest'), '-2'],
                        [Blockly.Translate('pushover_confirmation'), '2'],
                    ]),
                    'PRIORITY',
                );

            for (const [name, word, check] of [
                ['TITLE', 'pushover_title', 'String'],
                ['URL', 'pushover_url', 'String'],
                ['URL_TITLE', 'pushover_url_title', 'String'],
                ['ATTACHMENT', 'pushover_attachment', 'String'],
                ['DEVICE', 'pushover_device', 'String'],
                ['TAGS', 'pushover_tags', 'String'],
                ['TIMESTAMP', 'pushover_timestamp', 'Date'],
            ] as const) {
                makeOptional(this.appendValueInput(name).setCheck(check).appendField(Blockly.Translate(word)));
            }

            this.appendDummyInput('LOG')
                .appendField(Blockly.Translate('pushover_log'))
                .appendField(new Blockly.FieldDropdown(logLevelOptions()), 'LOG');

            makeOptional(
                this.appendValueInput('TTL').setCheck('Number').appendField(Blockly.Translate('pushover_ttl')),
            );

            this.appendDummyInput('FORMAT')
                .appendField(Blockly.Translate('pushover_format'))
                .appendField(
                    new Blockly.FieldDropdown([
                        [Blockly.Translate('pushover_format_none'), 'none'],
                        [Blockly.Translate('pushover_format_html'), 'html'],
                        [Blockly.Translate('pushover_format_mono'), 'monospace'],
                    ]),
                    'FORMAT',
                );

            this.setInputsInline(false);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);

            this.setColour(Blockly.Sendto.HUE);
            this.setTooltip(Blockly.Translate('pushover_tooltip'));
            this.setHelpUrl(Blockly.Translate('pushover_help'));
        },
    };

    registerGenerator('pushover', (block: Block): string => {
        const instance = block.getFieldValue('INSTANCE');
        const logLevel = block.getFieldValue('LOG');
        const message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
        const customSound = Blockly.JavaScript.valueToCode(block, 'SOUND_CUSTOM', Blockly.JavaScript.ORDER_ATOMIC);

        const lines = ['{\n'];
        // an unconnected message input yields no code at all - `message: ,` would not parse
        if (message) {
            lines.push(`  message: ${message},\n`);
        }
        if (customSound && customSound !== "''") {
            lines.push(`  sound: ${customSound},\n`);
        } else {
            lines.push(`  sound: '${block.getFieldValue('SOUND')}',\n`);
        }

        const priority = parseInt(block.getFieldValue('PRIORITY'), 10);
        if (priority) {
            lines.push(`  priority: ${priority},\n`);

            if (priority === 2) {
                // Pushover requires both for a notification that has to be acknowledged
                lines.push('  retry: 60,\n');
                lines.push('  expire: 3600,\n');
            }
        }

        for (const [input, key] of [
            ['URL', 'url'],
            ['URL_TITLE', 'url_title'],
            ['ATTACHMENT', 'file'],
            ['TITLE', 'title'],
            ['DEVICE', 'device'],
            ['TAGS', 'tags'],
            ['TIMESTAMP', 'timestamp'],
            ['TTL', 'ttl'],
        ] as const) {
            const value = Blockly.JavaScript.valueToCode(block, input, Blockly.JavaScript.ORDER_ATOMIC);
            if (value) {
                lines.push(`  ${key}: ${value},\n`);
            }
        }

        switch (block.getFieldValue('FORMAT')) {
            case 'html':
                lines.push('  html: 1,\n');
                break;
            case 'monospace':
                lines.push('  monospace: 1,\n');
                break;
            default:
                break;
        }

        lines.push('}');

        return `sendTo('pushover${instance}', 'send', ${lines.join('')});\n${logLine(logLevel, `pushover${instance}`, message)}`;
    });
}

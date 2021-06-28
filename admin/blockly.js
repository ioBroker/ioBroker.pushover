'use strict';

if (typeof goog !== 'undefined') {
    goog.provide('Blockly.JavaScript.Sendto');

    goog.require('Blockly.JavaScript');
}

// remove it somewhere, because it defined in javascript=>blocks_words.js from javascript>=4.6.0
Blockly.Translate = Blockly.Translate || function (word, lang) {
    lang = lang || systemLang;
    if (Blockly.Words && Blockly.Words[word]) {
        return Blockly.Words[word][lang] || Blockly.Words[word].en;
    } else {
        return word;
    }
};

/// --- SendTo pushover --------------------------------------------------
Blockly.Words['pushover']               = {'en': 'pushover',                    'de': 'pushover',                           'ru': 'pushover'};
Blockly.Words['pushover_message']       = {'en': 'message',                     'de': 'Meldung',                            'ru': 'сообщение'};
Blockly.Words['pushover_title']         = {'en': 'title (optional)',            'de': 'Betreff (optional)',                 'ru': 'заголовок (не обяз.)'};
Blockly.Words['pushover_sound']         = {'en': 'sound',                       'de': 'Klang',                              'ru': 'звук'};
Blockly.Words['pushover_priority']      = {'en': 'priority',                    'de': 'Priorität',                          'ru': 'приоритет'};
Blockly.Words['pushover_url']           = {'en': 'URL (optional)',              'de': 'URL (optional)',                     'ru': 'URL (не обяз.)'};
Blockly.Words['pushover_url_title']     = {'en': 'URL title (optional)',        'de': 'URL Betreff (optional)',             'ru': 'заголовок для URL (не обяз.)'};
Blockly.Words['pushover_attachment']    = {'en': 'attachment (optional)',       'de': 'Anhang (optional)',                   'ru': 'вложение (не обяз.)'};
Blockly.Words['pushover_device']        = {'en': 'device ID (optional)',        'de': 'Gerät ID (optional)',                'ru': 'ID устройства (не обяз.)'};
Blockly.Words['pushover_timestamp']     = {'en': 'time in ms (optional)',       'de': 'Zeit in ms (optional)',              'ru': 'время в мс (не обяз.)'};
Blockly.Words['pushover_normal']        = {'en': 'default',                     'de': 'Normal',                             'ru': 'по умолчанию'};
Blockly.Words['pushover_high']          = {'en': 'high priority',               'de': 'Hohe Priorität',                     'ru': 'приоритетное'};
Blockly.Words['pushover_quiet']         = {'en': 'quiet',                       'de': 'Leise',                              'ru': 'тихое'};
Blockly.Words['pushover_confirmation']  = {'en': 'with confirmation',           'de': 'Mit Bestätigung',                    'ru': 'с подтверждением'};

Blockly.Words['pushover_sound_default']     = {'en': 'default',                 'de': 'normal',                             'ru': 'по умолчанию'};
Blockly.Words['pushover_sound_pushover']    = {'en': 'pushover',                'de': 'pushover',                           'ru': 'pushover'};
Blockly.Words['pushover_sound_bike']        = {'en': 'bike',                    'de': 'bike',                               'ru': 'bike'};
Blockly.Words['pushover_sound_bugle']       = {'en': 'bugle',                   'de': 'bugle',                              'ru': 'bugle'};
Blockly.Words['pushover_sound_cashregister'] = {'en': 'cashregister',           'de': 'cashregister',                       'ru': 'cashregister'};
Blockly.Words['pushover_sound_classical']   = {'en': 'classical',               'de': 'classical',                          'ru': 'classical'};
Blockly.Words['pushover_sound_cosmic']      = {'en': 'cosmic',                  'de': 'cosmic',                             'ru': 'cosmic'};
Blockly.Words['pushover_sound_falling']     = {'en': 'falling',                 'de': 'falling',                            'ru': 'falling'};
Blockly.Words['pushover_sound_gamelan']     = {'en': 'gamelan',                 'de': 'gamelan',                            'ru': 'gamelan'};
Blockly.Words['pushover_sound_incoming']    = {'en': 'incoming',                'de': 'incoming',                           'ru': 'incoming'};
Blockly.Words['pushover_sound_intermission'] = {'en': 'intermission',           'de': 'intermission',                       'ru': 'intermission'};
Blockly.Words['pushover_sound_magic']       = {'en': 'magic',                   'de': 'magic',                              'ru': 'magic'};
Blockly.Words['pushover_sound_mechanical']  = {'en': 'mechanical',              'de': 'mechanical',                         'ru': 'mechanical'};
Blockly.Words['pushover_sound_pianobar']    = {'en': 'pianobar',                'de': 'pianobar',                           'ru': 'pianobar'};
Blockly.Words['pushover_sound_siren']       = {'en': 'siren',                   'de': 'siren',                              'ru': 'siren'};
Blockly.Words['pushover_sound_spacealarm']  = {'en': 'spacealarm',              'de': 'spacealarm',                         'ru': 'spacealarm'};
Blockly.Words['pushover_sound_tugboat']     = {'en': 'tugboat',                 'de': 'tugboat',                            'ru': 'tugboat'};
Blockly.Words['pushover_sound_alien']       = {'en': 'alien',                   'de': 'alien',                              'ru': 'alien'};
Blockly.Words['pushover_sound_climb']       = {'en': 'climb',                   'de': 'climb',                              'ru': 'climb'};
Blockly.Words['pushover_sound_persistent']  = {'en': 'persistent',              'de': 'persistent',                         'ru': 'persistent'};
Blockly.Words['pushover_sound_echo']        = {'en': 'echo',                    'de': 'echo',                               'ru': 'echo'};
Blockly.Words['pushover_sound_updown']      = {'en': 'updown',                  'de': 'updown',                             'ru': 'updown'};
Blockly.Words['pushover_sound_none']        = {'en': 'none',                    'de': 'keins',                              'ru': 'без звука'};

Blockly.Words['pushover_log']               = {'en': 'log level',                   'de': 'Loglevel',                           'ru': 'Протокол'};
Blockly.Words['pushover_log_none']          = {'en': 'none',                        'de': 'keins',                              'ru': 'нет'};
Blockly.Words['pushover_log_info']          = {'en': 'info',                        'de': 'info',                               'ru': 'инфо'};
Blockly.Words['pushover_log_debug']         = {'en': 'debug',                       'de': 'debug',                              'ru': 'debug'};
Blockly.Words['pushover_log_warn']          = {'en': 'warning',                     'de': 'warning',                            'ru': 'warning'};
Blockly.Words['pushover_log_error']         = {'en': 'error',                       'de': 'error',                              'ru': 'ошибка'};

Blockly.Words['pushover_anyInstance']       = {'en': 'all instances',               'de': 'Alle Instanzen',                     'ru': 'На все драйвера'};
Blockly.Words['pushover_tooltip']           = {'en': 'Send message to pushover',    'de': 'Sende eine Meldung über Pushover',   'ru': 'Послать сообщение через Pushover'};
Blockly.Words['pushover_help']              = {'en': 'https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md', 'de': 'https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md', 'ru': 'https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md'};

Blockly.Sendto.blocks['pushover'] =
    '<block type="pushover">'
    + '     <value name="INSTANCE">'
    + '     </value>'
    + '     <value name="MESSAGE">'
    + '         <shadow type="text">'
    + '             <field name="TEXT">text</field>'
    + '         </shadow>'
    + '     </value>'
    + '     <value name="TITLE">'
    + '     </value>'
    + '     <value name="SOUND">'
    + '     </value>'
    + '     <value name="PRIORITY">'
    + '     </value>'
    + '     <value name="URL">'
    + '     </value>'
    + '     <value name="URL_TITLE">'
    + '     </value>'
    + '     <value name="ATTACHMENT">'
    + '     </value>'
    + '     <value name="DEVICE">'
    + '     </value>'
    + '     <value name="TIMESTAMP">'
    + '     </value>'
    + '     <value name="LOG">'
    + '     </value>'
    + '</block>';

Blockly.Blocks['pushover'] = {
    init: function() {
        var options = [[Blockly.Translate('pushover_anyInstance'), '']];
        if (typeof main !== 'undefined' && main.instances) {
            for (var i = 0; i < main.instances.length; i++) {
                var m = main.instances[i].match(/^system.adapter.pushover.(\d+)$/);
                if (m) {
                    var n = parseInt(m[1], 10);
                    options.push(['pushover.' + n, '.' + n]);
                }
            }
        }

        if (!options.length) {
            for (var u = 0; u <= 4; u++) {
                options.push(['pushover.' + u, '.' + u]);
            }
        }

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Translate('pushover'))
            .appendField(new Blockly.FieldDropdown(options), "INSTANCE");

        this.appendValueInput('MESSAGE')
            .appendField(Blockly.Translate('pushover_message'));

        this.appendDummyInput('SOUND')
            .appendField(Blockly.Translate('pushover_sound'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('pushover_sound_default'), ""],
                [Blockly.Translate('pushover_sound_pushover'), "pushover"],
                [Blockly.Translate('pushover_sound_bike'), "bike"],
                [Blockly.Translate('pushover_sound_bugle'), "bugle"],
                [Blockly.Translate('pushover_sound_cashregister'), "cashregister"],
                [Blockly.Translate('pushover_sound_classical'), "classical"],
                [Blockly.Translate('pushover_sound_cosmic'), "cosmic"],
                [Blockly.Translate('pushover_sound_falling'), "falling"],
                [Blockly.Translate('pushover_sound_gamelan'), "gamelan"],
                [Blockly.Translate('pushover_sound_incoming'), "incoming"],
                [Blockly.Translate('pushover_sound_intermission'), "intermission"],
                [Blockly.Translate('pushover_sound_magic'), "magic"],
                [Blockly.Translate('pushover_sound_mechanical'), "mechanical"],
                [Blockly.Translate('pushover_sound_pianobar'), "pianobar"],
                [Blockly.Translate('pushover_sound_siren'), "siren"],
                [Blockly.Translate('pushover_sound_spacealarm'), "spacealarm"],
                [Blockly.Translate('pushover_sound_tugboat'), "tugboat"],
                [Blockly.Translate('pushover_sound_alien'), "alien"],
                [Blockly.Translate('pushover_sound_climb'), "climb"],
                [Blockly.Translate('pushover_sound_persistent'), "persistent"],
                [Blockly.Translate('pushover_sound_echo'), "echo"],
                [Blockly.Translate('pushover_sound_updown'), "updown"],
                [Blockly.Translate('pushover_sound_none'), "none"]
            ]), 'SOUND');

        this.appendDummyInput('PRIORITY')
            .appendField(Blockly.Translate('pushover_priority'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('pushover_normal'),       "0"],
                [Blockly.Translate('pushover_high'),         "1"],
                [Blockly.Translate('pushover_quiet'),        "-1"],
                [Blockly.Translate('pushover_confirmation'), "2"]
            ]), 'PRIORITY');

        var input = this.appendValueInput('TITLE')
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_title'));

        if (input.connection) {
            input.connection._optional = true;
        }


        input = this.appendValueInput("URL")
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_url'));
        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('URL_TITLE')
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_url_title'));
        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('ATTACHMENT')
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_attachment'));
        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('DEVICE')
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_device'));
        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('TIMESTAMP')
            .setCheck('Date')
            .appendField(Blockly.Translate('pushover_timestamp'));
        if (input.connection)  7
        input.connection._optional = true;

        this.appendDummyInput('LOG')
            .appendField(Blockly.Translate('pushover_log'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('pushover_log_none'),  ''],
                [Blockly.Translate('pushover_log_info'),  'log'],
                [Blockly.Translate('pushover_log_debug'), 'debug'],
                [Blockly.Translate('pushover_log_warn'),  'warn'],
                [Blockly.Translate('pushover_log_error'), 'error']
            ]), 'LOG');

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate('pushover_tooltip'));
        this.setHelpUrl(Blockly.Translate('pushover_help'));
    }
};

Blockly.JavaScript['pushover'] = function(block) {
    var dropdown_instance = block.getFieldValue('INSTANCE');
    var logLevel = block.getFieldValue('LOG');
    var message  = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    var text = '{\n';
    text += '   message: ' + message + ',\n';
    text += '   sound: "' + block.getFieldValue('SOUND') + '",\n';
    var value = parseInt(block.getFieldValue('PRIORITY'), 10);
    if (value)     text += '   priority: ' + value + ',\n';
	 if (value === 2) {
		 text += '   retry: 60,\n';
		 text += '   expire: 3600,\n';
	 }

    value = Blockly.JavaScript.valueToCode(block, 'URL', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   url: ' + value + ',\n';

    value = Blockly.JavaScript.valueToCode(block, 'URL_TITLE', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   url_title: ' + value + ',\n';

    value = Blockly.JavaScript.valueToCode(block, 'ATTACHMENT', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   file: ' + value + ',\n';

    value = Blockly.JavaScript.valueToCode(block, 'TITLE', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   title: ' + value + ',\n';

    value = Blockly.JavaScript.valueToCode(block, 'DEVICE', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   device: ' + value + ',\n';

    value = Blockly.JavaScript.valueToCode(block, 'TIMESTAMP', Blockly.JavaScript.ORDER_ATOMIC);
    if (value)     text += '   timestamp: ' + value + ',\n';
    text = text.substring(0, text.length - 2);
    text += '\n';

    text += '}';
    var logText;

    if (logLevel) {
        logText = 'console.' + logLevel + '("pushover: " + ' + message + ');\n'
    } else {
        logText = '';
    }

    return 'sendTo("pushover' + dropdown_instance + '", "send", ' + text + ');\n' + logText;
};

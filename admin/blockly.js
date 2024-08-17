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
Blockly.Words['pushover_attachment']    = {'en': 'attachment (optional)',       'de': 'Anhang (optional)',                  'ru': 'вложение (не обяз.)'};
Blockly.Words['pushover_device']        = {'en': 'device ID (optional)',        'de': 'Gerät ID (optional)',                'ru': 'ID устройства (не обяз.)'};
Blockly.Words['pushover_timestamp']     = {'en': 'time in ms (optional)',       'de': 'Zeit in ms (optional)',              'ru': 'время в мс (не обяз.)'};
Blockly.Words['pushover_normal']        = {'en': 'default',                     'de': 'Normal',                             'ru': 'по умолчанию'};
Blockly.Words['pushover_high']          = {'en': 'high priority',               'de': 'Hohe Priorität',                     'ru': 'приоритетное'};
Blockly.Words['pushover_quiet']         = {'en': 'quiet',                       'de': 'Leise',                              'ru': 'тихое'};
Blockly.Words['pushover_confirmation']  = {'en': 'with confirmation',           'de': 'Mit Bestätigung',                    'ru': 'с подтверждением'};
Blockly.Words['pushover_ttl']           = {'en': 'TTL in seconds (optional)',   'de': 'Dauer in Sekunden (optional)',       'ru': 'время жизни в сек. (не обяз.)'};

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

Blockly.Words['pushover_custom_sound']      = {'en': 'custom sound',            'de': 'Eigene Klang',                       'ru': 'Польз. звук'};
Blockly.Words['pushover_log']               = {'en': 'log level',               'de': 'Loglevel',                           'ru': 'Протокол'};
Blockly.Words['pushover_log_none']          = {'en': 'none',                    'de': 'keins',                              'ru': 'нет'};
Blockly.Words['pushover_log_info']          = {'en': 'info',                    'de': 'info',                               'ru': 'инфо'};
Blockly.Words['pushover_log_debug']         = {'en': 'debug',                   'de': 'debug',                              'ru': 'debug'};
Blockly.Words['pushover_log_warn']          = {'en': 'warning',                 'de': 'warning',                            'ru': 'warning'};
Blockly.Words['pushover_log_error']         = {'en': 'error',                   'de': 'error',                              'ru': 'ошибка'};
Blockly.Words['pushover_anyInstance']       = {'en': 'all instances',           'de': 'Alle Instanzen',                     'ru': 'На все драйвера'};
Blockly.Words['pushover_tooltip']           = {'en': 'Send message to pushover', 'de': 'Sende eine Meldung über Pushover',  'ru': 'Послать сообщение через Pushover'};
Blockly.Words['pushover_help']              = {'en': 'https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md', 'de': 'https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md', 'ru': 'https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md'};

Blockly.Sendto.blocks['pushover'] =
    '<block type="pushover">' +
    '  <field name="INSTANCE"></field>' +
    '  <field name="SOUND"></field>' +
    '  <field name="PRIORITY">0</field>' +
    '  <field name="LOG"></field>' +
    '  <value name="MESSAGE">' +
    '    <shadow type="text">' +
    '      <field name="TEXT">text</field>' +
    '    </shadow>' +
    '  </value>' +
    '  <value name="SOUND_CUSTOM">' +
    '    <shadow type="text">' +
    '      <field name="TEXT"></field>' +
    '    </shadow>' +
    '  </value>' +
    '</block>';

Blockly.Blocks['pushover'] = {
    init: function() {
        const options = [[Blockly.Translate('pushover_anyInstance'), '']];
        if (typeof main !== 'undefined' && main.instances) {
            for (let i = 0; i < main.instances.length; i++) {
                const m = main.instances[i].match(/^system.adapter.pushover.(\d+)$/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    options.push(['pushover.' + n, '.' + n]);
                }
            }
        }

        if (!options.length) {
            for (let u = 0; u <= 4; u++) {
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
                [Blockly.Translate('pushover_sound_default'), ''],
                [Blockly.Translate('pushover_sound_pushover'), 'pushover'],
                [Blockly.Translate('pushover_sound_bike'), 'bike'],
                [Blockly.Translate('pushover_sound_bugle'), 'bugle'],
                [Blockly.Translate('pushover_sound_cashregister'), 'cashregister'],
                [Blockly.Translate('pushover_sound_classical'), 'classical'],
                [Blockly.Translate('pushover_sound_cosmic'), 'cosmic'],
                [Blockly.Translate('pushover_sound_falling'), 'falling'],
                [Blockly.Translate('pushover_sound_gamelan'), 'gamelan'],
                [Blockly.Translate('pushover_sound_incoming'), 'incoming'],
                [Blockly.Translate('pushover_sound_intermission'), 'intermission'],
                [Blockly.Translate('pushover_sound_magic'), 'magic'],
                [Blockly.Translate('pushover_sound_mechanical'), 'mechanical'],
                [Blockly.Translate('pushover_sound_pianobar'), 'pianobar'],
                [Blockly.Translate('pushover_sound_siren'), 'siren'],
                [Blockly.Translate('pushover_sound_spacealarm'), 'spacealarm'],
                [Blockly.Translate('pushover_sound_tugboat'), 'tugboat'],
                [Blockly.Translate('pushover_sound_alien'), 'alien'],
                [Blockly.Translate('pushover_sound_climb'), 'climb'],
                [Blockly.Translate('pushover_sound_persistent'), 'persistent'],
                [Blockly.Translate('pushover_sound_echo'), 'echo'],
                [Blockly.Translate('pushover_sound_updown'), 'updown'],
                [Blockly.Translate('pushover_sound_none'), 'none'],
            ]), 'SOUND');

        this.appendValueInput('SOUND_CUSTOM')
            .setCheck(null)
            .appendField(Blockly.Translate('pushover_custom_sound'));

        this.appendDummyInput('PRIORITY')
            .appendField(Blockly.Translate('pushover_priority'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('pushover_normal'),       '0'],
                [Blockly.Translate('pushover_high'),         '1'],
                [Blockly.Translate('pushover_quiet'),        '-1'],
                [Blockly.Translate('pushover_confirmation'), '2'],
            ]), 'PRIORITY');

        let input = this.appendValueInput('TITLE')
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_title'));

        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('URL')
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

        if (input.connection)  {
            input.connection._optional = true;
        }

        this.appendDummyInput('LOG')
            .appendField(Blockly.Translate('pushover_log'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('pushover_log_none'),  ''],
                [Blockly.Translate('pushover_log_info'),  'log'],
                [Blockly.Translate('pushover_log_debug'), 'debug'],
                [Blockly.Translate('pushover_log_warn'),  'warn'],
                [Blockly.Translate('pushover_log_error'), 'error']
            ]), 'LOG');

        input = this.appendValueInput('TTL')
            .setCheck('Number')
            .appendField(Blockly.Translate('pushover_ttl'));
        if (input.connection) {
            input.connection._optional = true;
        }

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate('pushover_tooltip'));
        this.setHelpUrl(Blockly.Translate('pushover_help'));
    },
};

Blockly.JavaScript['pushover'] = function(block) {
    const dropdown_instance = block.getFieldValue('INSTANCE');
    const logLevel = block.getFieldValue('LOG');
    const message  = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    const customSound = Blockly.JavaScript.valueToCode(block, 'SOUND_CUSTOM', Blockly.JavaScript.ORDER_ATOMIC);

    let text = '{\n';
    text += `  message: ${message},\n`;
    if (customSound && customSound !== "''") {
        text += `  sound: ${customSound},\n`;
    } else {
        text += `  sound: '${block.getFieldValue('SOUND')}',\n`;
    }

    const priority = parseInt(block.getFieldValue('PRIORITY'), 10);
    if (priority) {
        text += '  priority: ' + priority + ',\n';

        if (priority === 2) {
            text += '  retry: 60,\n';
            text += '  expire: 3600,\n';
        }
    }

    const url = Blockly.JavaScript.valueToCode(block, 'URL', Blockly.JavaScript.ORDER_ATOMIC);
    if (url) {
        text += `  url: ${url},\n`;
    }

    const urlTitle = Blockly.JavaScript.valueToCode(block, 'URL_TITLE', Blockly.JavaScript.ORDER_ATOMIC);
    if (urlTitle) {
        text += `  url_title: ${urlTitle},\n`;
    }

    const attachment = Blockly.JavaScript.valueToCode(block, 'ATTACHMENT', Blockly.JavaScript.ORDER_ATOMIC);
    if (attachment) {
        text += `  file: ${attachment},\n`;
    }

    const title = Blockly.JavaScript.valueToCode(block, 'TITLE', Blockly.JavaScript.ORDER_ATOMIC);
    if (title) {
        text += `  title: ${title},\n`;
    }

    const device = Blockly.JavaScript.valueToCode(block, 'DEVICE', Blockly.JavaScript.ORDER_ATOMIC);
    if (device) {
        text += `  device: ${device},\n`;
    }

    const timestamp = Blockly.JavaScript.valueToCode(block, 'TIMESTAMP', Blockly.JavaScript.ORDER_ATOMIC);
    if (timestamp) {
        text += `  timestamp: ${timestamp},\n`;
    }

    const ttl = Blockly.JavaScript.valueToCode(block, 'TTL', Blockly.JavaScript.ORDER_ATOMIC);
    if (ttl) {
        text += `  ttl: ${ttl},\n`;
    }

    text += '}';

    let logText = '';
    if (logLevel) {
        logText = `console.${logLevel}('pushover${dropdown_instance}: ${message}');\n`;
    }

    return `sendTo('pushover${dropdown_instance}', 'send', ${text});\n` + logText;
};

/// --- SendTo glances --------------------------------------------------
Blockly.Words['glances']               = {'en': 'glances',                    'de': 'glances',                           'ru': 'glances'};

Blockly.Words['glances_count']      = {
    "en": "Count",
    "de": "Anzahl",
    "ru": "Счётчик",
    "pt": "Contar",
    "nl": "Tel",
    "fr": "Compter",
    "it": "Contare",
    "es": "Contar",
    "pl": "Liczyć",
    "zh-cn": "数数"
};
Blockly.Words['glances_percent']    = {
    "en": "Percent",
    "de": "Prozent",
    "ru": "Проценты",
    "pt": "Por cento",
    "nl": "procent",
    "fr": "Pour cent",
    "it": "Per cento",
    "es": "Por ciento",
    "pl": "Procent",
    "zh-cn": "百分"
};
Blockly.Words['glances_subtext']    =  {
    "en": "Second line",
    "de": "Zweite Reihe",
    "ru": "Вторая строка",
    "pt": "Segunda linha",
    "nl": "Tweede lijn",
    "fr": "Deuxième ligne",
    "it": "Seconda linea",
    "es": "Segunda linea",
    "pl": "Druga linia",
    "zh-cn": "第二行"
};

Blockly.Words['glances_tooltip']    =  {
    "en": "Send short message to pushover (glances)",
    "de": "Kurze Nachricht (glances) an Pushover senden",
    "ru": "Отправить короткое сообщение (glances) pushover",
    "pt": "Envie uma mensagem curta para pushover (glances)",
    "nl": "Stuur een kort bericht naar pushover (glances)",
    "fr": "Envoyer un court message à pushover (glances)",
    "it": "Invia un breve messaggio a pushover (glances)",
    "es": "Enviar mensaje corto a pushover (glances)",
    "pl": "Wyślij krótką wiadomość do pushover (glances)",
    "zh-cn": "发送短消息到pushover (glances)"
};
Blockly.Words['glances_help']       = {'en': 'https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md#glances'};

Blockly.Sendto.blocks['glances'] =
    '<block type="glances">' +
    '  <field name="INSTANCE"></field>' +
    '  <field name="LOG"></field>' +
    '  <value name="MESSAGE">' +
    '    <shadow type="text">' +
    '      <field name="TEXT">text</field>' +
    '    </shadow>' +
    '  </value>' +
    '</block>';

Blockly.Blocks['glances'] = {
    init: function() {
        const options = [[Blockly.Translate('pushover_anyInstance'), '']];
        if (typeof main !== 'undefined' && main.instances) {
            for (let i = 0; i < main.instances.length; i++) {
                const m = main.instances[i].match(/^system.adapter.pushover.(\d+)$/);
                if (m) {
                    const n = parseInt(m[1], 10);
                    options.push(['pushover.' + n, '.' + n]);
                }
            }
        }

        if (!options.length) {
            for (let u = 0; u <= 4; u++) {
                options.push(['pushover.' + u, '.' + u]);
            }
        }

        this.appendDummyInput('INSTANCE')
            .appendField(Blockly.Translate('glances'))
            .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

        this.appendValueInput('MESSAGE')
            .appendField(Blockly.Translate('pushover_message'));

        let input = this.appendValueInput('TITLE')
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_title'));

        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('SUBTEXT')
            .setCheck('String')
            .appendField(Blockly.Translate('glances_subtext'));

        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('COUNT')
            .setCheck('Number')
            .appendField(Blockly.Translate('glances_count'));
        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('PERCENT')
            .setCheck('number')
            .appendField(Blockly.Translate('glances_percent'));
        if (input.connection) {
            input.connection._optional = true;
        }

        input = this.appendValueInput('DEVICE')
            .setCheck('String')
            .appendField(Blockly.Translate('pushover_device'));
        if (input.connection) {
            input.connection._optional = true;
        }

        this.appendDummyInput('LOG')
            .appendField(Blockly.Translate('pushover_log'))
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Translate('pushover_log_none'),  ''],
                [Blockly.Translate('pushover_log_info'),  'log'],
                [Blockly.Translate('pushover_log_debug'), 'debug'],
                [Blockly.Translate('pushover_log_warn'),  'warn'],
                [Blockly.Translate('pushover_log_error'), 'error'],
            ]), 'LOG');

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour(Blockly.Sendto.HUE);
        this.setTooltip(Blockly.Translate('pushover_tooltip'));
        this.setHelpUrl(Blockly.Translate('pushover_help'));
    },
};

Blockly.JavaScript['glances'] = function(block) {
    const dropdown_instance = block.getFieldValue('INSTANCE');
    const logLevel = block.getFieldValue('LOG');
    const message  = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);

    let text = '{\n';
    text += `  message: ${message},\n`;

    const count = Blockly.JavaScript.valueToCode(block, 'COUNT', Blockly.JavaScript.ORDER_ATOMIC);
    if (count) {
        text += `  count: ${parseInt(count, 10)},\n`;
    }

    const percent = Blockly.JavaScript.valueToCode(block, 'PERCENT', Blockly.JavaScript.ORDER_ATOMIC);
    if (percent) {
        text += `  percent: ${parseInt(percent, 10)},\n`;
    }

    const subtext = Blockly.JavaScript.valueToCode(block, 'SUBTEXT', Blockly.JavaScript.ORDER_ATOMIC);
    if (subtext) {
        text += `  subtext: ${subtext},\n`;
    }

    const title = Blockly.JavaScript.valueToCode(block, 'TITLE', Blockly.JavaScript.ORDER_ATOMIC);
    if (title) {
        text += `  title: ${title},\n`;
    }

    const device = Blockly.JavaScript.valueToCode(block, 'DEVICE', Blockly.JavaScript.ORDER_ATOMIC);
    if (device) {
        text += `  device: ${device},\n`;
    }

    text += '}';
    let logText = '';

    if (logLevel) {
        logText = `console.${logLevel}('pushover${dropdown_instance} (glances): ${message}');\n`;
    }

    return `sendTo('pushover${dropdown_instance}', 'glances', ${text});\n` + logText;
};

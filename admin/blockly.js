// GENERATED FILE - do not edit.
// Source: src-blockly/blockly.ts - rebuild with `npm run build:blockly`.
"use strict";
(() => {
  // src-blockly/helpers.ts
  var Blockly = window.Blockly;
  function instanceOptions() {
    const options = [[Blockly.Translate("pushover_anyInstance"), ""]];
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
    if (options.length === 1) {
      for (let n = 0; n <= 4; n++) {
        options.push([`pushover.${n}`, `.${n}`]);
      }
    }
    return options;
  }
  function logLevelOptions() {
    return [
      [Blockly.Translate("pushover_log_none"), ""],
      [Blockly.Translate("pushover_log_info"), "log"],
      [Blockly.Translate("pushover_log_debug"), "debug"],
      [Blockly.Translate("pushover_log_warn"), "warn"],
      [Blockly.Translate("pushover_log_error"), "error"]
    ];
  }
  function logLine(logLevel, prefix, message) {
    if (!logLevel) {
      return "";
    }
    return `console.${logLevel}('${prefix}: '${message ? ` + ${message}` : ""});
`;
  }
  function makeOptional(input) {
    if (input.connection) {
      input.connection._optional = true;
    }
  }
  function registerGenerator(type, generator) {
    if (Blockly.JavaScript.forBlock) {
      Blockly.JavaScript.forBlock[type] = generator;
    } else {
      Blockly.JavaScript[type] = generator;
    }
  }

  // src-blockly/blocks/glances.ts
  var Blockly2 = window.Blockly;
  function installGlances() {
    Blockly2.Sendto.blocks.glances = `<block type="glances">
  <field name="INSTANCE"></field>
  <field name="LOG"></field>
  <value name="MESSAGE">
    <shadow type="text">
      <field name="TEXT">text</field>
    </shadow>
  </value>
</block>`;
    Blockly2.Blocks.glances = {
      init: function() {
        this.appendDummyInput("INSTANCE").appendField(Blockly2.Translate("glances")).appendField(new Blockly2.FieldDropdown(instanceOptions()), "INSTANCE");
        this.appendValueInput("MESSAGE").appendField(Blockly2.Translate("pushover_message"));
        for (const [name, word, check] of [
          ["TITLE", "pushover_title", "String"],
          ["SUBTEXT", "glances_subtext", "String"],
          ["COUNT", "glances_count", "Number"],
          // the original had 'number' here, which matches no output type at all - a number
          // block could not be plugged into this input
          ["PERCENT", "glances_percent", "Number"],
          ["DEVICE", "pushover_device", "String"]
        ]) {
          makeOptional(this.appendValueInput(name).setCheck(check).appendField(Blockly2.Translate(word)));
        }
        this.appendDummyInput("LOG").appendField(Blockly2.Translate("pushover_log")).appendField(new Blockly2.FieldDropdown(logLevelOptions()), "LOG");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly2.Sendto.HUE);
        this.setTooltip(Blockly2.Translate("pushover_tooltip"));
        this.setHelpUrl(Blockly2.Translate("pushover_help"));
      }
    };
    registerGenerator("glances", (block) => {
      const instance = block.getFieldValue("INSTANCE");
      const logLevel = block.getFieldValue("LOG");
      const message = Blockly2.JavaScript.valueToCode(block, "MESSAGE", Blockly2.JavaScript.ORDER_ATOMIC);
      const lines = ["{\n"];
      if (message) {
        lines.push(`  message: ${message},
`);
      }
      for (const [input, key] of [
        ["COUNT", "count"],
        ["PERCENT", "percent"]
      ]) {
        const value = Blockly2.JavaScript.valueToCode(block, input, Blockly2.JavaScript.ORDER_ATOMIC);
        if (value) {
          lines.push(`  ${key}: parseInt(${value}, 10),
`);
        }
      }
      for (const [input, key] of [
        ["SUBTEXT", "subtext"],
        ["TITLE", "title"],
        ["DEVICE", "device"]
      ]) {
        const value = Blockly2.JavaScript.valueToCode(block, input, Blockly2.JavaScript.ORDER_ATOMIC);
        if (value) {
          lines.push(`  ${key}: ${value},
`);
        }
      }
      lines.push("}");
      return `sendTo('pushover${instance}', 'glances', ${lines.join("")});
${logLine(logLevel, `pushover${instance} (glances)`, message)}`;
    });
  }

  // src-blockly/sounds.ts
  var SOUND_IDS = [
    "",
    "pushover",
    "bike",
    "bugle",
    "cashregister",
    "classical",
    "cosmic",
    "falling",
    "gamelan",
    "incoming",
    "intermission",
    "magic",
    "mechanical",
    "pianobar",
    "siren",
    "spacealarm",
    "tugboat",
    "alien",
    "climb",
    "persistent",
    "echo",
    "updown",
    "none"
  ];
  function soundOptions() {
    return SOUND_IDS.map((id) => [window.Blockly.Translate(`pushover_sound_${id || "default"}`), id]);
  }

  // src-blockly/blocks/pushover.ts
  var Blockly3 = window.Blockly;
  function installPushover() {
    Blockly3.Sendto.blocks.pushover = `<block type="pushover">
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
    Blockly3.Blocks.pushover = {
      init: function() {
        this.appendDummyInput("INSTANCE").appendField(Blockly3.Translate("pushover")).appendField(new Blockly3.FieldDropdown(instanceOptions()), "INSTANCE");
        this.appendValueInput("MESSAGE").appendField(Blockly3.Translate("pushover_message"));
        this.appendDummyInput("SOUND").appendField(Blockly3.Translate("pushover_sound")).appendField(new Blockly3.FieldDropdown(soundOptions()), "SOUND");
        this.appendValueInput("SOUND_CUSTOM").setCheck(null).appendField(Blockly3.Translate("pushover_custom_sound"));
        this.appendDummyInput("PRIORITY").appendField(Blockly3.Translate("pushover_priority")).appendField(
          new Blockly3.FieldDropdown([
            [Blockly3.Translate("pushover_normal"), "0"],
            [Blockly3.Translate("pushover_high"), "1"],
            [Blockly3.Translate("pushover_quiet"), "-1"],
            [Blockly3.Translate("pushover_lowest"), "-2"],
            [Blockly3.Translate("pushover_confirmation"), "2"]
          ]),
          "PRIORITY"
        );
        for (const [name, word, check] of [
          ["TITLE", "pushover_title", "String"],
          ["URL", "pushover_url", "String"],
          ["URL_TITLE", "pushover_url_title", "String"],
          ["ATTACHMENT", "pushover_attachment", "String"],
          ["DEVICE", "pushover_device", "String"],
          ["TAGS", "pushover_tags", "String"],
          ["TIMESTAMP", "pushover_timestamp", "Date"]
        ]) {
          makeOptional(this.appendValueInput(name).setCheck(check).appendField(Blockly3.Translate(word)));
        }
        this.appendDummyInput("LOG").appendField(Blockly3.Translate("pushover_log")).appendField(new Blockly3.FieldDropdown(logLevelOptions()), "LOG");
        makeOptional(
          this.appendValueInput("TTL").setCheck("Number").appendField(Blockly3.Translate("pushover_ttl"))
        );
        this.appendDummyInput("FORMAT").appendField(Blockly3.Translate("pushover_format")).appendField(
          new Blockly3.FieldDropdown([
            [Blockly3.Translate("pushover_format_none"), "none"],
            [Blockly3.Translate("pushover_format_html"), "html"],
            [Blockly3.Translate("pushover_format_mono"), "monospace"]
          ]),
          "FORMAT"
        );
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Blockly3.Sendto.HUE);
        this.setTooltip(Blockly3.Translate("pushover_tooltip"));
        this.setHelpUrl(Blockly3.Translate("pushover_help"));
      }
    };
    registerGenerator("pushover", (block) => {
      const instance = block.getFieldValue("INSTANCE");
      const logLevel = block.getFieldValue("LOG");
      const message = Blockly3.JavaScript.valueToCode(block, "MESSAGE", Blockly3.JavaScript.ORDER_ATOMIC);
      const customSound = Blockly3.JavaScript.valueToCode(block, "SOUND_CUSTOM", Blockly3.JavaScript.ORDER_ATOMIC);
      const lines = ["{\n"];
      if (message) {
        lines.push(`  message: ${message},
`);
      }
      if (customSound && customSound !== "''") {
        lines.push(`  sound: ${customSound},
`);
      } else {
        lines.push(`  sound: '${block.getFieldValue("SOUND")}',
`);
      }
      const priority = parseInt(block.getFieldValue("PRIORITY"), 10);
      if (priority) {
        lines.push(`  priority: ${priority},
`);
        if (priority === 2) {
          lines.push("  retry: 60,\n");
          lines.push("  expire: 3600,\n");
        }
      }
      for (const [input, key] of [
        ["URL", "url"],
        ["URL_TITLE", "url_title"],
        ["ATTACHMENT", "file"],
        ["TITLE", "title"],
        ["DEVICE", "device"],
        ["TAGS", "tags"],
        ["TIMESTAMP", "timestamp"],
        ["TTL", "ttl"]
      ]) {
        const value = Blockly3.JavaScript.valueToCode(block, input, Blockly3.JavaScript.ORDER_ATOMIC);
        if (value) {
          lines.push(`  ${key}: ${value},
`);
        }
      }
      switch (block.getFieldValue("FORMAT")) {
        case "html":
          lines.push("  html: 1,\n");
          break;
        case "monospace":
          lines.push("  monospace: 1,\n");
          break;
        default:
          break;
      }
      lines.push("}");
      return `sendTo('pushover${instance}', 'send', ${lines.join("")});
${logLine(logLevel, `pushover${instance}`, message)}`;
    });
  }

  // src-blockly/i18n/de.json
  var de_default = {
    glances: "glances",
    glances_count: "Anzahl",
    glances_percent: "Prozent",
    glances_subtext: "Zweite Reihe",
    glances_tooltip: "Kurze Nachricht (glances) an Pushover senden",
    pushover: "pushover",
    pushover_anyInstance: "Alle Instanzen",
    pushover_attachment: "Anhang (optional)",
    pushover_confirmation: "Mit Bestätigung",
    pushover_custom_sound: "Eigene Klang",
    pushover_device: "Gerät ID (optional)",
    pushover_format: "Formatierung (optional)",
    pushover_format_html: "HTML",
    pushover_format_mono: "monospace",
    pushover_format_none: "keine",
    pushover_high: "Hohe Priorität",
    pushover_log: "Loglevel",
    pushover_log_debug: "debug",
    pushover_log_error: "error",
    pushover_log_info: "info",
    pushover_log_none: "keins",
    pushover_log_warn: "warning",
    pushover_lowest: "Niedrigste Priorität",
    pushover_message: "Meldung",
    pushover_normal: "Normal",
    pushover_priority: "Priorität",
    pushover_quiet: "Leise",
    pushover_sound: "Klang",
    pushover_sound_alien: "alien",
    pushover_sound_bike: "bike",
    pushover_sound_bugle: "bugle",
    pushover_sound_cashregister: "cashregister",
    pushover_sound_classical: "classical",
    pushover_sound_climb: "climb",
    pushover_sound_cosmic: "cosmic",
    pushover_sound_default: "normal",
    pushover_sound_echo: "echo",
    pushover_sound_falling: "falling",
    pushover_sound_gamelan: "gamelan",
    pushover_sound_incoming: "incoming",
    pushover_sound_intermission: "intermission",
    pushover_sound_magic: "magic",
    pushover_sound_mechanical: "mechanical",
    pushover_sound_none: "keins",
    pushover_sound_persistent: "persistent",
    pushover_sound_pianobar: "pianobar",
    pushover_sound_pushover: "pushover",
    pushover_sound_siren: "siren",
    pushover_sound_spacealarm: "spacealarm",
    pushover_sound_tugboat: "tugboat",
    pushover_sound_updown: "updown",
    pushover_tags: "Tags (optional)",
    pushover_timestamp: "Zeit in ms (optional)",
    pushover_title: "Betreff (optional)",
    pushover_tooltip: "Sende eine Meldung über Pushover",
    pushover_ttl: "Dauer in Sekunden (optional)",
    pushover_url: "URL (optional)",
    pushover_url_title: "URL Betreff (optional)"
  };

  // src-blockly/i18n/en.json
  var en_default = {
    glances: "glances",
    glances_count: "Count",
    glances_percent: "Percent",
    glances_subtext: "Second line",
    glances_tooltip: "Send short message to pushover (glances)",
    pushover: "pushover",
    pushover_anyInstance: "all instances",
    pushover_attachment: "attachment (optional)",
    pushover_confirmation: "with confirmation",
    pushover_custom_sound: "custom sound",
    pushover_device: "device ID (optional)",
    pushover_format: "formatting (optional)",
    pushover_format_html: "HTML",
    pushover_format_mono: "monospace",
    pushover_format_none: "none",
    pushover_high: "high priority",
    pushover_log: "log level",
    pushover_log_debug: "debug",
    pushover_log_error: "error",
    pushover_log_info: "info",
    pushover_log_none: "none",
    pushover_log_warn: "warning",
    pushover_lowest: "lowest",
    pushover_message: "message",
    pushover_normal: "default",
    pushover_priority: "priority",
    pushover_quiet: "quiet",
    pushover_sound: "sound",
    pushover_sound_alien: "alien",
    pushover_sound_bike: "bike",
    pushover_sound_bugle: "bugle",
    pushover_sound_cashregister: "cashregister",
    pushover_sound_classical: "classical",
    pushover_sound_climb: "climb",
    pushover_sound_cosmic: "cosmic",
    pushover_sound_default: "default",
    pushover_sound_echo: "echo",
    pushover_sound_falling: "falling",
    pushover_sound_gamelan: "gamelan",
    pushover_sound_incoming: "incoming",
    pushover_sound_intermission: "intermission",
    pushover_sound_magic: "magic",
    pushover_sound_mechanical: "mechanical",
    pushover_sound_none: "none",
    pushover_sound_persistent: "persistent",
    pushover_sound_pianobar: "pianobar",
    pushover_sound_pushover: "pushover",
    pushover_sound_siren: "siren",
    pushover_sound_spacealarm: "spacealarm",
    pushover_sound_tugboat: "tugboat",
    pushover_sound_updown: "updown",
    pushover_tags: "tags (optional)",
    pushover_timestamp: "time in ms (optional)",
    pushover_title: "title (optional)",
    pushover_tooltip: "Send message to pushover",
    pushover_ttl: "TTL in seconds (optional)",
    pushover_url: "URL (optional)",
    pushover_url_title: "URL title (optional)"
  };

  // src-blockly/i18n/es.json
  var es_default = {
    glances_count: "Contar",
    glances_percent: "Por ciento",
    glances_subtext: "Segunda linea",
    glances_tooltip: "Enviar mensaje corto a pushover (glances)"
  };

  // src-blockly/i18n/fr.json
  var fr_default = {
    glances_count: "Compter",
    glances_percent: "Pour cent",
    glances_subtext: "Deuxième ligne",
    glances_tooltip: "Envoyer un court message à pushover (glances)"
  };

  // src-blockly/i18n/it.json
  var it_default = {
    glances_count: "Contare",
    glances_percent: "Per cento",
    glances_subtext: "Seconda linea",
    glances_tooltip: "Invia un breve messaggio a pushover (glances)"
  };

  // src-blockly/i18n/nl.json
  var nl_default = {
    glances_count: "Tel",
    glances_percent: "procent",
    glances_subtext: "Tweede lijn",
    glances_tooltip: "Stuur een kort bericht naar pushover (glances)"
  };

  // src-blockly/i18n/pl.json
  var pl_default = {
    glances_count: "Liczyć",
    glances_percent: "Procent",
    glances_subtext: "Druga linia",
    glances_tooltip: "Wyślij krótką wiadomość do pushover (glances)"
  };

  // src-blockly/i18n/pt.json
  var pt_default = {
    glances_count: "Contar",
    glances_percent: "Por cento",
    glances_subtext: "Segunda linha",
    glances_tooltip: "Envie uma mensagem curta para pushover (glances)"
  };

  // src-blockly/i18n/ru.json
  var ru_default = {
    glances: "glances",
    glances_count: "Счётчик",
    glances_percent: "Проценты",
    glances_subtext: "Вторая строка",
    glances_tooltip: "Отправить короткое сообщение (glances) pushover",
    pushover: "pushover",
    pushover_anyInstance: "На все драйвера",
    pushover_attachment: "вложение (не обяз.)",
    pushover_confirmation: "с подтверждением",
    pushover_custom_sound: "Польз. звук",
    pushover_device: "ID устройства (не обяз.)",
    pushover_format: "форматирование (не обяз.)",
    pushover_format_html: "HTML",
    pushover_format_mono: "monospace",
    pushover_format_none: "никто",
    pushover_high: "приоритетное",
    pushover_log: "Протокол",
    pushover_log_debug: "debug",
    pushover_log_error: "ошибка",
    pushover_log_info: "инфо",
    pushover_log_none: "нет",
    pushover_log_warn: "warning",
    pushover_lowest: "низкий приоритет",
    pushover_message: "сообщение",
    pushover_normal: "по умолчанию",
    pushover_priority: "приоритет",
    pushover_quiet: "тихое",
    pushover_sound: "звук",
    pushover_sound_alien: "alien",
    pushover_sound_bike: "bike",
    pushover_sound_bugle: "bugle",
    pushover_sound_cashregister: "cashregister",
    pushover_sound_classical: "classical",
    pushover_sound_climb: "climb",
    pushover_sound_cosmic: "cosmic",
    pushover_sound_default: "по умолчанию",
    pushover_sound_echo: "echo",
    pushover_sound_falling: "falling",
    pushover_sound_gamelan: "gamelan",
    pushover_sound_incoming: "incoming",
    pushover_sound_intermission: "intermission",
    pushover_sound_magic: "magic",
    pushover_sound_mechanical: "mechanical",
    pushover_sound_none: "без звука",
    pushover_sound_persistent: "persistent",
    pushover_sound_pianobar: "pianobar",
    pushover_sound_pushover: "pushover",
    pushover_sound_siren: "siren",
    pushover_sound_spacealarm: "spacealarm",
    pushover_sound_tugboat: "tugboat",
    pushover_sound_updown: "updown",
    pushover_tags: "тэги (не обяз.)",
    pushover_timestamp: "время в мс (не обяз.)",
    pushover_title: "заголовок (не обяз.)",
    pushover_tooltip: "Послать сообщение через Pushover",
    pushover_ttl: "время жизни в сек. (не обяз.)",
    pushover_url: "URL (не обяз.)",
    pushover_url_title: "заголовок для URL (не обяз.)"
  };

  // src-blockly/i18n/zh-cn.json
  var zh_cn_default = {
    glances_count: "数数",
    glances_percent: "百分",
    glances_subtext: "第二行",
    glances_tooltip: "发送短消息到pushover (glances)"
  };

  // src-blockly/words.ts
  var Blockly4 = window.Blockly;
  var LANGUAGES = {
    de: de_default,
    en: en_default,
    es: es_default,
    fr: fr_default,
    it: it_default,
    nl: nl_default,
    pl: pl_default,
    pt: pt_default,
    ru: ru_default,
    "zh-cn": zh_cn_default
  };
  var README = "https://github.com/ioBroker/ioBroker.pushover/blob/master/README.md";
  function installWords() {
    Blockly4.Translate || (Blockly4.Translate = function(word, lang) {
      lang || (lang = window.systemLang);
      const entry = Blockly4.Words?.[word];
      return entry ? entry[lang || "en"] || entry.en : word;
    });
    const words = {};
    for (const [lang, texts] of Object.entries(LANGUAGES)) {
      for (const [word, text] of Object.entries(texts)) {
        if (text) {
          (words[word] || (words[word] = {}))[lang] = text;
        }
      }
    }
    Object.assign(Blockly4.Words, words);
    Blockly4.Words.pushover_help = { en: README };
    Blockly4.Words.glances_help = { en: `${README}#glances` };
  }

  // src-blockly/blockly.ts
  installWords();
  installPushover();
  installGlances();
})();

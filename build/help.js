"use strict";
/**
 * The answer of `help`: what the instance answers, written for an AI agent (e.g. ioBroker.pi-agent, or the MCP
 * server with `send_to`) and for script authors. Keep it in sync with `onMessage` in main.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HELP = exports.COMMANDS = void 0;
/**
 * Every command `onMessage` answers; `write: true` = it has an effect (sends a push message); `standard` = it follows
 * the shared catalog of commands for adapter families (message.*)
 */
exports.COMMANDS = [
    { command: 'help', write: false },
    { command: 'send', write: true },
    { command: 'message.send', write: true, standard: 'message.send' },
    { command: 'glances', write: true },
    { command: 'sendNotification', write: true },
];
exports.HELP = `ioBroker.pushover: sends push messages through Pushover (pushover.net) to the phones and computers of the user
or group whose key is in the settings. An agent can send a message, with title, sound, priority, link or picture,
and update a Glances widget (e.g. on a smartwatch). message.send follows the shared catalog of message commands;
send keeps its own answer (error: null on success), so the catalog version has the full name message.send.

Commands (sendTo pushover.0):
- send {message, title?, sound?, priority?, device?, url?, url_title?, html?, monospace?, timestamp?, ttl?, retry?,
  expire?, file?, user?, token?} or just a text: sends a push message; answer {error, result}: error null when it
  reached Pushover, result = the answer of Pushover as JSON text ({"status":1,"request":...}; status 0 and errors
  if Pushover refused it, e.g. an invalid user key).
  message: the text (string). title: default the title of the settings. sound: pushover, bike, bugle,
  cashregister, classical, cosmic, falling, gamelan, incoming, intermission, magic, mechanical, pianobar, siren,
  spacealarm, tugboat, alien, climb, persistent, echo, updown, none; default the sound of the settings.
  priority: -2 (no notice), -1 (quiet), 0 (normal), 1 (high, ignores the quiet hours), 2 (emergency: repeated
  every retry seconds, default 60, until the user confirms it, at most expire seconds, default 3600); default
  the priority of the settings. device: the name of one device of the user instead of all. url, url_title: a
  link below the text. html: 1 = the text may contain <b>, <i>, <u>, <font color=...>, <a href=...>; monospace:
  1 = fixed font (not both). timestamp: the time shown (ms or s since 1970). ttl: seconds until the message is
  deleted on the devices. file: a picture, a path on the ioBroker host or {name, data: Buffer, type?}.
  user, token: another user or group key and application token than the settings; with both (and another user)
  the defaults of title, sound and priority are not applied (the answer also has err, the same as error).
  All fields go to the Pushover API unchanged, so its other parameters work too.
  text and recipient, the names of the shared catalog of message commands, work too: text = message, recipient =
  device (message and device win when both are given). send keeps its own answer (error null on success); the
  catalog version is message.send.
  The same message again within 1 s is dropped; answer {error, reason: "DUPLICATE"}.
- message.send {text, recipient?, title?, file?, priority?}: sends a push message as the shared catalog says, to the
  user or group of the settings. recipient: the name of a device of the user (several with "," or as an array;
  default all devices). title: default the title of the settings. priority: -2 … 2 as in send, or lowest, low,
  normal, high, emergency. file (or files with one entry): one picture of at most 5 MB - {data, contentType}
  (base64 or a data URL, as cameras and charts answer), a data URL, base64 with the parameter contentType,
  iobfile://<adapter.0>/<path> or an http(s) URL. Other fields of send (sound, url, html, ttl, ...) are passed on.
  Answer {ok: true, sent: 1, receipt?: the receipt of an emergency message} or {error, reason?: BAD_REQUEST,
  NOT_SUPPORTED (more than one file, not a picture), NOT_FOUND (unknown device), NOT_CONNECTED (Pushover not
  reachable), NOT_CONFIGURED (no user key or token in the settings), DUPLICATE (the same message within 1 s)}.
- glances {message, title?, subtext?, count?, percent?, device?, user?, token?}: updates the Glances widget;
  message (or text), title, subtext at most 100 characters each, count an integer, percent 0-100; answer
  {error: null, result: {status: 1, ...}} or {error}.
- sendNotification: for the notification-manager (sends the system notification); answer {sent, error?}.
- help: this text and the list of commands {help, commands: [{command, write, standard?}]}.
Other commands are answered with {error: "Unsupported"}.

How to talk to the user:
- Without user the message goes to the user or group of the settings (usually the user himself). Another user or
  group key only on the user's explicit request, with the key from the user; never guess one.
- Priority 2 (emergency, repeats until confirmed) and 1 (bypasses the quiet hours) only when the user asks for an
  urgent message.
- Tell the user whether Pushover accepted it (result status 1); on an error give the reason.`;

/**
 * The sounds Pushover offers. The empty id means "whatever the app is configured to play".
 *
 * Every id has a word of its own (`pushover_sound_<id>`), so a sound could be renamed per language -
 * in practice only "default" and "none" are translated, the rest are Pushover's own names.
 */
const SOUND_IDS = [
    '',
    'pushover',
    'bike',
    'bugle',
    'cashregister',
    'classical',
    'cosmic',
    'falling',
    'gamelan',
    'incoming',
    'intermission',
    'magic',
    'mechanical',
    'pianobar',
    'siren',
    'spacealarm',
    'tugboat',
    'alien',
    'climb',
    'persistent',
    'echo',
    'updown',
    'none',
];

/** The sound dropdown, translated */
export function soundOptions(): [string, string][] {
    return SOUND_IDS.map(id => [window.Blockly.Translate(`pushover_sound_${id || 'default'}`), id]);
}

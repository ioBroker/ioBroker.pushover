"use strict";
// message.send of the shared catalog of message commands, under its full name: the short name send is the older
// command, whose answer keeps `error: null` on success. Here only what needs no Pushover: the parameters, the
// picture and the answer.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_ATTACHMENT_BYTES = void 0;
exports.pushoverPriority = pushoverPriority;
exports.fileSource = fileSource;
exports.attachmentProblem = attachmentProblem;
exports.toPushoverMessage = toPushoverMessage;
exports.standardAnswer = standardAnswer;
/** Parameters of the catalog; they are not passed on to Pushover */
const CATALOG_KEYS = ['text', 'recipient', 'file', 'files', 'contentType'];
/** Pushover takes pictures up to 5 MB */
exports.MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
/** priority as text */
const PRIORITY_WORDS = { lowest: -2, low: -1, normal: 0, high: 1, emergency: 2 };
/**
 * The priority of Pushover: -2 … 2, also as text (lowest, low, normal, high, emergency).
 *
 * @param priority the priority of the catalog
 * @returns the number, undefined without one, or NaN if it is none of these
 */
function pushoverPriority(priority) {
    if (priority === undefined || priority === null || priority === '') {
        return undefined;
    }
    if (typeof priority !== 'number' && typeof priority !== 'string') {
        return NaN;
    }
    const text = String(priority).trim().toLowerCase();
    const value = text in PRIORITY_WORDS ? PRIORITY_WORDS[text] : Number(text);
    return Number.isInteger(value) && value >= -2 && value <= 2 ? value : NaN;
}
/**
 * A file name for a content type, e.g. image/png → picture.png.
 *
 * @param contentType the content type
 */
function nameOf(contentType) {
    return `picture.${contentType.split('/')[1]?.split(/[+;]/)[0] || 'bin'}`;
}
/**
 * A data URL as a picture.
 *
 * @param text the text
 * @returns the picture, or undefined if the text is no data URL
 */
function fromDataUrl(text) {
    const match = text.match(/^data:([^;,]+)[^,]*;base64,(.*)$/s);
    return match ? { name: nameOf(match[1]), data: Buffer.from(match[2], 'base64'), type: match[1] } : undefined;
}
/**
 * Where the picture of message.send comes from (rule 7 of the catalog): {data, contentType, fileName?} (base64 or
 * a data URL, as cameras and charts answer), a data URL, base64 with the parameter contentType,
 * iobfile://<adapter.0>/<path> or an http(s) URL. A path on the host is not taken.
 *
 * @param file the file of message.send
 * @param contentType the parameter contentType, for bare base64
 * @returns the source, or null if the file is none of these
 */
function fileSource(file, contentType) {
    const mimeParam = typeof contentType === 'string' ? contentType.trim() : '';
    if (file && typeof file === 'object') {
        const given = file;
        if (typeof given.data !== 'string' || !given.data) {
            return null;
        }
        const name = typeof given.fileName === 'string' && given.fileName ? given.fileName : undefined;
        const decoded = fromDataUrl(given.data);
        if (decoded) {
            return name ? { ...decoded, name } : decoded;
        }
        const type = typeof given.contentType === 'string' && given.contentType ? given.contentType : mimeParam;
        return {
            name: name || nameOf(type || 'application/octet-stream'),
            data: Buffer.from(given.data, 'base64'),
            type: type || 'application/octet-stream',
        };
    }
    if (typeof file !== 'string' || !file) {
        return null;
    }
    const decoded = fromDataUrl(file);
    if (decoded) {
        return decoded;
    }
    const iobFile = file.match(/^iobfile:\/\/([^/]+)\/(.+)$/);
    if (iobFile) {
        return { adapter: iobFile[1], path: iobFile[2] };
    }
    if (/^https?:\/\//i.test(file)) {
        return { url: file };
    }
    if (mimeParam && /^[A-Za-z0-9+/=\s]+$/.test(file)) {
        return { name: nameOf(mimeParam), data: Buffer.from(file, 'base64'), type: mimeParam };
    }
    return null;
}
/**
 * Whether the picture can go to Pushover: a picture (or of unknown type) of at most 5 MB.
 *
 * @param file the picture
 * @returns the error answer, or undefined if it fits
 */
function attachmentProblem(file) {
    const type = file.type.toLowerCase();
    if (type && !type.startsWith('image/') && type !== 'application/octet-stream') {
        return { error: `Pushover attaches only pictures, not ${file.type}`, reason: 'NOT_SUPPORTED' };
    }
    if (file.data.length > exports.MAX_ATTACHMENT_BYTES) {
        return { error: 'The picture is larger than the 5 MB Pushover takes', reason: 'BAD_REQUEST' };
    }
    return undefined;
}
/**
 * The parameters of message.send {text, recipient?, title?, file?, files?, priority?} as Pushover takes them: text
 * → message, recipient → device (several: an array or "," between them), priority → -2 … 2. The own names of send
 * (message, device) win; everything else (sound, url, html …) is passed on.
 *
 * @param input the message of message.send
 * @returns the Pushover message and where its picture comes from, or the error answer
 */
function toPushoverMessage(input) {
    const message = { ...input };
    for (const key of CATALOG_KEYS) {
        delete message[key];
    }
    const text = typeof input.message === 'string' ? input.message : input.text;
    if ((typeof text !== 'string' && typeof text !== 'number') || String(text).trim() === '') {
        return { failure: { error: 'text is missing', reason: 'BAD_REQUEST' } };
    }
    message.message = String(text);
    const recipient = Array.isArray(input.recipient)
        ? input.recipient
            .map(device => String(device).trim())
            .filter(device => !!device)
            .join(',')
        : typeof input.recipient === 'string' || typeof input.recipient === 'number'
            ? String(input.recipient).trim()
            : '';
    if (!input.device && recipient) {
        message.device = recipient;
    }
    const priority = pushoverPriority(input.priority);
    if (Number.isNaN(priority)) {
        return {
            failure: { error: 'priority: -2 … 2 or lowest, low, normal, high, emergency', reason: 'BAD_REQUEST' },
        };
    }
    if (priority !== undefined) {
        message.priority = priority;
    }
    const files = [input.file, ...(Array.isArray(input.files) ? input.files : [input.files])].filter(file => file !== undefined && file !== null && file !== '');
    if (files.length > 1) {
        return { failure: { error: 'Pushover takes one picture per message', reason: 'NOT_SUPPORTED' } };
    }
    if (!files.length) {
        return { message };
    }
    const file = fileSource(files[0], input.contentType);
    if (!file) {
        return {
            failure: {
                error: 'file: {data, contentType}, a data URL, base64 with contentType, iobfile:// or an http(s) URL',
                reason: 'BAD_REQUEST',
            },
        };
    }
    return { message, file };
}
/**
 * The answer of message.send from what Pushover answered.
 *
 * @param error the error of the client (a network error, or that the adapter is not configured)
 * @param result the answer of Pushover as JSON text ({status: 1, request, receipt?} or {status: 0, errors})
 * @returns ok: true, sent: 1 and receipt?, or error and reason?
 */
function standardAnswer(error, result) {
    if (error) {
        const text = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
        if (/not configured/i.test(text)) {
            return { error: text, reason: 'NOT_CONFIGURED' };
        }
        return /ECONN|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|socket/i.test(text)
            ? { error: text, reason: 'NOT_CONNECTED' }
            : { error: text };
    }
    let answer;
    try {
        answer = typeof result === 'string' ? JSON.parse(result) : result;
    }
    catch {
        return { error: `Unexpected answer of Pushover: ${String(result)}` };
    }
    if (answer?.status === 1) {
        return typeof answer.receipt === 'string'
            ? { ok: true, sent: 1, receipt: answer.receipt }
            : { ok: true, sent: 1 };
    }
    const errors = Array.isArray(answer?.errors)
        ? answer.errors.join('; ')
        : typeof answer?.errors === 'string'
            ? answer.errors
            : '';
    const failure = { error: errors || 'Pushover did not take the message' };
    if (answer?.device === 'invalid') {
        failure.reason = 'NOT_FOUND';
    }
    return failure;
}

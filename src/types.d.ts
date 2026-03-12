export type MessagePriority = '-2' | '-1' | '0' | '1' | '2' | -2 | -1 | 0 | 1 | 2;
export type MessageSound =
    | ''
    | 'pushover'
    | 'bike'
    | 'bugle'
    | 'cashregister'
    | 'classical'
    | 'cosmic'
    | 'falling'
    | 'gamelan'
    | 'incoming'
    | 'intermission'
    | 'magic'
    | 'mechanical'
    | 'pianobar'
    | 'siren'
    | 'spacealarm'
    | 'tugboat'
    | 'alien'
    | 'climb'
    | 'persistent'
    | 'echo'
    | 'none';

export interface PushoverAdapterConfig {
    user: string;
    token: string;
    title: string;
    sound: MessageSound;
    priority: MessagePriority;
    showLog: boolean;
}

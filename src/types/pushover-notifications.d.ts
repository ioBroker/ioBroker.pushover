declare module 'pushover-notifications' {
    interface PushoverOptions {
        user?: string;
        token?: string;
        onerror?: (error: any) => void;
    }

    interface PushoverMessage {
        message?: string;
        title?: string;
        sound?: string;
        priority?: number;
        device?: string;
        url?: string;
        url_title?: string;
        timestamp?: number;
        retry?: number;
        expire?: number;
        html?: number;
        monospace?: number;
        tags?: string;
        token?: string;
        user?: string;
    }

    class PushoverNotifications {
        constructor(options: PushoverOptions);
        token: string;
        send(message: PushoverMessage, callback: (err: any, result: any, response: any) => void): void;
    }

    export = PushoverNotifications;
}

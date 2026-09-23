export interface NotificationInstanceMessage {
    ts: number;
    message: string;
}

export interface NotificationCategoryInstance {
    messages: NotificationInstanceMessage[];
}

/** The payload of the `sendNotification` command sent by the js-controller / notification-manager */
export interface NotificationMessage {
    host: string;
    category: {
        name: string;
        description: string;
        instances: Record<string, NotificationCategoryInstance>;
    };
    [key: string]: unknown;
}

export function isNotificationMessage(value: unknown): value is NotificationMessage {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const category = (value as Record<string, unknown>).category;
    if (!category || typeof category !== 'object') {
        return false;
    }
    const instances = (category as Record<string, unknown>).instances;
    return !!instances && typeof instances === 'object' && !Array.isArray(instances);
}

/** Builds the title and the text of a pushover message from a notification */
export function formatNotification(notification: NotificationMessage): { title: string; message: string } {
    const instances = Object.entries(notification.category.instances).map(([instance, entry]) => {
        const messages = Array.isArray(entry?.messages) ? entry.messages : [];
        const newestMessage = [...messages].sort((a, b) => b.ts - a.ts)[0];

        const instanceName = instance.startsWith('system.adapter.')
            ? instance.substring('system.adapter.'.length)
            : instance;

        if (!newestMessage) {
            return instanceName;
        }

        return `${instanceName}: ${new Date(newestMessage.ts).toLocaleString()} ${newestMessage.message}`;
    });

    const description = notification.category.description ? `${notification.category.description}\n` : '';
    const host = notification.host ? `${notification.host}:\n` : '';

    return {
        title: notification.category.name || '',
        message: `${description}${host}${instances.join('\n')}`,
    };
}

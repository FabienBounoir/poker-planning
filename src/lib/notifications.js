const parseAndValidateNotification = (path) => {
    const notificationInfo = import.meta.env.VITE_NOTIFICATION;

    if (!notificationInfo) {
        return null;
    }

    let notificationParsed;
    try {
        notificationParsed = JSON.parse(notificationInfo);
    } catch (error) {
        console.error("Failed to parse VITE_NOTIFICATION:", error);
        return null;
    }

    const { messages, type, startDate, endDate, paths } = notificationParsed;

    if (!messages || typeof messages !== 'object') {
        return null;
    }

    console.log('paths', paths, path);

    if (paths && !paths.some((p) => path.startsWith(p))) {
        return null;
    }

    const now = new Date();
    if (
        (startDate && new Date(startDate) > now) ||
        (endDate && new Date(endDate) < now)
    ) {
        return null;
    }

    return { messages, type };
};

export const getNotifications = (path) => {
    const notificationData = parseAndValidateNotification(path);

    if (!notificationData) {
        return { message: null, type: null };
    }

    const { messages, type } = notificationData;

    let message = null;
    for (const lang of window.navigator.languages) {
        if (messages[lang]) {
            message = messages[lang];
            break;
        }
    }

    return {
        message: message || messages['en'] || null,
        type: type || 'info',
    };
};

export const hasNotificationsActive = (path) => {
    const notificationData = parseAndValidateNotification(path);
    return !!notificationData;
};
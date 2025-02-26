const avatarName = /\/(\w+)\/svg$/;

export const dataToShortBinary = (date) => {
    const match = date?.avatar?.match?.(avatarName);

    let roomConfiguration = { r: date.roomId, c: date.hexcode };

    if (match) {
        roomConfiguration.a = match[1];
    }

    return btoa(JSON.stringify(roomConfiguration || {}));
}


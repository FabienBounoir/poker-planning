const avatarName = /([^\/]+)\/svg$/;

export const dataToShortBinary = (date) => {
    const match = date?.avatar?.match?.(avatarName);

    let roomConfiguration = { r: date.roomId, c: date.hexcode };

    if (match) {
        roomConfiguration.a = match[1];
    }

    return btoa(JSON.stringify(roomConfiguration || {}));
}

export const arraysAreEqual = (arr1, arr2) =>
    arr1?.length === arr2?.length && arr1.every((val, index) => val === arr2[index]);
const arraysAreEqual = (arr1, arr2) =>
    arr1?.length === arr2?.length && arr1.every((val, index) => val === arr2[index]);

const isImgurUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return (urlObj.protocol === 'https:' || urlObj.protocol === 'http:') && 
               (urlObj.hostname === 'i.imgur.com' || urlObj.hostname === 'imgur.com');
    } catch (e) {
        return false;
    }
};

const sanitizeInput = (input, maxLength = 50) => {
    if (!input || typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength).replace(/[<>\"'&]/g, '');
};

const isValidRoomId = (roomId) => {
    if (!roomId || typeof roomId !== 'string') return false;
    // Room ID should be alphanumeric and reasonable length
    return /^[a-zA-Z0-9]{4,20}$/.test(roomId);
};

const validateAvatar = (avatar) => {
    if (!avatar || !isImgurUrl(avatar)) {
        return undefined; // Rejette l'URL si elle n'est pas valide
    }
    return avatar; // Accepte uniquement les URLs d'Imgur validées
};

module.exports = {
    arraysAreEqual,
    validateAvatar,
    sanitizeInput,
    isValidRoomId
};
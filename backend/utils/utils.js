const arraysAreEqual = (arr1, arr2) =>
    arr1?.length === arr2?.length && arr1.every((val, index) => val === arr2[index]);

const isImgurUrl = (url) =>
    url.startsWith("https://i.imgur.com/") || url.startsWith("http://i.imgur.com/");

const validateAvatar = (avatar) => {
    if (!avatar || !isImgurUrl(avatar)) {
        return undefined; // Rejette l'URL si elle n'est pas valide
    }
    return avatar; // Accepte uniquement les URLs d'Imgur
};

module.exports = {
    arraysAreEqual,
    validateAvatar
};
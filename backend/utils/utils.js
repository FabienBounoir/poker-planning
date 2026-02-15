const ALLOWED_AVATAR_HOSTS = [
  "i.imgur.com",
  "img.draftbot.fr",
  "api.dicebear.com"
];


const arraysAreEqual = (arr1, arr2) =>
    arr1?.length === arr2?.length && arr1.every((val, index) => val === arr2[index]);

const isAllowedAvatarUrl = (url) => {
  try {
    const { protocol, hostname } = new URL(url);

    if (protocol !== "https:" && protocol !== "http:") {
      return false;
    }

    return ALLOWED_AVATAR_HOSTS.includes(hostname);
  } catch {
    return false;
  }
};

const validateAvatar = (avatarUrl) => {
  if (!avatarUrl || !isAllowedAvatarUrl(avatarUrl)) {
    return undefined;
  }
  return avatarUrl;
};

module.exports = {
    arraysAreEqual,
    validateAvatar
};
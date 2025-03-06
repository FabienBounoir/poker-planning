const UserRole = Object.freeze({
    OBSERVER: "observer",
    MANAGER: "manager",
    PLAYER: "player",
});


const isValidRole = (role) => {
    return Object.values(UserRole).includes(role);
};

module.exports = {
    UserRole,
    isValidRole,
};
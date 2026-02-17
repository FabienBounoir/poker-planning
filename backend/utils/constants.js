const UserRole = Object.freeze({
    OBSERVER: "observer",
    MANAGER: "manager",
    PLAYER: "player",
});

const GameState = Object.freeze({
    WAITING: "waiting",
    PLAYING: "playing",
    RESULT: "result",
    DELETED: "deleted",
});

const isValidRole = (role) => {
    return Object.values(UserRole).includes(role);
};

const isValidState = (state) => {
    return Object.values(GameState).includes(state);
};

module.exports = {
    UserRole,
    GameState,
    isValidRole,
    isValidState,
};
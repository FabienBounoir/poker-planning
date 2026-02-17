type User = {
    id: string;
    name: string;
    avatar?: string;
    selectedCard?: string;
    firstVoter?: boolean;
    slowest?: boolean;
    mostChanging?: boolean;
    voteCount?: number;
    disconnected?: boolean;
};

type UserPublic = {
    name: string;
    avatar?: string;
}

export type Users = User[] | null;

export type UsersPublic = UserPublic[] | null;
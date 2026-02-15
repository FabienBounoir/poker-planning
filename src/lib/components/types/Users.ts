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

export type Users = User[] | null;
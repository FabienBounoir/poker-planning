type User = {
    id: string;
    name: string;
    avatar?: string;
    selectedCard?: string;
    firstVoter?: boolean;
};

export type Users = User[] | null;

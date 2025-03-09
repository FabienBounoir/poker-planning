export type ResultItem = {
    item: string;
    players: {
        name: string;
        avatar?: string;
    }[];
    pourcentage: number;
};

export type ResultItems = ResultItem[] | null;

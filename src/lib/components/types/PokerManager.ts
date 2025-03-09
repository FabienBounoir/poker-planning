export type PokerManager = {
    cards: string[];
    state: 'waiting' | 'playing' | 'result';
    hexcode?: string;
    team?: string;
    avatar?: string;
    userStory?: string;
    voteOnResults?: boolean;
    date?: string;
};
import { Rank } from '../types';

export const ATTENDANCE_XP = 10;

type RankInfo = {
    rank: Rank;
    xpThreshold: number;
    color: string;
    textColor: string;
};

export const ranks: RankInfo[] = [
    { rank: Rank.POLLITO_CON_MADERA, xpThreshold: 0, color: 'bg-yellow-200', textColor: 'text-yellow-800' },
    { rank: Rank.APRENDIZ_MELODICO, xpThreshold: 100, color: 'bg-green-200', textColor: 'text-green-800' },
    { rank: Rank.COMPAÑERO_ARMONICO, xpThreshold: 300, color: 'bg-blue-200', textColor: 'text-blue-800' },
    { rank: Rank.SOLISTA_AVENTAJADO, xpThreshold: 600, color: 'bg-purple-200', textColor: 'text-purple-800' },
    { rank: Rank.MAESTRO_DE_ESCENA, xpThreshold: 1000, color: 'bg-red-200', textColor: 'text-red-800' },
    { rank: Rank.MAESTRO_VIRTUOSO_INTERESTELAR, xpThreshold: 1500, color: 'bg-gradient-to-r from-yellow-400 to-orange-500', textColor: 'text-white' }
];

export const getRankInfo = (rank: Rank): RankInfo => {
    return ranks.find(r => r.rank === rank) || ranks[0];
};

export const getRankForXp = (xp: number): Rank => {
    let currentRank = ranks[0].rank;
    for (const rankInfo of ranks) {
        if (xp >= rankInfo.xpThreshold) {
            currentRank = rankInfo.rank;
        } else {
            break;
        }
    }
    return currentRank;
};

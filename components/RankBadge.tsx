import React from 'react';
import { Rank } from '../types';
import { getRankInfo } from '../utils/ranking';

interface RankBadgeProps {
  rank: Rank;
  isSmall?: boolean;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, isSmall = false }) => {
  const { color, textColor } = getRankInfo(rank);

  const baseClasses = "font-bold rounded-full flex items-center justify-center";
  const sizeClasses = isSmall 
    ? "px-2 py-0.5 text-[10px]"
    : "px-3 py-1 text-xs";

  return (
    <div className={`${baseClasses} ${sizeClasses} ${color} ${textColor}`}>
      {rank}
    </div>
  );
};

export default RankBadge;

import React from 'react';
import { UserProfile } from '../types';
import RankBadge from './RankBadge';

interface IDCardProps {
  profile: UserProfile;
}

const IDCard: React.FC<IDCardProps> = ({ profile }) => {
  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden border-2 border-yellow-500/50 p-6 relative">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-700/50 to-transparent"></div>
      
      <div className="flex flex-col items-center relative z-10">
        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-cyan-400 shadow-lg mb-4">
          <img src={profile.photo} alt={profile.fullName} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-3xl font-bold text-white tracking-wide">{profile.fullName}</h3>
        <p className="text-cyan-300">
            {profile.role === 'director' ? 'Director del Conservatorio' : profile.role === 'judge' ? 'Miembro del Jurado' : 'Estudiante del Conservatorio'}
        </p>
      </div>

      <div className="mt-8 space-y-4 relative z-10">
        <div className="text-sm">
          <p className="text-yellow-400 font-semibold">CONDECORACIÓN</p>
          <RankBadge rank={profile.rank} />
        </div>
        <hr className="border-gray-600"/>
        <div className="text-sm">
          <p className="text-yellow-400 font-semibold">EDAD</p>
          <p className="text-gray-200 text-lg">{profile.age} años</p>
        </div>
        <hr className="border-gray-600"/>
        <div className="text-sm">
          <p className="text-yellow-400 font-semibold">RESIDENCIA</p>
          <p className="text-gray-200 text-lg">{profile.residence}</p>
        </div>
        <hr className="border-gray-600"/>
        <div className="text-sm">
          <p className="text-yellow-400 font-semibold">INSTRUMENTO Y EXPERIENCIA</p>
          <p className="text-gray-200 text-lg">{profile.instrument}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
         <h2 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: 'var(--font-serif)'}}>MA</h2>
         <p className="text-xs text-yellow-300 tracking-widest">MAESTRE ARCO</p>
      </div>

    </div>
  );
};

export default IDCard;
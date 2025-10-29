import React from 'react';
import { UserProfile } from '../types';
import { useLanguage } from '../context/LanguageContext';
import IDCard from './IDCard';
import StyledQRCode from './StyledQRCode';

interface DirectorPassScreenProps {
  profile: UserProfile;
  onAcknowledged: () => void;
}

const DirectorPassScreen: React.FC<DirectorPassScreenProps> = ({ profile, onAcknowledged }) => {
  const { t } = useLanguage();

  const isPrimaryDirector = profile.fullName.toLowerCase().includes('richard');
  const qrPrimaryColor = isPrimaryDirector ? '#1e3a8a' : '#581c87'; // blue-800 | purple-800
  const qrSecondaryColor = '#fcd34d'; // amber-300

  const qrData = JSON.stringify({
      type: 'MAESTRE_ARCO_DIRECTOR_PASS',
      name: profile.fullName,
  });


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 animate-fade-in">
      <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-md rounded-lg shadow-2xl shadow-yellow-500/10 border border-yellow-500/30 p-8">
        <h2 className="text-4xl text-center font-bold text-white mb-2">{t('directorPassTitle')}</h2>
        <p className="text-center text-gray-400 mb-8">{t('directorPassSubtitle')}</p>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <IDCard profile={profile} />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-gray-200 rounded-lg">
                <StyledQRCode 
                  data={qrData}
                  primaryColor={qrPrimaryColor}
                  secondaryColor={qrSecondaryColor}
                />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
            <button 
                onClick={onAcknowledged}
                className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
            >
                {t('enterDirectorOfficeButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DirectorPassScreen;

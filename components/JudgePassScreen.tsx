import React from 'react';
import { JudgePassData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import StyledQRCode from './StyledQRCode';

interface JudgePassScreenProps {
  judge: JudgePassData;
  onAcknowledged: () => void;
}

const JudgePassScreen: React.FC<JudgePassScreenProps> = ({ judge, onAcknowledged }) => {
  const { t } = useLanguage();
  
  // Special theme for the female judge
  const isFemaleJudge = judge.name === 'Alexandra Klepper';
  const theme = {
    bg: isFemaleJudge ? 'from-pink-900/50' : 'from-yellow-900/50',
    border: isFemaleJudge ? 'border-pink-500/50' : 'border-yellow-600/50',
    shadow: isFemaleJudge ? 'shadow-pink-500/20' : 'shadow-yellow-500/20',
    text: isFemaleJudge ? 'text-pink-300' : 'text-yellow-400',
    button: isFemaleJudge ? 'bg-pink-600 hover:bg-pink-500' : 'bg-yellow-500 hover:bg-yellow-400 text-gray-900',
    qr: {
        primary: isFemaleJudge ? '#831843' : '#78350F', // pink-800 | amber-800
        secondary: isFemaleJudge ? '#E776B3' : '#FBBF24' // custom pink | amber-400
    }
  };

  const qrData = JSON.stringify({
    type: 'MAESTRE_ARCO_JUDGE_PASS',
    id: judge.id,
    name: judge.name
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 animate-fade-in">
      <div className={`w-full max-w-lg bg-black rounded-2xl shadow-2xl ${theme.shadow} overflow-hidden border-2 ${theme.border} p-8`}>
        <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-b ${theme.bg} to-transparent`}></div>
        
        <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{t('judgePassTitle')}</h1>
            <p className="text-gray-400 mb-6">{t('judgePassSubtitle')}</p>

            <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-400 shadow-lg mb-4 bg-gray-800">
                    <img src={judge.photo} alt={judge.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-lg text-gray-200">{t('judgePassWelcome')}</p>
                <h2 className="text-3xl font-bold text-white tracking-wide">{judge.name}</h2>
                <p className={`${theme.text}`}>{judge.title}</p>
                
                <div className="mt-8 p-3 bg-gray-200 rounded-lg">
                    <StyledQRCode 
                        data={qrData}
                        primaryColor={theme.qr.primary}
                        secondaryColor={theme.qr.secondary}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('judgePassRole')}</p>
            </div>
        </div>

        <div className="mt-10 text-center">
            <button 
                onClick={onAcknowledged}
                className={`px-8 py-3 font-bold rounded-full transition-all duration-300 transform hover:scale-105 ${theme.button}`}
            >
                {t('enterExhibitionHallButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default JudgePassScreen;
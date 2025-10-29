import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QrCodeIcon } from './Icons/QrCodeIcon';

interface UniversalLoginScreenProps {
  onLogin: (name: string) => void;
  onScanPass: () => void;
}

const UniversalLoginScreen: React.FC<UniversalLoginScreenProps> = ({ onLogin, onScanPass }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900"></div>
      <div className="absolute inset-0 bg-gradient-radial-dark"></div>
      
      <div className="relative z-10 p-8 bg-gray-800/60 backdrop-blur-md rounded-lg shadow-2xl border border-yellow-500/30 max-w-md w-full animate-fade-in-up">
        <div className="text-center">
            <h1 
            className="text-4xl font-bold tracking-wider text-white drop-shadow-lg mb-4" 
            style={{ fontFamily: 'var(--font-serif)' }}
            >
            {t('universalLoginTitle')}
            </h1>
            <p className="text-gray-300 mb-8">{t('universalLoginSubtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('universalLoginPlaceholder')}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-gray-900 bg-yellow-500 hover:bg-yellow-400 transition-all duration-300">
                {t('enterButton')}
            </button>
        </form>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">O</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <button 
            onClick={onScanPass}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-cyan-500 text-cyan-300 rounded-md shadow-sm text-lg font-bold hover:bg-cyan-900/50 transition-all duration-300"
        >
            <QrCodeIcon />
            {t('scanJudgePassButton')}
        </button>

      </div>
    </div>
  );
};

export default UniversalLoginScreen;
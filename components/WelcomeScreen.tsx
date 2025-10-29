import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import TextToSpeechButton from './TextToSpeechButton';

interface WelcomeScreenProps {
  onWelcomeComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onWelcomeComplete }) => {
  const { t } = useLanguage();
  const welcomeQuote = t('welcomeQuote');

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://i.ibb.co/bQ4ANDL/maestro-ui.jpg')" }}></div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 text-center p-4 animate-fade-in-up">
        
        <div className="flex justify-center items-center gap-2 max-w-lg mx-auto mb-8">
            <p className="text-lg text-gray-300 italic" style={{ fontFamily: 'var(--font-serif)' }}>
              "{welcomeQuote}"
            </p>
            <TextToSpeechButton textToSpeak={welcomeQuote} />
        </div>
        
        <h1 
          className="text-6xl md:text-8xl font-bold tracking-wider text-white drop-shadow-lg animate-text-glow" 
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          MAESTRE ARCO
        </h1>
        <p className="text-xl md:text-2xl text-yellow-300 tracking-[0.2em] uppercase mt-4">
          Conservatorio Digital con IA
        </p>
        
        <div className="mt-16">
            <button
            onClick={onWelcomeComplete}
            className="px-12 py-4 bg-yellow-500/90 text-gray-900 font-bold text-xl rounded-full border-2 border-yellow-300
                        hover:bg-yellow-400 hover:scale-105 transition-all duration-300 backdrop-blur-sm
                        shadow-[0_0_25px_rgba(234,179,8,_0.7)]"
            >
            Iniciar Viaje Musical
            </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
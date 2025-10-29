import React, { useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import IDCard from './IDCard';
import { useLanguage } from '../context/LanguageContext';
import TextToSpeechButton from './TextToSpeechButton';

interface IDCardScreenProps {
  profile: UserProfile;
  onAcknowledged: () => void;
}

const IDCardScreen: React.FC<IDCardScreenProps> = ({ profile, onAcknowledged }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const subtitle = t('idCardScreenSubtitle');

  useEffect(() => {
    if (qrCodeRef.current && profile && typeof (window as any).QRCode !== 'undefined') {
        qrCodeRef.current.innerHTML = ''; // Clear previous QR code
        const qrData = JSON.stringify({
            name: profile.fullName,
            instrument: profile.instrument,
            conservatory: "Maestre Arco"
        });
        new (window as any).QRCode(qrCodeRef.current, {
            text: qrData,
            width: 192, // 12rem
            height: 192, // 12rem
            colorDark : "#f0f0f0",
            colorLight : "transparent",
        });
    }
  }, [profile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 animate-fade-in">
      <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-md rounded-lg shadow-2xl shadow-cyan-500/10 border border-yellow-500/30 p-8">
        <h2 className="text-4xl text-center font-bold text-white mb-2">{t('idCardTitle')}</h2>
        <div className="flex justify-center items-center gap-2 text-center text-gray-400 mb-8">
            <p>{subtitle}</p>
            <TextToSpeechButton textToSpeak={subtitle} />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <IDCard profile={profile} />
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Credencial Digital</h3>
            <div ref={qrCodeRef} className="p-4 bg-gray-700/50 rounded-lg border border-cyan-400/30"></div>
            <p className="text-sm text-gray-400 mt-4">Escanea este código para verificar tu identidad dentro del conservatorio.</p>
          </div>
        </div>

        <div className="mt-12 text-center">
            <button 
                onClick={onAcknowledged}
                className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
            >
                Proceder al Plan de Estudios
            </button>
        </div>
      </div>
    </div>
  );
};

export default IDCardScreen;
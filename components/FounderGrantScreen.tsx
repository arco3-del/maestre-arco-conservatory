import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FounderGrantScreenProps {
  onGrantClaimed: () => void;
  residence: string;
}

const FounderGrantScreen: React.FC<FounderGrantScreenProps> = ({ onGrantClaimed, residence }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const [giftCode, setGiftCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate a realistic-looking gift card code
    const generateCode = () => {
        const cityCode = residence.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
        const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
        return `MAESTRE-${cityCode}-${randomPart}`;
    };
    const newCode = generateCode();
    setGiftCode(newCode);

    if (qrCodeRef.current && typeof (window as any).QRCode !== 'undefined') {
        qrCodeRef.current.innerHTML = '';
        const qrData = `UBEREATS_UNIVERSAL_GIFT_CODE: ${newCode}`;
        new (window as any).QRCode(qrCodeRef.current, {
            text: qrData,
            width: 192,
            height: 192,
            colorDark : "#111827",
            colorLight : "#f3f4f6",
        });
    }
  }, [residence]);

  const handleCopy = () => {
    navigator.clipboard.writeText(giftCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-gray-100 text-gray-800 rounded-lg shadow-2xl p-8 border-4 border-amber-800" style={{ fontFamily: 'var(--font-serif)' }}>
        <h1 className="text-4xl text-center font-bold text-amber-900 mb-2">{t('founderGrantAwardTitle')}</h1>
        <p className="text-center text-gray-600 mb-6">{t('founderGrantAwardSubtitle')}</p>
        
        <div className="bg-white/50 p-6 rounded-md border border-amber-800/30 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">{t('founderGrantMessage')}</p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8">
            <div ref={qrCodeRef} className="p-2 bg-gray-200 rounded-lg border border-gray-300"></div>
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-700">{t('giftCardCodeLabel')}</h3>
                <div className="my-2 p-3 bg-gray-200 border-2 border-dashed border-gray-400 rounded-md font-mono text-2xl tracking-wider text-amber-900">
                    {giftCode}
                </div>
                <button 
                    onClick={handleCopy}
                    className="w-full bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                >
                    {copied ? t('codeCopied') : t('copyCodeButton')}
                </button>
            </div>
        </div>
        
        <div className="mt-8 text-xs text-gray-500 text-center">
            <p>{t('founderGrantDisclaimer')}</p>
        </div>

        <div className="mt-10 text-center">
            <button 
                onClick={onGrantClaimed}
                className="px-8 py-3 bg-amber-800 text-white font-bold rounded-full hover:bg-amber-700 transition-all duration-300 transform hover:scale-105"
            >
                {t('returnToDashboard')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FounderGrantScreen;
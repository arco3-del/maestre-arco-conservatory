import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DiamondIcon } from './Icons/DiamondIcon';

interface FeatureSuggestionsProps {
    onLeave: () => void;
}

const FeatureSuggestions: React.FC<FeatureSuggestionsProps> = ({ onLeave }) => {
    const { t } = useLanguage();

    const features = [
        { text: 'AI Features', special: true },
        { text: 'Add warm-up exercises' },
        { text: 'Implement vocalization exercises' },
        { text: 'Enhance repertoire practice' },
        { text: 'Improve piano functionality' },
        { text: 'Add sound bank categories' },
        { text: 'Refine AI composer' },
        { text: 'Add theory lesson navigation' },
        { text: 'Improve Live Classroom UI' },
        { text: 'Add audio recording to chat' },
        { text: 'Implement peer feedback' },
    ];

    const FeaturePill: React.FC<{ text: string, special?: boolean }> = ({ text, special }) => (
        <div className={`
            flex items-center justify-center gap-2 px-5 py-3 
            bg-gray-700/50 border border-gray-600/80 rounded-full 
            text-gray-200 text-base font-medium
            transition-all duration-300 transform hover:scale-105 hover:bg-gray-600/50
            ${special ? 'border-cyan-400/50' : ''}
        `}>
            {special && <DiamondIcon />}
            {text}
        </div>
    );

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4 animate-fade-in">
            <div className="w-full max-w-lg">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-6">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('featureSuggestionsScreenTitle')}</h1>
                    <p className="text-lg text-purple-300 mt-2">{t('featureSuggestionsScreenSubtitle')}</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                    {features.map((feature) => (
                        <FeaturePill key={feature.text} text={feature.text} special={feature.special} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeatureSuggestions;

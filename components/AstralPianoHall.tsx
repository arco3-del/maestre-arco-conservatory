import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Piano from './Piano';
import { Composition, ArchivedItem } from '../types';
import { generateComposition, generateSpeechData } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { soundBank } from '../utils/audio';
import { audioService } from '../services/audioService';
import TextToSpeechButton from './TextToSpeechButton';


interface AstralPianoHallProps {
    onLeave: () => void;
    onSaveToArchive: (item: ArchivedItem) => void;
}

type Tab = 'piano' | 'composer' | 'orchestration';

const AstralPianoHall: React.FC<AstralPianoHallProps> = ({ onLeave, onSaveToArchive }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<Tab>('piano');

    const renderContent = () => {
        switch (activeTab) {
            case 'piano':
                return <Piano />;
            case 'composer':
                return <AIComposer onSaveToArchive={onSaveToArchive} />;
            case 'orchestration':
                return <OrchestrationPanel />;
            default:
                return null;
        }
    }

    const TabButton: React.FC<{ tab: Tab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm md:text-base font-bold rounded-t-lg transition-colors border-b-4 ${activeTab === tab ? 'bg-gray-700/80 border-cyan-400 text-white' : 'bg-gray-800/50 border-transparent text-gray-400 hover:bg-gray-700/50'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-4">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="text-center mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('astralPianoHallTitle')}</h1>
                    <p className="text-lg text-cyan-300 mt-2">{t('astralPianoHallDescription')}</p>
                </div>

                <div className="flex space-x-2 border-b border-gray-700">
                    <TabButton tab="piano" label={t('interactivePianoTab')} />
                    <TabButton tab="composer" label={t('aiComposerTab')} />
                    <TabButton tab="orchestration" label={t('orchestrationPanelTab')} />
                </div>

                <div className="mt-1 bg-black/40 backdrop-blur-md p-4 sm:p-6 rounded-b-lg border border-t-0 border-gray-700">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


const AIComposer: React.FC<{ onSaveToArchive: (item: ArchivedItem) => void }> = ({ onSaveToArchive }) => {
    const { language, t } = useLanguage();
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [composition, setComposition] = useState<Composition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isArchived, setIsArchived] = useState(false);

    const handleCompose = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        setError(null);
        setComposition(null);
        setIsArchived(false);
        try {
            const result = await generateComposition(topic, language);
            setComposition(result);
        } catch (err) {
            console.error(err);
            setError(t('compositionError'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (!composition || !topic) return;
        const archiveItem: ArchivedItem = {
            id: `comp-${Date.now()}`,
            type: 'composition',
            title: `Composición: ${topic}`,
            content: composition,
            timestamp: new Date().toISOString(),
        };
        onSaveToArchive(archiveItem);
        setIsArchived(true);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">{t('aiComposerTitle')}</h2>
            <p className="text-center text-gray-400 mb-6">{t('aiComposerSubtitle')}</p>

            <div className="max-w-xl mx-auto">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={t('compositionTopicPlaceholder')}
                        className="flex-grow bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleCompose} disabled={isLoading} className="px-5 py-2 bg-yellow-500 text-gray-900 font-bold rounded-md hover:bg-yellow-400 transition-colors disabled:bg-gray-600">
                        {t('generateCompositionButton')}
                    </button>
                </div>
            </div>

            {isLoading && <div className="mt-8"><LoadingSpinner message={t('composingMessage')} /></div>}
            {error && <p className="text-center text-red-400 mt-4">{error}</p>}
            
            {composition && (
                <div className="mt-8 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/30">
                            <div className="flex justify-between items-start">
                               <h3 className="text-xl font-bold text-cyan-300 mb-3">{t('lyricsTitle')}</h3>
                               <TextToSpeechButton textToSpeak={composition.lyrics} />
                            </div>
                            <p className="text-gray-200 whitespace-pre-line font-serif">{composition.lyrics}</p>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-500/30">
                            <h3 className="text-xl font-bold text-yellow-400 mb-3">{t('musicalDNATitle')}</h3>
                            <div className="space-y-3 text-sm">
                                <p><strong className="text-yellow-300">{t('chordsLabel')}:</strong> {composition.chords}</p>
                                <p><strong className="text-yellow-300">{t('melodyLabel')}:</strong> {composition.melodyDescription}</p>
                                <p><strong className="text-yellow-300">{t('moodLabel')}:</strong> {composition.mood}</p>
                            </div>
                        </div>
                    </div>
                     <div className="mt-6 text-center">
                        <button onClick={handleSave} disabled={isArchived} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                             {isArchived ? t('archiveConfirmation') : t('saveToArchiveButton')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const OrchestrationPanel: React.FC = () => {
    const { t } = useLanguage();

    const handlePlayAISpeech = async (text: string, voice: string) => {
        try {
            const audioData = await generateSpeechData(text, voice);
            audioService.play(audioData);
        } catch (error) {
            console.error(error);
            alert("Could not generate AI voice.");
        }
    };

    const soundCategories = {
        [t('stringsCategory')]: { color: 'cyan', sounds: { 'Violin Pizzicato': soundBank['Violin Pizzicato'], 'Cello Sustain': soundBank['Cello Sustain'] } },
        [t('brassCategory')]: { color: 'yellow', sounds: { 'Trumpet Fanfare': soundBank['Trumpet Fanfare'], 'Tuba Hit': soundBank['Tuba Hit'] } },
        [t('percussionCategory')]: { color: 'red', sounds: { 'Kick Drum': soundBank['Kick Drum'], 'Snare Drum': soundBank['Snare Drum'] } },
        [t('synthsCategory')]: { color: 'purple', sounds: { 'Synth Pad': soundBank['Synth Pad'], 'Synth Lead': soundBank['Synth Lead'] } },
        [t('fxCategory')]: { color: 'green', sounds: { 'Sweep Effect': soundBank['Sweep Effect'] } },
        [t('aiVoicesCategory')]: { color: 'pink', sounds: { 
            [t('voiceKore')]: () => handlePlayAISpeech("La", 'Kore'),
            [t('voicePuck')]: () => handlePlayAISpeech("Ah", 'Puck')
        } },
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">{t('orchestrationPanelTitle')}</h2>
            <p className="text-center text-gray-400 mb-6">{t('orchestrationPanelSubtitle')}</p>

            <div className="space-y-6">
                {Object.entries(soundCategories).map(([category, { color, sounds }]) => (
                    <div key={category}>
                        <h3 className={`text-xl font-bold text-${color}-400 border-b-2 border-${color}-400/50 pb-1 mb-3`}>{category}</h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(sounds).map(([name, playSound]) => (
                                <button key={name} onClick={playSound} className={`px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 hover:text-white transition-colors border-b-4 border-gray-800 hover:border-${color}-500`}>
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default AstralPianoHall;
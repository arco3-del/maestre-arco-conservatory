import React, { useState } from 'react';
import { generateSpeechData } from '../services/geminiService';
import { audioService } from '../services/audioService';
import { SoundIcon } from './Icons/SoundIcon';

interface TextToSpeechButtonProps {
    textToSpeak: string;
    voice?: string;
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ textToSpeak, voice = 'Charon' }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handlePlay = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            audioService.stop();
            setIsPlaying(false);
            return;
        }

        if (isLoading || !textToSpeak) return;

        setIsLoading(true);
        try {
            const audioData = await generateSpeechData(textToSpeak, voice);
            setIsPlaying(true);
            await audioService.play(audioData, () => {
                setIsPlaying(false);
            });
        } catch (error) {
            console.error("Could not play speech:", error);
            setIsPlaying(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            onClick={handlePlay} 
            className="p-1.5 rounded-full hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading}
            aria-label="Read text aloud"
        >
             {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
             ) : (
                <SoundIcon className={isPlaying ? 'animate-pulse-mic text-cyan-400' : 'text-yellow-400'} />
             )}
        </button>
    );
};

export default TextToSpeechButton;
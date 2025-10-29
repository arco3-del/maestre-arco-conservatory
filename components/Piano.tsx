

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { playPianoNote, playOrganNote } from '../utils/audio';

type SoundType = 'piano' | 'organ';

interface PianoProps {
    highlightedKeys?: Set<string>;
}

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getFrequency = (note: string, octave: number): number => {
    const a4 = 440;
    const noteIndex = notes.indexOf(note);
    const semitonesFromA4 = (octave - 4) * 12 + noteIndex - 9;
    return a4 * Math.pow(2, semitonesFromA4 / 12);
};

const KEYBOARD_MAP: { [key: string]: string } = {
    'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E', 'f': 'F',
    't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A', 'u': 'A#', 'j': 'B',
    'k': 'C5'
};

const Piano: React.FC<PianoProps> = ({ highlightedKeys }) => {
    const { t } = useLanguage();
    const [soundType, setSoundType] = useState<SoundType>('piano');
    const [octave, setOctave] = useState(4);
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const organStops = useRef<{ [key: string]: () => void }>({});

    const playNote = (note: string, currentOctave: number) => {
        const fullNote = `${note}${currentOctave}`;
        if (pressedKeys.has(fullNote)) return;

        setPressedKeys(prev => new Set(prev).add(fullNote));
        const frequency = getFrequency(note, currentOctave);
        if (soundType === 'piano') {
            playPianoNote(frequency);
        } else {
            organStops.current[fullNote] = playOrganNote(frequency);
        }
    };

    const stopNote = (note: string, currentOctave: number) => {
        const fullNote = `${note}${currentOctave}`;
        setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(fullNote);
            return newSet;
        });
        if (soundType === 'organ' && organStops.current[fullNote]) {
            organStops.current[fullNote]();
            delete organStops.current[fullNote];
        }
    };
    
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        const note = KEYBOARD_MAP[key];
        if (note) {
            let noteName = note;
            let currentOctave = octave;
            if (note.includes('5')) {
                noteName = note.replace('5', '');
                currentOctave = octave + 1;
            }
            playNote(noteName, currentOctave);
        }
    }, [octave, soundType, pressedKeys]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        const note = KEYBOARD_MAP[key];
        if (note) {
            let noteName = note;
            let currentOctave = octave;
            if (note.includes('5')) {
                noteName = note.replace('5', '');
                currentOctave = octave + 1;
            }
            stopNote(noteName, currentOctave);
        }
    }, [octave, soundType]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    const renderKeys = (startOctave: number, numOctaves: number) => {
        const keys = [];
        for (let o = startOctave; o < startOctave + numOctaves; o++) {
            for (const note of notes) {
                const isBlack = note.includes('#');
                const fullNote = `${note}${o}`;
                const isPressed = pressedKeys.has(fullNote) || (highlightedKeys && highlightedKeys.has(fullNote));
                keys.push(
                    <div
                        key={fullNote}
                        onMouseDown={() => playNote(note, o)}
                        onMouseUp={() => stopNote(note, o)}
                        onMouseLeave={() => stopNote(note, o)}
                        onTouchStart={(e) => { e.preventDefault(); playNote(note, o); }}
                        onTouchEnd={(e) => { e.preventDefault(); stopNote(note, o); }}
                        className={`
                            relative border-2 border-gray-800 rounded-b-md cursor-pointer
                            ${isBlack ? 'bg-gray-800 text-white h-2/3 w-1/12 -ml-2 -mr-2 z-10' : 'bg-white text-black h-full w-1/12'}
                            ${isPressed ? (isBlack ? 'bg-cyan-700' : 'bg-cyan-300') : (isBlack ? 'hover:bg-gray-700' : 'hover:bg-gray-200')}
                        `}
                        style={{
                           ...(isBlack && { marginLeft: '-2.5%', marginRight: '-2.5%', width: '5%' })
                        }}
                    >
                       
                    </div>
                );
            }
        }
        return keys;
    };

    return (
        <div className="animate-fade-in flex flex-col items-center">
            <div className="w-full max-w-4xl p-4 bg-gray-800/60 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-white">{t('instrument')}</span>
                    <div className="flex bg-gray-700 rounded-md p-1">
                        <button onClick={() => setSoundType('piano')} className={`px-3 py-1 text-sm rounded ${soundType === 'piano' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>{t('pianoSound')}</button>
                        <button onClick={() => setSoundType('organ')} className={`px-3 py-1 text-sm rounded ${soundType === 'organ' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>{t('organSound')}</button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <span className="font-bold text-white">{t('octave')}</span>
                     <div className="flex items-center bg-gray-700 rounded-md p-1">
                        <button onClick={() => setOctave(o => Math.max(1, o - 1))} className="px-3 py-1 font-mono text-lg text-gray-300 hover:bg-gray-600 rounded">-</button>
                        <span className="px-4 font-bold text-white text-lg">{octave}</span>
                        <button onClick={() => setOctave(o => Math.min(6, o + 1))} className="px-3 py-1 font-mono text-lg text-gray-300 hover:bg-gray-600 rounded">+</button>
                     </div>
                </div>
            </div>
            
            <div className="w-full max-w-4xl h-48 relative flex">
                {renderKeys(octave, 2)}
            </div>
            <p className="text-gray-400 text-xs mt-3 text-center">Tip: You can use your computer keyboard to play (A, W, S, E, D, F, T, G, Y, H, U, J, K).</p>
        </div>
    );
};

export default Piano;
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getPitch, frequencyToNoteName, noteToFrequency } from '../utils/pitch';
import { playPianoNote } from '../utils/audio';
import { generateSpeechData, analyzeVocalPerformance, analyzeWarmUpRepetition } from '../services/geminiService';
import { audioService } from '../services/audioService';
import TextToSpeechButton from './TextToSpeechButton';
import { VocalFeedback } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Piano from './Piano';

type ExerciseType = 'idle' | 'warm-up' | 'vocalization' | 'repertoire';

// --- WARM-UP SUB-COMPONENT ---
const WARM_UP_EXERCISES = [
    { type: 'breathing', instruction_es: 'Comencemos con la respiración. Inhala profundamente por la nariz durante 4 segundos... Sostén... Y exhala lentamente por la boca durante 8 segundos. Ahora, repítelo.', instruction_en: 'Let us begin with breathing. Inhale deeply through your nose for 4 seconds... Hold... And exhale slowly through your mouth for 8 seconds. Now, you repeat it.' },
    { type: 'consonant', instruction_es: 'Excelente. Ahora, con los labios relajados, haz este sonido: "brrr, brrr, brrr". Siente la vibración. Ahora, es tu turno.', instruction_en: 'Excellent. Now, with relaxed lips, make this sound: "brrr, brrr, brrr". Feel the vibration. Now, it\'s your turn.' },
    { type: 'consonant', instruction_es: 'Muy bien. Continuemos con las consonantes. Repite: "Ma-Me-Mi-Mo-Mu". Claro y articulado. Ahora tú.', instruction_en: 'Very good. Let us continue with consonants. Repeat: "Ma-Me-Mi-Mo-Mu". Clear and articulate. Now you.' }
];

const WarmUpExercise: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t, language } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [studentRecordingState, setStudentRecordingState] = useState<'idle' | 'recording' | 'analyzing' | 'feedback'>('idle');
    const [feedback, setFeedback] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const playInstruction = useCallback(() => {
        const exercise = WARM_UP_EXERCISES[currentIndex];
        const instruction = language === 'es' ? exercise.instruction_es : exercise.instruction_en;
        generateSpeechData(instruction, 'Kore').then(audioData => audioService.play(audioData));
    }, [currentIndex, language]);

    useEffect(() => {
        playInstruction();
    }, [playInstruction]);

    const handleStartRecording = async () => {
        setStudentRecordingState('recording');
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                setStudentRecordingState('analyzing');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const exercise = WARM_UP_EXERCISES[currentIndex];
                const instruction = language === 'es' ? exercise.instruction_es : exercise.instruction_en;
                try {
                    const result = await analyzeWarmUpRepetition(audioBlob, instruction);
                    setFeedback(result.feedback);
                } catch (e) {
                    console.error(e);
                    setFeedback(t('analysisError'));
                } finally {
                    setStudentRecordingState('feedback');
                }
            };
            mediaRecorderRef.current.start();
        } catch (err) {
            console.error(err);
            setFeedback(t('mediaAccessError'));
            setStudentRecordingState('feedback');
        }
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current?.stop();
    };

    const handleNext = () => {
        setStudentRecordingState('idle');
        setFeedback(null);
        setCurrentIndex((prev) => (prev + 1) % WARM_UP_EXERCISES.length);
    };

    const resetExercise = () => {
        setStudentRecordingState('idle');
        setFeedback(null);
        playInstruction();
    };

    return (
        <div className="text-center animate-fade-in-up">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">{t('warmUpButton')}</h3>
            <div className="p-6 bg-gray-900/50 rounded-lg min-h-[150px] flex items-center justify-center border border-gray-700">
                <p className="text-lg italic text-white">"{language === 'es' ? WARM_UP_EXERCISES[currentIndex].instruction_es : WARM_UP_EXERCISES[currentIndex].instruction_en}"</p>
            </div>
            
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                {studentRecordingState === 'idle' && (
                    <button onClick={handleStartRecording} className="w-full py-3 bg-cyan-600 font-bold rounded-lg hover:bg-cyan-500">Graba tu repetición</button>
                )}
                {studentRecordingState === 'recording' && (
                     <button onClick={handleStopRecording} className="w-full py-3 bg-red-600 font-bold rounded-lg animate-pulse">Detener Grabación</button>
                )}
                 {studentRecordingState === 'analyzing' && <LoadingSpinner message="Analizando..." />}
                 {studentRecordingState === 'feedback' && feedback && (
                     <div className="animate-fade-in">
                        <h4 className="font-bold text-yellow-300">Análisis de la Sra. Glorifique:</h4>
                        <p className="text-gray-200 mt-2 italic">"{feedback}"</p>
                        <div className="flex gap-4 mt-4">
                            <button onClick={resetExercise} className="flex-1 py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500">Intentar de nuevo</button>
                            <button onClick={handleNext} className="flex-1 py-2 px-4 bg-cyan-600 rounded-lg hover:bg-cyan-500">Siguiente Ejercicio</button>
                        </div>
                     </div>
                 )}
            </div>

            <button onClick={onBack} className="w-full mt-6 py-2 px-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">{t('backToStudioButton')}</button>
        </div>
    );
};


// --- VOCALIZATION SUB-COMPONENT ---
const VOCALIZATION_EXERCISES = [
  { name: 'Arpegio de Do Mayor', notes: [{ note: 'C', octave: 4 }, { note: 'E', octave: 4 }, { note: 'G', octave: 4 }] },
  { name: 'Arpegio de Sol Mayor', notes: [{ note: 'G', octave: 4 }, { note: 'B', octave: 4 }, { note: 'D', octave: 5 }] },
  { name: 'Arpegio de Fa Mayor', notes: [{ note: 'F', octave: 4 }, { note: 'A', octave: 4 }, { note: 'C', octave: 5 }] },
];

interface VocalizationPattern {
  name: string;
  notes: { note: string; octave: number }[];
}

const VocalizationExerciseList: React.FC<{ onSelect: (exercise: VocalizationPattern) => void }> = ({ onSelect }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 text-center">Ejercicios de Vocalización</h3>
            <p className="text-gray-300 mb-6 text-center">Selecciona un ejercicio para comenzar.</p>
            <div className="space-y-3">
                {VOCALIZATION_EXERCISES.map((ex, i) => (
                    <button key={i} onClick={() => onSelect(ex)} className="w-full p-4 bg-gray-700/50 rounded-lg text-left hover:bg-cyan-900/50 transition-colors border border-transparent hover:border-cyan-500">
                        <p className="font-bold text-white">{ex.name}</p>
                        <p className="text-xs text-gray-400">{ex.notes.map(n => n.note).join(' - ')}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const VocalizationExercise: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t, language } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'playing' | 'listening' | 'analyzing' | 'feedback' | 'error'>('idle');
    const [exerciseStep, setExerciseStep] = useState<'selection' | 'performing'>('selection');
    const [currentExercise, setCurrentExercise] = useState<VocalizationPattern | null>(null);
    const [highlightedKeys, setHighlightedKeys] = useState<Set<string>>(new Set());
    const [feedback, setFeedback] = useState<VocalFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(7);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);

    const cleanup = useCallback(() => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
        audioService.stop();
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        cleanup();
        setStatus('analyzing');
    }, [cleanup]);

    const visualize = useCallback(() => {
        if (!analyserRef.current || !canvasRef.current || !audioContextRef.current) return;
        
        animationFrameRef.current = requestAnimationFrame(visualize);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(dataArray);

        ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#a7f3d0';
        ctx.beginPath();
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] * canvas.height/2;
            const y = canvas.height/2 + v;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();

        const pitch = getPitch(dataArray, audioContextRef.current.sampleRate);
        if (pitch > 0) {
            const noteInfo = frequencyToNoteName(pitch);
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 24px "Cormorant Garamond"';
            ctx.textAlign = 'center';
            ctx.fillText(`${noteInfo.name}${noteInfo.octave}`, canvas.width - 40, 30);
        }
    }, []);


    const startRecording = async () => {
        setStatus('listening');
        setTimer(7);
        audioChunksRef.current = [];
        
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;
            source.connect(analyserRef.current);

            mediaRecorderRef.current = new MediaRecorder(streamRef.current);
            mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const graphImage = canvasRef.current?.toDataURL('image/png') || '';
                
                try {
                    const prompt = t('analyzeVocalizationPrompt');
                    const result = await analyzeVocalPerformance(audioBlob, graphImage, prompt);
                    setFeedback(result);
                    setStatus('feedback');
                } catch(err) {
                    console.error(err);
                    setError(t('analysisError'));
                    setStatus('error');
                }
            };

            mediaRecorderRef.current.start();
            visualize();

            timerRef.current = window.setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error(err);
            setError(t('mediaAccessError'));
            setStatus('error');
        }
    };
    
    const playSpeech = async (text: string, voice: string = 'Kore'): Promise<void> => {
        try {
            const audioData = await generateSpeechData(text, voice);
            return new Promise(resolve => audioService.play(audioData, resolve));
        } catch (error) {
            console.error("Speech generation failed:", error);
            return Promise.resolve();
        }
    };

    const playNotesSequentially = async (notes: { note: string; octave: number }[]) => {
        for (const noteInfo of notes) {
            const fullNote = `${noteInfo.note}${noteInfo.octave}`;
            setHighlightedKeys(new Set([fullNote]));
            playPianoNote(noteToFrequency(noteInfo.note, noteInfo.octave));
            await new Promise(res => setTimeout(res, 600));
        }
        setHighlightedKeys(new Set());
    };

    const handleStartExercise = async (exercise: VocalizationPattern) => {
        setStatus('playing');
        setFeedback(null);
        setError(null);

        const noteNames = exercise.notes.map(n => n.note.replace('#', ' sostenido')).join(', ');
        
        await playSpeech(language === 'es' ? `Practiquemos: ${exercise.name}. Las notas son ${noteNames}. Primero, las tocaré en el piano.` : `Let's practice: ${exercise.name}. The notes are ${noteNames}. First, I'll play them on the piano.`);
        await playNotesSequentially(exercise.notes);
        await new Promise(res => setTimeout(res, 500));

        await playSpeech(language === 'es' ? "Ahora, escucha cómo las canto." : "Now, listen as I sing them.");
        await playNotesSequentially(exercise.notes);
        await new Promise(res => setTimeout(res, 500));

        await playSpeech(language === 'es' ? "Tu turno. ¡Adelante!" : "Your turn. Go ahead!");
        
        startRecording();
    };


    const handleSelectExercise = (exercise: VocalizationPattern) => {
        setCurrentExercise(exercise);
        setExerciseStep('performing');
        handleStartExercise(exercise);
    };

    const reset = () => {
        cleanup();
        setStatus('idle');
        setFeedback(null);
        setError(null);
        if (currentExercise) {
            handleStartExercise(currentExercise);
        }
    };

    const backToSelection = () => {
        cleanup();
        setExerciseStep('selection');
        setCurrentExercise(null);
        setStatus('idle');
    }
    
    const FeedbackItem: React.FC<{ label: string, value: string, colorClass: string }> = ({ label, value, colorClass }) => (
        <div>
            <strong className={`${colorClass} block`}>{label}</strong>
            <p className="text-gray-300 mt-1">{value}</p>
        </div>
    );
    
    if (exerciseStep === 'selection') {
        return (
             <div className="text-center animate-fade-in-up">
                <VocalizationExerciseList onSelect={handleSelectExercise} />
                <button onClick={onBack} className="w-full mt-6 py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">{t('backToStudioButton')}</button>
            </div>
        )
    }

    return (
        <div className="text-center animate-fade-in-up">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">{currentExercise?.name}</h3>
            
            <canvas ref={canvasRef} width="600" height="150" className="w-full bg-gray-900 rounded-lg border border-gray-700 mb-4"></canvas>

            {status === 'playing' && <p className="text-yellow-400 font-bold animate-pulse">Escucha...</p>}
            {status === 'listening' && <div className="text-center">
                <p className="text-2xl font-bold text-red-400 animate-pulse">{t('listeningStatus')} {timer}s</p>
                <button onClick={stopRecording} className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-full">{t('stopListeningButton')}</button>
            </div>}
            {status === 'analyzing' && <LoadingSpinner message={t('thematicAnalyzingStatus')} />}
            {status === 'error' && <div className="p-4 bg-red-900/50 rounded-lg"><p className="text-red-300">{error}</p><button onClick={reset} className="mt-4 px-4 py-2 bg-gray-600 rounded-md">{t('tryAgainButton')}</button></div>}

            {status === 'feedback' && feedback && (
                 <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-4 animate-fade-in border border-yellow-500/30">
                    <h4 className="text-xl font-bold text-yellow-300 text-center">{t('glorifiqueFeedbackTitle')}</h4>
                    <FeedbackItem label={t('pitchAnalysisLabel')} value={feedback.pitchAnalysis} colorClass="text-cyan-300" />
                    <FeedbackItem label={t('rhythmAnalysisLabel')} value={feedback.rhythmAnalysis} colorClass="text-green-300" />
                    <FeedbackItem label={t('breathingAnalysisLabel')} value={feedback.breathingAnalysis} colorClass="text-purple-300" />
                    <div className="pt-3 border-t border-gray-700">
                        <strong className="text-yellow-300 block">{t('overallFeedback')}</strong>
                        <p className="text-gray-200 mt-1 italic">"{feedback.overallFeedback}"</p>
                    </div>
                    <button onClick={reset} className="w-full mt-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors">{t('practiceAgainButton')}</button>
                </div>
            )}
            
            <div className="my-6">
                <Piano highlightedKeys={highlightedKeys} />
            </div>
            
            <button onClick={backToSelection} className="w-full mt-4 py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">Volver a Ejercicios</button>
        </div>
    );
};


// --- REPERTOIRE SUB-COMPONENT ---
const RepertoirePractice: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'recording' | 'analyzing' | 'feedback' | 'error'>('idle');
    const [feedback, setFeedback] = useState<VocalFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);


    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        streamRef.current?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('analyzing');
    }, []);
    
     const visualize = useCallback(() => {
        if (!analyserRef.current || !canvasRef.current || !audioContextRef.current) return;
        
        animationFrameRef.current = requestAnimationFrame(visualize);
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const bufferLength = analyserRef.current.fftSize;
        const dataArray = new Float32Array(bufferLength);
        analyserRef.current.getFloatTimeDomainData(dataArray);

        ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#f472b6';
        ctx.beginPath();
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] * canvas.height/2;
            const y = canvas.height/2 + v;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();

        const pitch = getPitch(dataArray, audioContextRef.current.sampleRate);
        if (pitch > 0) {
            const noteInfo = frequencyToNoteName(pitch);
            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 28px "Cormorant Garamond"';
            ctx.textAlign = 'right';
            ctx.fillText(`${noteInfo.name}${noteInfo.octave}`, canvas.width - 20, 40);
        }
    }, []);


    const startRecording = async () => {
        setStatus('recording');
        setError(null);
        setFeedback(null);
        setRecordingTime(0);
        audioChunksRef.current = [];
        
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;
            source.connect(analyserRef.current);

            mediaRecorderRef.current = new MediaRecorder(streamRef.current);
            mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const graphImage = canvasRef.current?.toDataURL('image/png') || '';
                
                try {
                    const prompt = t('analyzeVocalRepertoirePrompt');
                    const result = await analyzeVocalPerformance(audioBlob, graphImage, prompt);
                    setFeedback(result);
                    setStatus('feedback');
                } catch(err) {
                    console.error(err);
                    setError(t('analysisError'));
                    setStatus('idle');
                }
            };

            mediaRecorderRef.current.start();
            visualize();
            timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
        } catch (err) {
            console.error(err);
            setError(t('mediaAccessError'));
            setStatus('idle');
        }
    };

    const FeedbackItem: React.FC<{ label: string, value: string, colorClass: string }> = ({ label, value, colorClass }) => (
        <div>
            <strong className={`${colorClass} block`}>{label}</strong>
            <p className="text-gray-300 mt-1">{value}</p>
        </div>
    );
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="animate-fade-in-up">
            <h3 className="text-2xl font-bold text-cyan-300 mb-2 text-center">{t('repertoireButton')}</h3>
            <p className="text-gray-300 mb-4 text-center">Graba una pieza libremente. La Sra. Glorifique analizará tu interpretación.</p>
            <div className="relative">
                <canvas ref={canvasRef} width="600" height="250" className="w-full bg-gray-900 rounded-lg border-2 border-gray-700 mb-4"></canvas>
                {status === 'recording' && <div className="absolute top-4 left-4 font-mono text-xl text-white bg-black/50 px-3 py-1 rounded-md">{formatTime(recordingTime)}</div>}
            </div>
            
            <div className="flex justify-center my-4">
                {status === 'idle' && <button onClick={startRecording} className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600 shadow-lg hover:bg-gray-600 transition-all"><div className="w-12 h-12 bg-red-600 rounded-full"></div></button>}
                {status === 'recording' && <button onClick={stopRecording} className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600 animate-pulse"><div className="w-8 h-8 bg-red-500 rounded-sm"></div></button>}
            </div>

            {status === 'analyzing' && <LoadingSpinner message={t('thematicAnalyzingStatus')} />}
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}

            {status === 'feedback' && feedback && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-4 animate-fade-in border border-yellow-500/30">
                    <h4 className="text-xl font-bold text-yellow-300 text-center">{t('glorifiqueFeedbackTitle')}</h4>
                    <FeedbackItem label={t('pitchAnalysisLabel')} value={feedback.pitchAnalysis} colorClass="text-cyan-300" />
                    <FeedbackItem label={t('rhythmAnalysisLabel')} value={feedback.rhythmAnalysis} colorClass="text-green-300" />
                    <FeedbackItem label={t('breathingAnalysisLabel')} value={feedback.breathingAnalysis} colorClass="text-purple-300" />
                    <div className="pt-3 border-t border-gray-700">
                        <strong className="text-yellow-300 block">{t('overallFeedback')}</strong>
                        <p className="text-gray-200 mt-1 italic">"{feedback.overallFeedback}"</p>
                    </div>
                    <button onClick={() => setStatus('idle')} className="w-full mt-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors">{t('practiceAgainButton')}</button>
                </div>
            )}
            
            <button onClick={onBack} className="w-full mt-6 py-2 px-4 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">{t('backToStudioButton')}</button>
        </div>
    );
}

// --- MAIN VOICE HALL COMPONENT ---
const VoiceHall: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
    const { t } = useLanguage();
    const [exerciseType, setExerciseType] = useState<ExerciseType>('idle');
    const welcomeMessage = t('voiceHallWelcome');

    useEffect(() => {
        if (exerciseType === 'idle') {
            generateSpeechData(welcomeMessage, 'Kore').then(audioData => audioService.play(audioData));
        }
    }, [t, exerciseType, welcomeMessage]);

    const renderContent = () => {
        switch(exerciseType) {
            case 'warm-up':
                return <WarmUpExercise onBack={() => setExerciseType('idle')} />;
            case 'vocalization':
                return <VocalizationExercise onBack={() => setExerciseType('idle')} />;
            case 'repertoire':
                return <RepertoirePractice onBack={() => setExerciseType('idle')} />;
            default:
                return (
                    <div className="space-y-6 animate-fade-in">
                         <div className="my-8">
                           <Piano />
                        </div>
                        <ExerciseCard title={t('warmUpButton')} description="Prepara tu voz con ejercicios de respiración y articulación." onClick={() => setExerciseType('warm-up')} />
                        <ExerciseCard title={t('vocalizationButton')} description="Practica tu afinación con arpegios y escalas guiadas." onClick={() => setExerciseType('vocalization')} />
                        <ExerciseCard title={t('repertoireButton')} description="Canta una pieza y recibe un análisis detallado de la Sra. Glorifique." onClick={() => setExerciseType('repertoire')} />
                    </div>
                );
        }
    };
    
    const ExerciseCard: React.FC<{ title: string; description: string; onClick: () => void }> = ({ title, description, onClick }) => (
        <button onClick={onClick} className="w-full p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-cyan-500/20 text-left hover:bg-cyan-900/40 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105">
            <h3 className="text-2xl font-bold text-cyan-300">{title}</h3>
            <p className="text-gray-400 mt-1">{description}</p>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                {exerciseType === 'idle' ? (
                     <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-4">
                        &larr; {t('backToDashboardButton')}
                    </button>
                ) : null}
               
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('vocalCoachTitle')}</h1>
                    {exerciseType === 'idle' && (
                        <div className="flex justify-center items-center gap-2">
                            <p className="text-lg text-pink-300 mt-2 italic">"{welcomeMessage}" - Sra. Glorifique</p>
                            <TextToSpeechButton textToSpeak={welcomeMessage} voice="Kore" />
                        </div>
                    )}
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default VoiceHall;
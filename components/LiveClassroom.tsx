import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { UserProfile, FinalEvaluation } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { decode, encode, decodeAudioData } from '../utils/audio';
import { generateFinalEvaluation } from '../services/geminiService';
import TextToSpeechButton from './TextToSpeechButton';
import { getApiKey } from '../utils/apiKey';

interface LiveClassroomProps {
    profile: UserProfile;
    onEvaluationComplete: (result: FinalEvaluation) => void;
}

type SessionStatus = 'connecting' | 'active' | 'ended' | 'evaluating' | 'complete' | 'error';
type TranscriptItem = { speaker: 'user' | 'maestre', text: string, isPartial: boolean };

const LiveClassroom: React.FC<LiveClassroomProps> = ({ profile, onEvaluationComplete }) => {
    const { language, t } = useLanguage();
    const currentModule = profile.studyPlan!.modules[profile.currentModuleIndex];

    const [status, setStatus] = useState<SessionStatus>('connecting');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [finalEvaluation, setFinalEvaluation] = useState<FinalEvaluation | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);

    const outputAudioContext = useMemo(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }), []);
    let nextStartTime = 0;

    const addOrUpdateTranscript = (speaker: 'user' | 'maestre', text: string, isPartial: boolean) => {
        setTranscript(prev => {
            const lastItem = prev[prev.length - 1];
            if (lastItem?.speaker === speaker && lastItem?.isPartial) {
                const newTranscript = [...prev];
                newTranscript[newTranscript.length - 1] = { ...lastItem, text: lastItem.text + text, isPartial };
                return newTranscript;
            }
            if (isPartial && text.trim() !== '') {
                 return [...prev, { speaker, text, isPartial }];
            }
            if (!isPartial) {
                 const newTranscript = prev.map(item => item.speaker === speaker ? { ...item, isPartial: false } : item);
                 return text.trim() !== '' ? [...newTranscript, { speaker, text, isPartial }] : newTranscript;
            }
            return prev;
        });
    };

    const processFinalEvaluation = async () => {
        setStatus('evaluating');
        const fullTranscript = transcript
            .map(item => `${item.speaker === 'user' ? 'Student' : 'Maestre'}: ${item.text}`)
            .join('\n');
        
        try {
            const result = await generateFinalEvaluation(fullTranscript, currentModule, language);
            setFinalEvaluation(result);
            setStatus('complete');
        } catch (err) {
            console.error(err);
            setError(t('evaluationGenerationError'));
            setStatus('error');
        }
    };
    
    const cleanup = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioWorkletNodeRef.current) {
            audioWorkletNodeRef.current.disconnect();
            audioWorkletNodeRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
    }, []);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const systemInstruction = t('liveSessionSystemInstruction', {
            instrument: profile.instrument,
            moduleNum: currentModule.module.toString(),
            moduleTitle: currentModule.title
        });

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                systemInstruction,
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
            callbacks: {
                onopen: async () => {
                    try {
                        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        inputAudioContextRef.current = inputAudioContext;
                        
                        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = inputAudioContext.createMediaStreamSource(streamRef.current);
                        
                        await inputAudioContext.audioWorklet.addModule('/audio-processor.js');
                        const workletNode = new AudioWorkletNode(inputAudioContext, 'audio-processor');
                        
                        workletNode.port.onmessage = (event) => {
                            const inputData = event.data as Float32Array;
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };

                        source.connect(workletNode);
                        workletNode.connect(inputAudioContext.destination);
                        audioWorkletNodeRef.current = workletNode;
                        setStatus('active');
                    } catch (err) {
                        console.error('Error setting up audio pipeline:', err);
                        setError(t('mediaAccessError'));
                        setStatus('error');
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        addOrUpdateTranscript('user', message.serverContent.inputTranscription.text, true);
                    }
                     if (message.serverContent?.outputTranscription) {
                        addOrUpdateTranscript('maestre', message.serverContent.outputTranscription.text, true);
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscript(prev => prev.map(item => ({...item, isPartial: false})));
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audioData) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                    }
                },
                onclose: () => {
                   if (status !== 'complete' && status !== 'evaluating') processFinalEvaluation();
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setError(t('liveSessionError'));
                    setStatus('error');
                    cleanup();
                },
            },
        });

        return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderStatus = () => {
        const messages: Record<SessionStatus, string> = {
            connecting: t('connecting'),
            active: t('maestreIsListening'),
            ended: t('sessionEnded'),
            evaluating: t('evaluatingPerformance'),
            complete: t('evaluationResultTitle'),
            error: t('errorOccurred'),
        };
        const message = messages[status];
        const canSpeak = status === 'evaluating' || status === 'ended';
        return (
            <div className="flex justify-center items-center gap-2">
                <p className="text-center text-cyan-300 animate-pulse">{message}</p>
                {canSpeak && <TextToSpeechButton textToSpeak={message} />}
            </div>
        );
    };

    const renderScores = (score: FinalEvaluation['score']) => (
        <div className="mt-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationIntonation')}:</strong> {score.intonation}/5</div>
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationRhythm')}:</strong> {score.rhythm}/5</div>
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationMusicality')}:</strong> {score.musicality}/5</div>
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationInterpretation')}:</strong> {score.interpretation}/5</div>
            </div>
            <div className={`mt-4 p-4 rounded-lg text-center font-bold transition-all duration-500 ${score.total >= 18.5 ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                <span className="block text-xs font-normal opacity-80">{t('totalScore')}</span>
                <span className="text-4xl">{score.total.toFixed(1)}</span><span className="text-lg opacity-80">/ 20</span>
            </div>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-md p-4 sm:p-8 rounded-lg border border-gray-700 flex flex-col" style={{minHeight: '80vh'}}>
                <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">{t('liveClassroomTitle')}</h1>
                {renderStatus()}
                
                <div className="my-4 flex-grow bg-gray-800/50 p-4 rounded-lg h-96 overflow-y-auto space-y-4">
                    {transcript.map((item, index) => (
                        <div key={index} className={`flex items-end gap-2 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {item.speaker === 'maestre' && <div className="w-8 h-8 rounded-full bg-yellow-800 flex-shrink-0"></div>}
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${item.speaker === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-600 text-white rounded-bl-none'} ${item.isPartial ? 'opacity-70' : ''}`}>
                               <span>{item.text}</span>
                           </div>
                        </div>
                    ))}
                </div>

                {status === 'active' && (
                    <button onClick={cleanup} className="w-full mt-4 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500">{t('endSessionButton')}</button>
                )}

                {status === 'complete' && finalEvaluation && (
                    <div className="animate-fade-in-up mt-4">
                        <div className={`p-4 rounded-lg text-center font-bold mb-4 ${finalEvaluation.passed ? 'bg-green-900/80 text-green-300' : 'bg-red-900/80 text-red-300'}`}>
                            {finalEvaluation.passed ? t('evaluationPassed') : t('evaluationFailed')}
                        </div>
                        <div className="p-4 bg-gray-800/60 rounded-lg">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-yellow-400 mb-2">{t('overallFeedback')}</h3>
                                    <p className="text-gray-300 mb-4">{finalEvaluation.overallFeedback}</p>
                                </div>
                                <TextToSpeechButton textToSpeak={finalEvaluation.overallFeedback} />
                            </div>
                            {renderScores(finalEvaluation.score)}
                        </div>
                        <button onClick={() => onEvaluationComplete(finalEvaluation)} className="w-full mt-6 px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400">{t('returnToDashboard')}</button>
                    </div>
                )}
                 {status === 'error' && (
                     <div className="text-center p-4 bg-red-900/50 rounded-lg">
                         <p className="text-red-300">{error}</p>
                         <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-600 rounded-md">{t('tryAgainButton')}</button>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default LiveClassroom;
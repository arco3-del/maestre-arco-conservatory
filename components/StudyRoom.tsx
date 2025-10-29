import React, { useState, useRef, useCallback, useEffect } from 'react';
import { analyzePerformanceVideo } from '../services/geminiService';
import { InstrumentFeedback, ArchivedItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import TextToSpeechButton from './TextToSpeechButton';

type Status = 'idle' | 'recording' | 'analyzing' | 'feedback' | 'error';

interface StudyRoomProps {
    moduleTitle: string;
    onSaveToArchive: (item: ArchivedItem) => void;
}

const ThematicLoader: React.FC<{ message: string }> = ({ message }) => {
    const { t } = useLanguage();
    return (
    <div className="flex flex-col items-center justify-center text-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400 animate-pulse-glow" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.93,8.34a1,1,0,0,0-1.05.17,3.42,3.42,0,0,1-3.56,2.29A3.33,3.33,0,0,1,5.6,8.2a1,1,0,1,0-1.8,1A5.32,5.32,0,0,0,8.32,14a5.21,5.21,0,0,0,4.23-2.45,4.4,4.4,0,0,0,1.2-3.15A1,1,0,0,0,12.93,8.34Zm2.43,8.35a1,1,0,0,0-1.21-.08,3.42,3.42,0,0,1-3.66,0A3.42,3.42,0,0,1,8,15.11a1,1,0,1,0-1.78.9A5.42,5.42,0,0,0,10.7,19a5.3,5.3,0,0,0,4.86-2.88A1,1,0,0,0,15.36,16.69Z"/>
        </svg>
        <p className="mt-4 text-lg font-semibold text-white">{message}</p>
        <p className="text-sm text-gray-400">{t('pleaseWait')}</p>
    </div>
    );
};

const StudyRoom: React.FC<StudyRoomProps> = ({ moduleTitle, onSaveToArchive }) => {
    const [status, setStatus] = useState<Status>('idle');
    const [feedback, setFeedback] = useState<InstrumentFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);
    const [isArchived, setIsArchived] = useState(false);
    const { language, t } = useLanguage();
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);

    const cleanupStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && status === 'recording') {
            mediaRecorderRef.current.stop();
            cleanupStream();
        }
    }, [status]);

    const handleStartRecording = useCallback(async () => {
        setStatus('recording');
        setError(null);
        setFeedback(null);
        setIsArchived(false);
        setTimer(60);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true, 
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
            recordedChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if(event.data.size > 0) recordedChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setStatus('analyzing');
                const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                
                try {
                    const result = await analyzePerformanceVideo(videoBlob, language);
                    setFeedback(result);
                    setStatus('feedback');
                } catch (err) {
                    console.error("Analysis failed:", err);
                    setError(t('analysisError'));
                    setStatus('error');
                }
            };

            mediaRecorderRef.current.start();
            
            timerRef.current = window.setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        handleStopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Error accessing media devices:", err);
            if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
                setError(t('mediaAccessError'));
            } else {
                setError(t('cameraError'));
            }
            setStatus('error');
            cleanupStream();
        }
    }, [language, t, handleStopRecording]);
    
    useEffect(() => {
        return () => cleanupStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetPractice = () => {
        cleanupStream();
        setStatus('idle');
        setFeedback(null);
        setError(null);
        setIsArchived(false);
    };

    const handleSave = () => {
        if (!feedback) return;
        const archiveItem: ArchivedItem = {
            id: `practice-${Date.now()}`,
            type: 'practice_feedback',
            title: `Análisis de Práctica: ${moduleTitle}`,
            content: feedback,
            timestamp: new Date().toISOString(),
        };
        onSaveToArchive(archiveItem);
        setIsArchived(true);
    };
    
    const renderScores = (evaluacion: InstrumentFeedback['evaluacion']) => (
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-yellow-300 text-center mb-3">{t('detailedScoreTitle')}</h4>
             <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationIntonation')}:</strong> {evaluacion.intonation}/5</div>
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationRhythm')}:</strong> {evaluacion.rhythm}/5</div>
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationMusicality')}:</strong> {evaluacion.musicality}/5</div>
                <div className="p-2 bg-gray-700/50 rounded-md text-center"><strong>{t('evaluationInterpretation')}:</strong> {evaluacion.interpretation}/5</div>
            </div>
            <div className={`mt-4 p-4 rounded-lg text-center font-bold transition-all duration-500 ${evaluacion.total >= 18.5 ? 'bg-green-500/80 text-white shadow-lg shadow-green-500/30' : 'bg-red-500/80 text-white shadow-lg shadow-red-500/30'}`}>
                <span className="block text-xs font-normal opacity-80">{t('totalScore')}</span>
                <span className="text-4xl">{evaluacion.total.toFixed(1)}</span>
                <span className="text-lg opacity-80">/ 20</span>
            </div>
             {evaluacion.total < 18.5 && <p className="text-xs text-center mt-2 text-gray-400">{t('excellenceRequirement')}</p>}
        </div>
    );

    const FeedbackItem: React.FC<{ label: string, value: string, colorClass: string }> = ({ label, value, colorClass }) => (
        <div className="flex items-start gap-2">
            <p className="flex-grow"><strong className={colorClass}>{label}:</strong> {value}</p>
            <TextToSpeechButton textToSpeak={`${label}. ${value}`} />
        </div>
    );

    const renderContent = () => {
        switch (status) {
            case 'recording':
                return (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 animate-pulse text-red-400 font-bold mb-3">
                             <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            {t('recordingStatus')}...
                        </div>
                        <div className="text-2xl font-mono mb-3">{`0:${timer.toString().padStart(2, '0')}`}</div>
                        <button onClick={handleStopRecording} className="px-6 py-2 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-500 transition-all duration-300 hover:shadow-red-500/50">
                            {t('stopRecordingButton')}
                        </button>
                    </div>
                );
            case 'analyzing':
                const analyzingMessage = t('thematicAnalyzingStatus');
                return (
                    <div>
                        <ThematicLoader message={analyzingMessage}/>
                        <div className="text-center -mt-8">
                            <TextToSpeechButton textToSpeak={analyzingMessage} />
                        </div>
                    </div>
                );
            case 'feedback':
                return feedback && (
                    <div className="w-full animate-fade-in-up text-left">
                        <h3 className="text-2xl font-bold text-white text-center mb-4">{t('feedbackTitle')}</h3>
                        <div className="space-y-3 text-sm bg-gray-800/40 p-4 rounded-lg">
                           <FeedbackItem label={t('feedbackInstrument')} value={feedback.instrumento} colorClass="text-cyan-300" />
                           <FeedbackItem label={t('feedbackTone')} value={feedback.analisisTono} colorClass="text-cyan-300" />
                           <FeedbackItem label={t('feedbackRhythm')} value={feedback.analisisRitmo} colorClass="text-cyan-300" />
                           <FeedbackItem label={t('feedbackPosture')} value={feedback.analisisPostura} colorClass="text-cyan-300" />
                           <div className="pt-2 border-t border-gray-600/50 mt-2 flex items-start gap-2">
                               <p className="flex-grow"><strong className="text-yellow-400">{t('feedbackSuggestions')}:</strong> <em className="text-gray-300">"{feedback.sugerencias}"</em></p>
                               <TextToSpeechButton textToSpeak={`${t('feedbackSuggestions')}. ${feedback.sugerencias}`} />
                           </div>
                        </div>
                        {renderScores(feedback.evaluacion)}
                        <div className="mt-6 flex flex-col gap-3">
                            <button onClick={handleSave} disabled={isArchived} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                                {isArchived ? t('archiveConfirmation') : t('saveToArchiveButton')}
                            </button>
                            <button onClick={resetPractice} className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-cyan-500/50">
                                {t('practiceAgainButton')}
                            </button>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center animate-fade-in-up">
                        <h3 className="text-xl font-bold text-red-500">{t('errorOccurred')}</h3>
                        <p className="text-gray-300 my-2">{error}</p>
                        <button onClick={resetPractice} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors">
                            {t('tryAgainButton')}
                        </button>
                    </div>
                 );
            case 'idle':
            default:
                return (
                    <div className="text-center">
                        <p className="text-gray-300 mb-4 text-sm max-w-xs mx-auto">{t('studyRoomIdleMessageMobile')}</p>
                        <button onClick={handleStartRecording} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 hover:shadow-cyan-500/50">
                            {t('recordPracticeButton')}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full aspect-video bg-black rounded-lg mb-4 overflow-hidden border-2 border-gray-600 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transform -scale-x-100 ${status === 'recording' ? '' : 'hidden'}`}></video>
                {status !== 'recording' && <div className="text-gray-400 p-4 text-center">{t('cameraOffMessage')}</div>}
            </div>
            <div className="w-full">
                {renderContent()}
            </div>
        </div>
    );
};

export default StudyRoom;
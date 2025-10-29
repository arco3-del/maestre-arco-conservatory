import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage } from '../types';
import { TutorIcon } from './Icons/TutorIcon';
import { CloseIcon } from './Icons/CloseIcon';
import { SendIcon } from './Icons/SendIcon';
import { MicrophoneIcon } from './Icons/MicrophoneIcon';
import TextToSpeechButton from './TextToSpeechButton';
import { getApiKey } from '../utils/apiKey';

// SpeechRecognition interfaces for cross-browser compatibility
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const MaestreArcoTutor: React.FC = () => {
    const { language, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isResponding, setIsResponding] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // Defer initialization until the chat is opened to save resources.
        if (!isOpen || isInitialized) return;
        try {
            const apiKey = getApiKey();
            const ai = new GoogleGenAI({ apiKey });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-pro',
                config: {
                    systemInstruction: t('tutorSystemInstruction'),
                    thinkingConfig: { thinkingBudget: 32768 },
                },
            });
            setMessages([{ id: 'init', role: 'model', text: t('tutorWelcomeMessage') }]);
            setIsInitialized(true);
        } catch (error) {
            console.error("Failed to initialize tutor chat:", error);
            setMessages([{ id: 'error', role: 'model', text: 'Tutor could not be initialized. Please ensure your API key is set correctly.' }]);
        }
    }, [t, isOpen, isInitialized]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || !chatRef.current || !isInitialized) return;

        const text = messageText.trim();
        setInputValue('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
        setIsResponding(true);

        try {
            const responseStream = await chatRef.current.sendMessageStream({ message: text });
            
            let fullResponse = '';
            const modelMessageId = Date.now().toString() + '_model';
            
            setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                fullResponse += chunkText;
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: fullResponse } : msg
                ));
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { id: 'error-' + Date.now(), role: 'model', text: 'Sorry, I am unable to respond at the moment.' }]);
        } finally {
            setIsResponding(false);
        }
    }, [isInitialized]);

    const toggleListening = () => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current = new SpeechRecognitionAPI();
            recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US';
            recognitionRef.current.interimResults = true;
            recognitionRef.current.continuous = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInputValue(transcript);
                if (event.results[0].isFinal) {
                    handleSendMessage(transcript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    return (
        <>
            <button 
                className="fixed bottom-8 right-8 w-[60px] h-[60px] bg-gradient-to-br from-[#AE955D] to-[#8B4513] rounded-full border-2 border-[#FDFCE3] flex items-center justify-center cursor-pointer z-[999] transition-transform duration-200 ease-out hover:scale-110 shadow-lg animate-pulse-glow"
                onClick={() => setIsOpen(true)} 
                aria-label={t('tutorLabel')}
            >
                <TutorIcon />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsOpen(false)}>
                    <div className="w-full max-w-md h-[90vh] max-h-[700px] bg-[#212130] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#AE955D]/50" onClick={(e) => e.stopPropagation()}>
                        <header className="p-4 bg-gradient-to-r from-[#303040] to-[#252535] border-b border-[#AE955D]/30 flex-shrink-0 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#FDFCE3]" style={{fontFamily: 'var(--font-serif)'}}>{t('tutorLabel')}</h2>
                            <button onClick={() => setIsOpen(false)} className="text-[#FDFCE3] hover:text-white" aria-label="Close chat">
                                <CloseIcon />
                            </button>
                        </header>
                        
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-yellow-900/50 flex items-center justify-center flex-shrink-0 mt-1"><TutorIcon /></div>}
                                    <div className={`max-w-[85%] px-4 py-2 rounded-2xl flex flex-col ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-[#2f2f41] text-[#FDFCE3] rounded-bl-none'}`}>
                                        <span className="whitespace-pre-wrap">{msg.text}</span>
                                        {msg.role === 'model' && msg.text && !isResponding && (
                                            <div className="self-end -mr-2 -mb-1">
                                                <TextToSpeechButton textToSpeak={msg.text} voice="Charon" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isResponding && messages[messages.length-1]?.role === 'user' && (
                                <div className="flex gap-3 items-start justify-start">
                                    <div className="w-8 h-8 rounded-full bg-yellow-900/50 flex items-center justify-center flex-shrink-0 mt-1"><TutorIcon /></div>
                                    <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-[#2f2f41] text-[#FDFCE3] rounded-bl-none flex items-center space-x-1.5">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <footer className="p-3 bg-gradient-to-r from-[#303040] to-[#252535] border-t border-[#AE955D]/30 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="flex-grow relative">
                                    <input
                                        type="text"
                                        value={isListening ? t('tutorListening') : inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !isResponding && handleSendMessage(inputValue)}
                                        placeholder={!isInitialized ? t('loading') + '...' : t('tutorPlaceholder')}
                                        className="w-full bg-[#1c1c28] text-white rounded-full py-2 pl-4 pr-12 border-2 border-transparent focus:outline-none focus:border-[#AE955D]/50"
                                        disabled={isResponding || isListening || !isInitialized}
                                    />
                                     <button
                                        onClick={toggleListening}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
                                        disabled={isResponding || !isInitialized}
                                        aria-label="Use microphone"
                                    >
                                        <MicrophoneIcon />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleSendMessage(inputValue)}
                                    disabled={isResponding || !inputValue.trim() || !isInitialized}
                                    className="w-10 h-10 bg-[#AE955D] rounded-full flex items-center justify-center transition-colors hover:bg-[#8B4513] disabled:bg-gray-500"
                                    aria-label="Send message"
                                >
                                    <SendIcon />
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default MaestreArcoTutor;
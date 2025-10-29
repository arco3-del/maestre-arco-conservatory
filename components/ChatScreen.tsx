import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { UserProfile, ChatMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getApiKey } from '../utils/apiKey';
import { SendIcon } from './Icons/SendIcon';

interface ChatScreenProps {
  currentUser: UserProfile;
  student: { name: string; photo: string; instrument: string };
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ currentUser, student, onBack }) => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isResponding, setIsResponding] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const studentPersona = `You are ${student.name}, a student at Maestre Arco conservatory studying ${student.instrument}. You are friendly and supportive. You are chatting with ${currentUser.fullName}. Keep your responses conversational and relatively short, like in a real chat app.`;
        
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: studentPersona },
        });
        
        // Start with a greeting from the student
        const sendInitialMessage = async () => {
            setIsResponding(true);
            try {
                const response = await chatRef.current!.sendMessage("Hey!");
                setMessages([{ id: 'init', role: 'model', text: response.text }]);
            } catch (error) {
                console.error("Failed to get initial message:", error);
                setMessages([{ id: 'error-init', role: 'model', text: "..." }]);
            } finally {
                setIsResponding(false);
            }
        };
        sendInitialMessage();

    }, [currentUser.fullName, student.name, student.instrument]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !chatRef.current || isResponding) return;

        const userText = inputValue.trim();
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: userText };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsResponding(true);

        try {
            const response = await chatRef.current.sendMessage(userText);
            const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error in chat:", error);
            const errorMessage: ChatMessage = { id: `error-${Date.now()}`, role: 'model', text: "Sorry, I got distracted." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsResponding(false);
        }
    };


    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center gap-4 p-3 bg-gray-800 border-b border-gray-700">
                <button onClick={onBack} className="text-yellow-400">&larr;</button>
                <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full" />
                <div>
                    <p className="font-bold">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.instrument}</p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                 {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         {msg.role === 'model' && <img src={student.photo} alt={student.name} className="w-6 h-6 rounded-full" />}
                         <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                 {isResponding && (
                    <div className="flex items-end gap-2 justify-start">
                        <img src={student.photo} alt={student.name} className="w-6 h-6 rounded-full" />
                        <div className="px-4 py-2 rounded-2xl bg-gray-700 rounded-bl-none">
                             <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input */}
            <footer className="flex-shrink-0 p-3 bg-gray-800 border-t border-gray-700">
                 <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={t('typeAMessagePlaceholder')}
                        className="flex-grow bg-gray-700 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isResponding}
                    />
                    <button onClick={handleSendMessage} disabled={isResponding || !inputValue.trim()} className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center disabled:bg-gray-500">
                        <SendIcon />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatScreen;
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { generateTheoryLessonAndExercises } from '../services/geminiService';
import { TheoryLesson, UserProfile } from '../types';
import LoadingSpinner from './LoadingSpinner';
import TextToSpeechButton from './TextToSpeechButton';

interface ScriptoriumProps {
    profile: UserProfile;
    onLeave: () => void;
}

const THEORY_TOPICS = ['Intervals', 'Major Scales', 'Minor Scales', 'Triads', 'Seventh Chords', 'Circle of Fifths'];

const Scriptorium: React.FC<ScriptoriumProps> = ({ profile, onLeave }) => {
    const { language, t } = useLanguage();
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [lesson, setLesson] = useState<TheoryLesson | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTopicSelect = async (topic: string) => {
        setSelectedTopic(topic);
        setIsLoading(true);
        setError(null);
        setLesson(null);
        try {
            const lessonData = await generateTheoryLessonAndExercises(topic, profile.instrument, language);
            setLesson(lessonData);
        } catch (err) {
            console.error(err);
            setError(t('lessonError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-md p-4 sm:p-8 rounded-lg border border-gray-700">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-4">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('scriptoriumTitle')}</h1>
                    <p className="text-lg text-cyan-300 mt-2 max-w-2xl mx-auto">{t('scriptoriumWelcome')}</p>
                </div>

                <div className="my-8">
                    <h2 className="text-xl font-bold text-white text-center mb-4">{t('selectTopicPrompt')}</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {THEORY_TOPICS.map(topic => (
                            <button
                                key={topic}
                                onClick={() => handleTopicSelect(topic)}
                                disabled={isLoading}
                                className={`px-4 py-2 font-semibold rounded-full transition-all duration-300 border-2 ${
                                    selectedTopic === topic 
                                        ? 'bg-purple-600 text-white border-purple-400 scale-105' 
                                        : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && <LoadingSpinner message={t('loadingLessonMessage')} />}
                {error && <div className="text-center p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300">{error}</div>}

                {lesson && (
                    <div className="mt-8 space-y-8 animate-fade-in-up">
                        {/* Lesson Explanation */}
                        <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-yellow-500/30">
                             <div className="flex justify-between items-center mb-4">
                                 <h2 className="text-2xl font-bold text-yellow-400 text-center">{t('lessonTitle', {topic: lesson.topic})}</h2>
                                 <TextToSpeechButton textToSpeak={lesson.explanation} />
                             </div>
                             <p className="text-gray-200 whitespace-pre-wrap leading-relaxed" style={{fontFamily: 'var(--font-serif)', fontSize: '1.1rem'}}>
                                {lesson.explanation}
                             </p>
                        </div>

                        {/* Exercises */}
                        <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-cyan-500/30">
                            <h2 className="text-2xl font-bold text-cyan-300 mb-6 text-center">{t('exercisesTitle')}</h2>
                            <div className="space-y-6">
                                {lesson.exercises.map((exercise, index) => (
                                    <div key={index} className="bg-gray-900/40 p-4 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="font-semibold text-white flex-grow">{`${index + 1}. ${exercise.question}`}</p>
                                            <TextToSpeechButton textToSpeak={exercise.question} />
                                        </div>
                                        {exercise.type === 'multiple_choice' && exercise.options && (
                                            <div className="flex flex-col space-y-2 mt-2">
                                                {exercise.options.map((option, optIndex) => (
                                                    <label key={optIndex} className="text-gray-300 flex items-center">
                                                        <input type="radio" name={`q-${index}`} className="mr-2" />
                                                        {option}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                         {exercise.type === 'short_answer' && (
                                            <input type="text" className="mt-2 block w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-cyan-500" />
                                        )}
                                        <p className="text-xs text-green-400 mt-2 opacity-0 hover:opacity-100 transition-opacity">Respuesta: {exercise.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scriptorium;
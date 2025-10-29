

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { askMaestreWithGoogleSearch } from '../services/geminiService';
import { SearchResult } from '../types';
import LoadingSpinner from './LoadingSpinner';
import TextToSpeechButton from './TextToSpeechButton';

interface HallOfKnowledgeProps {
    onLeave: () => void;
}

const HallOfKnowledge: React.FC<HallOfKnowledgeProps> = ({ onLeave }) => {
    const { language, t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const suggestedQuestions: string[] = JSON.parse(t('suggestedQuestions'));

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const searchResult = await askMaestreWithGoogleSearch(searchQuery, language);
            setResult(searchResult);
        } catch (err) {
            console.error(err);
            setError(t('hallSearchError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleSuggestedQuestionClick = (question: string) => {
        setQuery(question);
        handleSearch(question);
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-6">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('hallOfKnowledgeTitle')}</h1>
                    <p className="text-lg text-cyan-300 mt-2 max-w-2xl mx-auto">{t('hallOfKnowledgeSubtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="my-8 flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="flex-grow bg-gray-800 border border-gray-600 rounded-md shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t('loading') + '...' : t('searchButton')}
                    </button>
                </form>

                {isLoading && <LoadingSpinner message={t('hallLoadingMessage')} />}

                {error && <div className="text-center p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300">{error}</div>}

                {result ? (
                    <div className="animate-fade-in-up">
                        <div className="p-6 bg-gray-800/50 backdrop-blur-md rounded-lg border border-yellow-500/30">
                            <div className="flex justify-end -mb-4">
                                <TextToSpeechButton textToSpeak={result.answer} />
                            </div>
                            <p className="text-white whitespace-pre-wrap" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                                {result.answer}
                            </p>
                        </div>
                        {result.sources.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold text-yellow-400 mb-3">{t('sourcesTitle')}</h3>
                                <ul className="space-y-2">
                                    {result.sources.map((source, index) => (
                                        <li key={index} className="bg-gray-800 p-3 rounded-md hover:bg-gray-700 transition-colors">
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                                {source.title}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    !isLoading && !error && (
                        <div className="mt-8 text-center">
                            <h3 className="text-xl font-bold text-white mb-4">O pregúntale sobre:</h3>
                            <div className="flex flex-wrap justify-center gap-3">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestedQuestionClick(q)}
                                        className="px-4 py-2 bg-gray-700 text-gray-200 rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default HallOfKnowledge;


import React, { useState } from 'react';
import { StudyPlan, Module, SubModule } from '../types';
import { useLanguage } from '../context/LanguageContext';
import TextToSpeechButton from './TextToSpeechButton';

interface StudyPlanScreenProps {
  plan: StudyPlan;
  onAcknowledged: () => void;
}

const SubModuleList: React.FC<{ items: SubModule[] }> = ({ items }) => {
    const { t } = useLanguage();
    return (
        <ul className="space-y-4 pl-4 border-l-2 border-cyan-400/50">
            {items.map((sub, index) => (
                <li key={`sub-${index}`}>
                    <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-white">{sub.title}</h5>
                        <TextToSpeechButton textToSpeak={sub.title} />
                    </div>
                    <div className="flex items-start gap-2">
                        <p className="text-sm text-gray-400 flex-grow">{sub.description}</p>
                        <TextToSpeechButton textToSpeak={sub.description} />
                    </div>
                    {sub.sources && sub.sources.length > 0 && (
                        <div className="mt-3 pl-2">
                            <h6 className="text-xs font-bold text-yellow-300 uppercase tracking-wider">{t('resourcesTitle')}</h6>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {sub.sources.map((source, i) => (
                                    <li key={i} className="text-sm">
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                            {source.title}
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-1 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

const AccordionItem: React.FC<{ module: Module, isOpen: boolean, onClick: () => void }> = ({ module, isOpen, onClick }) => {
    const { t } = useLanguage();
    return (
        <div className="border border-yellow-500/20 rounded-lg overflow-hidden">
            <button onClick={onClick} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700/70 flex justify-between items-center transition-colors">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-cyan-300">{`${t('moduleLabel')} ${module.module}: ${module.title}`}</h3>
                        <TextToSpeechButton textToSpeak={`${t('moduleLabel')} ${module.module}: ${module.title}`} />
                    </div>
                     {!isOpen && (
                        <div className="flex items-start gap-2 pr-4">
                            <p className="text-sm text-gray-400 mt-1 flex-grow">{module.description}</p>
                            <TextToSpeechButton textToSpeak={module.description} />
                        </div>
                    )}
                </div>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className="p-4 bg-gray-800/50">
                     <div className="flex items-start gap-2">
                        <p className="text-base text-gray-300 mb-4 flex-grow">{module.description}</p>
                        <TextToSpeechButton textToSpeak={module.description} />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-lg text-cyan-300 mb-2">{t('instrumentTechniqueTitle')}</h4>
                            <SubModuleList items={module.instrument_technique} />
                        </div>
                         <div>
                            <h4 className="font-bold text-lg text-yellow-300 mb-2">{t('musicTheoryTitle')}</h4>
                             <SubModuleList items={module.music_theory} />
                        </div>
                         <div>
                            <h4 className="font-bold text-lg text-purple-300 mb-2">{t('musicHistoryTitle')}</h4>
                            <SubModuleList items={module.music_history} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StudyPlanScreen: React.FC<StudyPlanScreenProps> = ({ plan, onAcknowledged }) => {
  const [openModule, setOpenModule] = useState<number | null>(0);
  const { t } = useLanguage();

  const toggleModule = (index: number) => {
    setOpenModule(openModule === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center">{t('studyPlanTitle')}</h1>
        <p className="text-lg text-cyan-300 mt-2 text-center">{t('studyPlanSubtitle', { instrument: plan.instrument })}</p>
        
        <div className="my-8 p-6 bg-gray-800/50 backdrop-blur-md rounded-lg border border-yellow-500/30">
            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">{t('excellenceCriteriaTitle')}</h2>
            <p className="text-center text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: t('excellenceCriteriaDesc') }} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-700 rounded-md"><span className="font-bold">{t('evaluationIntonation')}:</span> 5 pts</div>
                <div className="p-3 bg-gray-700 rounded-md"><span className="font-bold">{t('evaluationRhythm')}:</span> 5 pts</div>
                <div className="p-3 bg-gray-700 rounded-md"><span className="font-bold">{t('evaluationMusicality')}:</span> 5 pts</div>
                <div className="p-3 bg-gray-700 rounded-md"><span className="font-bold">{t('evaluationInterpretation')}:</span> 5 pts</div>
            </div>
        </div>

        <div className="space-y-4">
            {plan.modules.map((module, index) => (
                <AccordionItem 
                    key={module.module} 
                    module={module} 
                    isOpen={openModule === index} 
                    onClick={() => toggleModule(index)} 
                />
            ))}
        </div>
        
        <div className="mt-8 text-center">
            <button 
                onClick={onAcknowledged}
                className="px-8 py-3 bg-yellow-500 text-gray-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
            >
                {t('acceptPlanButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanScreen;
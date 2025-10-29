import React, { useState, useEffect } from 'react';
import { UserProfile, StudyMaterial, ArchivedItem } from '../types';
import { generateStudyMaterial } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import StudyRoom from './StudyRoom';
import { useLanguage } from '../context/LanguageContext';
import TextToSpeechButton from './TextToSpeechButton';

interface ModuleScreenProps {
  profile: UserProfile;
  onReturnToDashboard: () => void;
  onBeginEvaluation: () => void;
  onSaveToArchive: (item: ArchivedItem) => void;
}

const ModuleScreen: React.FC<ModuleScreenProps> = ({ profile, onReturnToDashboard, onBeginEvaluation, onSaveToArchive }) => {
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const currentModule = profile.studyPlan?.modules[profile.currentModuleIndex];

  useEffect(() => {
    const fetchMaterial = async () => {
      if (!currentModule) {
        setError(t('moduleLoadError'));
        setIsLoading(false);
        return;
      }
      try {
        const generatedMaterial = await generateStudyMaterial(profile.instrument, currentModule, language);
        setMaterial(generatedMaterial);
      } catch (err) {
        console.error("Failed to generate study material:", err);
        setError(t('materialGenerationError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterial();
  }, [currentModule, profile.instrument, language, t]);

  if (isLoading) {
    return <LoadingSpinner message={t('loadingMaterialMessage', { module: currentModule?.module?.toString() ?? ''})} />;
  }

  if (error) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl text-red-500 font-bold">{t('errorOccurred')}</h2>
            <p className="text-gray-300 my-4">{error}</p>
            <button onClick={onReturnToDashboard} className="px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-md hover:bg-yellow-400">
                {t('backToDashboardButton')}
            </button>
        </div>
    );
  }

  if (!material || !currentModule) {
    return <div>{t('noStudyMaterial')}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
            <button onClick={onReturnToDashboard} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-6">
                &larr; {t('backToDashboardButton')}
            </button>
            <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white">{`${t('moduleLabel')} ${currentModule.module}: ${material.title}`}</h1>
                <TextToSpeechButton textToSpeak={`${t('moduleLabel')} ${currentModule.module}: ${material.title}`} />
            </div>
            
            <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b-2 border-cyan-400/50 pb-2">{t('studyMaterialTitle')}</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-yellow-400 text-lg">{t('theoreticalConceptsTitle')}</h3>
                            <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-2">
                                {material.theoretical_concepts.map((item, i) => <li key={i} className="flex items-center gap-2">{item} <TextToSpeechButton textToSpeak={item} /></li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-400 text-lg">{t('warmUpExercisesTitle')}</h3>
                             <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-2">
                                {material.warm_up_exercises.map((item, i) => <li key={i} className="flex items-center gap-2">{item} <TextToSpeechButton textToSpeak={item} /></li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-400 text-lg">{t('mainPiecesTitle')}</h3>
                             <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-2">
                                {material.main_pieces.map((item, i) => <li key={i} className="flex items-center gap-2">{item} <TextToSpeechButton textToSpeak={item} /></li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold text-yellow-400 text-lg">{t('interpretationTipsTitle')}</h3>
                            <div className="flex items-start gap-2">
                                <p className="text-gray-300 mt-2 italic flex-grow">"{material.interpretation_tips}"</p>
                                <TextToSpeechButton textToSpeak={material.interpretation_tips} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-lg border border-yellow-500/30">
                     <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b-2 border-yellow-400/50 pb-2">{t('studyRoomTitle')}</h2>
                    <StudyRoom moduleTitle={currentModule.title} onSaveToArchive={onSaveToArchive} />
                </div>
            </div>

            <div className="mt-8 text-center p-6 bg-gray-800/70 rounded-lg border border-red-500/30">
                <h2 className="text-3xl font-bold text-white">{t('finalEvaluationTitle')}</h2>
                <div className="flex justify-center items-center gap-3">
                    <p className="text-gray-300 mt-2 mb-6 max-w-2xl mx-auto">{t('finalEvaluationDescription')}</p>
                    <TextToSpeechButton textToSpeak={t('finalEvaluationDescription')} />
                </div>
                <button 
                    onClick={onBeginEvaluation}
                    className="px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-full hover:bg-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/20"
                >
                    {t('beginEvaluationButton')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ModuleScreen;
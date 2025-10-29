import React from 'react';
import { UserProfile } from '../types';
import IDCard from './IDCard';
import { useLanguage } from '../context/LanguageContext';
import { AtelierIcon } from './Icons/AtelierIcon';
import { GiftIcon } from './Icons/GiftIcon';
import { MusicBookIcon } from './Icons/MusicBookIcon';
import VipPass from './VipPass';
import { FacultyIcon } from './Icons/FacultyIcon';
import { LogoutIcon } from './Icons/LogoutIcon';
import { BriefingIcon } from './Icons/BriefingIcon';
import { RoadmapIcon } from './Icons/RoadmapIcon';

interface ConservatoryDashboardProps {
  profile: UserProfile;
  onBeginModule: () => void;
  onEnterHallOfKnowledge: () => void;
  onEnterAstralPianoHall: () => void;
  onEnterScriptorium: () => void;
  onEnterVoiceHall: () => void;
  onEnterChromeLab: () => void;
  onEnterAtelier: () => void;
  onEnterFounderGrant: () => void;
  onEnterMusicBook: () => void;
  onEnterExhibitionHall: () => void;
  onEnterBriefingRoom: () => void;
  onEnterFeatureSuggestions: () => void;
  onLogout: () => void;
}

const DirectorDashboard: React.FC<Pick<ConservatoryDashboardProps, 'onEnterExhibitionHall' | 'onEnterBriefingRoom' | 'onEnterFeatureSuggestions' | 'onLogout'>> = ({
    onEnterExhibitionHall,
    onEnterBriefingRoom,
    onEnterFeatureSuggestions,
    onLogout,
}) => {
    const { t } = useLanguage();

    const ActionCard: React.FC<{ title: string, description: string, onClick: () => void, icon: React.ReactNode, buttonText: string, color: 'red' | 'cyan' | 'purple' }> = 
    ({ title, description, onClick, icon, buttonText, color }) => {
        const colorClasses = {
            red: { border: 'border-red-500/50', button: 'bg-red-600 hover:bg-red-500' },
            cyan: { border: 'border-cyan-500/50', button: 'bg-cyan-600 hover:bg-cyan-500' },
            purple: { border: 'border-purple-500/50', button: 'bg-purple-600 hover:bg-purple-500' },
        };
        const classes = colorClasses[color];

        return (
            <div className={`w-full bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border ${classes.border} p-6 flex flex-col text-center`}>
                <div className="flex justify-center mb-4">{icon}</div>
                <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
                <p className="text-gray-300 mb-6 flex-grow text-lg">{description}</p>
                <button 
                    onClick={onClick}
                    className={`w-full px-6 py-4 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 text-lg ${classes.button}`}
                >
                    {buttonText}
                </button>
            </div>
        )
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-8 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
             <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <div className="text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('directorOfficeTitle')}</h1>
                </div>
                <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-sm rounded-lg hover:bg-red-800 transition-colors">
                    <LogoutIcon />
                    Salir
                </button>
            </div>
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <ActionCard 
                    title={t('exhibitionHallTitle')}
                    description={t('exhibitionHallSubtitle')}
                    onClick={onEnterExhibitionHall}
                    icon={<FacultyIcon />}
                    buttonText={t('enterExhibitionHallButton')}
                    color="red"
                />
                <ActionCard 
                    title={t('projectBriefingRoomTitle')}
                    description={t('projectBriefingRoomDescription')}
                    onClick={onEnterBriefingRoom}
                    icon={<BriefingIcon />}
                    buttonText={t('enterProjectBriefingRoomButton')}
                    color="cyan"
                />
                <ActionCard 
                    title={t('featureSuggestionsTitle')}
                    description={t('featureSuggestionsDescription')}
                    onClick={onEnterFeatureSuggestions}
                    icon={<RoadmapIcon />}
                    buttonText={t('enterFeatureSuggestionsButton')}
                    color="purple"
                />
            </div>
        </div>
    );
};


const ConservatoryDashboard: React.FC<ConservatoryDashboardProps> = (props) => {
  const { profile } = props;

  if (profile.role === 'director' || profile.role === 'judge') {
    return <DirectorDashboard {...props} />;
  }

  // --- Student Dashboard ---
  const { t } = useLanguage();
  const firstName = profile.fullName.split(' ')[0];
  const currentModule = profile.studyPlan?.modules[profile.currentModuleIndex];

  return (
    <div className="min-h-screen w-full bg-gray-900/50 backdrop-blur-sm">
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 animate-fade-in">
             <div className="w-full max-w-7xl flex justify-between items-start mb-8">
                <div className="text-left">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('dashboardWelcome', { name: firstName })}</h1>
                    <p className="text-lg text-cyan-300 mt-2">{t('dashboardSubtitle')}</p>
                </div>
                 <button onClick={props.onLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-sm rounded-lg hover:bg-red-800 transition-colors">
                    <LogoutIcon />
                    Salir
                </button>
            </div>

            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <IDCard profile={profile} />
                    
                    {profile.isFamous && <VipPass />}
                    
                    {!profile.founderGrantClaimed && (
                        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg shadow-lg border border-yellow-300/50 p-6 text-center animate-fade-in-up">
                            <div className="flex justify-center mb-4">
                                <GiftIcon />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">{t('founderGrantTitle')}</h2>
                            <p className="text-yellow-100 text-sm mb-4">{t('founderGrantDescription')}</p>
                            <button 
                                onClick={props.onEnterFounderGrant}
                                className="w-full px-6 py-3 bg-white text-amber-700 font-bold rounded-lg hover:bg-yellow-100 transition-all duration-300 transform hover:scale-105"
                            >
                                {t('founderGrantButton')}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {currentModule && (
                        <div className="md:col-span-2 bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-yellow-500/30 p-8 text-center flex flex-col">
                            <h2 className="text-2xl font-bold text-white mb-3">{t('currentModuleTitle')}</h2>
                            <div className="flex-grow">
                              <p className="text-cyan-300 text-xl font-semibold mb-2">{`${t('moduleLabel')} ${currentModule.module}: ${currentModule.title}`}</p>
                              <p className="text-gray-400 mb-6">{currentModule.description}</p>
                            </div>
                            <button 
                              onClick={props.onBeginModule}
                              className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105"
                            >
                              {t('beginModuleButton')}
                            </button>
                        </div>
                    )}

                    <div className="md:col-span-2 bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-blue-500/30 p-8 text-center flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
                        <AtelierIcon />
                        <div className="flex-grow text-center md:text-left">
                          <h2 className="text-2xl font-bold text-white mb-2">{t('atelierTitle')}</h2>
                          <p className="text-gray-400 mb-4">{t('atelierDashboardDescription')}</p>
                        </div>
                        <button 
                            onClick={props.onEnterAtelier}
                            className="w-full md:w-auto flex-shrink-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-all duration-300 transform hover:scale-105"
                        >
                            {t('enterAtelierButton')}
                        </button>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-indigo-500/30 p-8 text-center flex flex-col animate-fade-in-up">
                        <div className="flex-grow">
                          <div className="flex justify-center mb-3"><MusicBookIcon /></div>
                          <h2 className="text-2xl font-bold text-white mb-3">{t('musicBookTitle')}</h2>
                          <p className="text-gray-400 mb-6">{t('musicBookDescription')}</p>
                        </div>
                        <button 
                            onClick={props.onEnterMusicBook}
                            className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105"
                        >
                            {t('enterMusicBookButton')}
                        </button>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-cyan-500/30 p-8 text-center flex flex-col">
                        <h2 className="text-2xl font-bold text-white mb-3">{t('hallOfKnowledgeTitle')}</h2>
                        <div className="flex-grow">
                          <p className="text-gray-400 mb-6">{t('hallDescription')}</p>
                        </div>
                        <button 
                            onClick={props.onEnterHallOfKnowledge}
                            className="w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105"
                        >
                            {t('enterHallButton')}
                        </button>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-yellow-500/30 p-8 text-center flex flex-col animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-white mb-3">{t('astralPianoHallTitle')}</h2>
                        <div className="flex-grow">
                            <p className="text-gray-400 mb-6">{t('astralPianoHallDescription')}</p>
                        </div>
                        <button 
                            onClick={props.onEnterAstralPianoHall}
                            className="w-full px-6 py-3 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
                        >
                            {t('enterAstralPianoHallButton')}
                        </button>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-purple-500/30 p-8 text-center flex flex-col animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-white mb-3">{t('scriptoriumTitle')}</h2>
                        <div className="flex-grow">
                            <p className="text-gray-400 mb-6">{t('scriptoriumDescription')}</p>
                        </div>
                        <button 
                            onClick={props.onEnterScriptorium}
                            className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-all duration-300 transform hover:scale-105"
                        >
                            {t('enterScriptoriumButton')}
                        </button>
                    </div>
                    
                    <div className="bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-green-500/30 p-8 text-center flex flex-col animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-white mb-3">{t('chromeLabTitle')}</h2>
                        <div className="flex-grow">
                            <p className="text-gray-400 mb-6">{t('chromeLabDescription')}</p>
                        </div>
                        <button 
                            onClick={props.onEnterChromeLab}
                            className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105"
                        >
                            {t('enterChromeLabButton')}
                        </button>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-md rounded-lg shadow-lg border border-pink-500/30 p-8 text-center flex flex-col animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-white mb-3">{t('vocalCoachTitle')}</h2>
                        <div className="flex-grow">
                            <p className="text-gray-400 mb-6">{t('vocalCoachDescription')}</p>
                        </div>
                        <button 
                            onClick={props.onEnterVoiceHall}
                            className="w-full px-6 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-500 transition-all duration-300 transform hover:scale-105"
                        >
                            {t('enterVocalCoachButton')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ConservatoryDashboard;
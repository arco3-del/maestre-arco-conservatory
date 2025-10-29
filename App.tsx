import React, { useState, useCallback, useEffect } from 'react';
import { AppState, UserProfile, FinalEvaluation, Rank, JudgePassData, ArchivedItem, DirectorPassData } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import RegistrationForm from './components/RegistrationForm';
import ConservatoryDashboard from './components/ConservatoryDashboard';
import { generateStudyPlan } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import StudyPlanScreen from './components/StudyPlanScreen';
import ModuleScreen from './components/ModuleScreen';
import { useLanguage } from './context/LanguageContext';
import HallOfKnowledge from './components/HallOfKnowledge';
import AstralPianoHall from './components/AstralPianoHall';
import Scriptorium from './components/Scriptorium';
import LiveClassroom from './components/LiveClassroom';
import MaestreArcoTutor from './components/MaestreArcoTutor';
import IDCardScreen from './components/IDCardScreen';
import VoiceHall from './components/VoiceHall';
import ChromeExtensionLab from './components/ChromeExtensionLab';
import AtelierOfVision from './components/AtelierOfVision';
import FounderGrantScreen from './components/FounderGrantScreen';
import DirectorPassScreen from './components/DirectorPassScreen';
import GrandExhibitionHall from './components/GrandExhibitionHall';
import MusicBook from './components/MusicBook';
import { getRankForXp, getRankInfo } from './utils/ranking';
import UniversalLoginScreen from './components/UniversalLoginScreen';
import QRCodeScannerScreen from './components/QRCodeScannerScreen';
import ProjectBriefingRoom from './components/ProjectBriefingRoom';
import JudgePassScreen from './components/JudgePassScreen';
import FeatureSuggestions from './components/FeatureSuggestions';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const { language, t, isInitialized } = useLanguage();
  const [toast, setToast] = useState<string | null>(null);
  const [judgeData, setJudgeData] = useState<JudgePassData | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Effect to set initial state once language is initialized
  useEffect(() => {
    if (isInitialized && appState === null) {
        // The app now assumes the API key is set in the environment.
        // We proceed directly to the login or dashboard state.
        const savedProfile = localStorage.getItem('maestreArcoUser');
        if(savedProfile){
            setUserProfile(JSON.parse(savedProfile));
            setAppState(AppState.DASHBOARD);
        } else {
            setAppState(AppState.UNIVERSAL_LOGIN);
        }
    }
  }, [isInitialized, appState]);


  const showToast = (message: string) => setToast(message);

  const logoutAndReset = () => {
    localStorage.removeItem('maestreArcoUser');
    setUserProfile(null);
    setAppState(AppState.UNIVERSAL_LOGIN);
  };

  const handleLogin = useCallback(async (name: string) => {
    setIsGeneratingPlan(true);
    try {
      const plan = await generateStudyPlan('Dirección Orquestal', language);
      const directorRank = Rank.MAESTRO_VIRTUOSO_INTERESTELAR;
      const newProfile: UserProfile = {
          fullName: name,
          age: 'N/A',
          residence: 'Conservatory',
          instrument: 'Director',
          photo: '/default-profile-icon.svg',
          studyPlan: plan,
          currentModuleIndex: 0,
          founderGrantClaimed: false,
          role: 'director',
          personalArchive: [],
          isFamous: true,
          xp: getRankInfo(directorRank).xpThreshold,
          rank: directorRank,
      };
      setUserProfile(newProfile);
      localStorage.setItem('maestreArcoUser', JSON.stringify(newProfile));
      setAppState(AppState.DIRECTOR_PASS_VIEW);
    } catch (error) {
      console.error("Failed to generate director's study plan:", error);
      alert(t('studyPlanError'));
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [language, t]);

  const handleScanPass = useCallback(() => {
    setAppState(AppState.QR_CODE_SCANNER);
  }, []);

  const handleJudgeQrScanned = useCallback((scannedJudgeData: JudgePassData) => {
    const judgeProfile: UserProfile = {
      fullName: scannedJudgeData.name,
      age: 'N/A',
      residence: 'Royal Board of Google',
      instrument: scannedJudgeData.title,
      photo: scannedJudgeData.photo,
      studyPlan: null,
      currentModuleIndex: 0,
      founderGrantClaimed: true,
      role: 'judge',
      personalArchive: [],
      isFamous: true,
      xp: 9999,
      rank: Rank.MAESTRO_VIRTUOSO_INTERESTELAR,
    };
    setUserProfile(judgeProfile);
    setJudgeData(scannedJudgeData);
    setAppState(AppState.JUDGE_PASS_VIEW);
  }, []);
  
  const handleDirectorQrScanned = useCallback((directorData: DirectorPassData) => {
    handleLogin(directorData.name);
  }, [handleLogin]);


  const handleExploreStudentExperience = useCallback(() => {
    setUserProfile(null);
    localStorage.removeItem('maestreArcoUser');
    setAppState(AppState.WELCOME);
  }, []);


  const handleWelcomeComplete = useCallback(() => setAppState(AppState.REGISTRATION), []);

  const handleRegistrationComplete = useCallback(async (profileData: Omit<UserProfile, 'studyPlan' | 'currentModuleIndex' | 'founderGrantClaimed' | 'role' | 'personalArchive' | 'xp' | 'rank'> & { isFamous: boolean }) => {
    setIsGeneratingPlan(true);
    try {
      const plan = await generateStudyPlan(profileData.instrument, language);
      const isFamous = profileData.isFamous;
      const initialRank = isFamous ? Rank.MAESTRO_VIRTUOSO_INTERESTELAR : Rank.POLLITO_CON_MADERA;
      const initialXp = isFamous ? getRankInfo(initialRank).xpThreshold : 0;
      const newProfile: UserProfile = {
        ...profileData,
        studyPlan: plan,
        currentModuleIndex: 0,
        founderGrantClaimed: false,
        role: 'student',
        personalArchive: [],
        xp: initialXp,
        rank: initialRank,
      };
      setUserProfile(newProfile);
      localStorage.setItem('maestreArcoUser', JSON.stringify(newProfile));
      setAppState(AppState.ID_CARD_VIEW);
    } catch (error) {
      console.error("Failed to generate study plan:", error);
      alert(t('studyPlanError'));
      setAppState(AppState.REGISTRATION);
    } finally {
      setIsGeneratingPlan(false);
    }
  }, [language, t]);
  
  const handleIDCardAcknowledged = useCallback(() => setAppState(AppState.STUDY_PLAN), []);
  const handlePlanAcknowledged = useCallback(() => setAppState(AppState.DASHBOARD), []);
  const handleBeginModule = useCallback(() => setAppState(AppState.MODULE_VIEW), []);
  const handleReturnToDashboard = useCallback(() => setAppState(AppState.DASHBOARD), []);
  const handleDirectorPassAcknowledged = useCallback(() => setAppState(AppState.DASHBOARD), []);
  const handleJudgePassAcknowledged = useCallback(() => setAppState(AppState.GRAND_EXHIBITION_HALL), []);

  const handleSaveToArchive = useCallback((item: ArchivedItem) => {
    setUserProfile(prev => {
      if (!prev) return null;
      const updatedProfile = { ...prev, personalArchive: [...(prev.personalArchive || []), item] };
      localStorage.setItem('maestreArcoUser', JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  }, []);

  const handleEvaluationComplete = useCallback((result: FinalEvaluation) => {
    if (userProfile?.role === 'student' && userProfile.studyPlan) {
      setUserProfile(prev => {
         if (!prev) return null;
         const oldRank = prev.rank;
         let updatedProfile = { ...prev };
         if (result.passed) {
            const nextModuleIndex = prev.currentModuleIndex + 1;
            const xpFromModule = 100;
            const newXp = prev.xp + xpFromModule;
            const newRank = getRankForXp(newXp);
            updatedProfile.xp = newXp;
            updatedProfile.rank = newRank;
            if (nextModuleIndex < userProfile.studyPlan!.modules.length) {
              updatedProfile.currentModuleIndex = nextModuleIndex;
              showToast(t('moduleCompleteToast', { xp: xpFromModule.toString() }));
              if(newRank !== oldRank) {
                setTimeout(() => showToast(t('rankUpToast', { rank: newRank })), 3100);
              }
            } else {
               alert(t('allModulesComplete'));
            }
         }
         localStorage.setItem('maestreArcoUser', JSON.stringify(updatedProfile));
         return updatedProfile;
      });
    }
    setAppState(AppState.DASHBOARD);
  }, [userProfile, t]);

  const renderAppContent = () => {
    if (isGeneratingPlan) return <LoadingSpinner message={t('generatingPlanMessage')} />;
    if (!isInitialized || appState === null) return <LoadingSpinner message={t('loading')} />;

    switch (appState) {
      case AppState.UNIVERSAL_LOGIN:
        return <UniversalLoginScreen onLogin={handleLogin} onScanPass={handleScanPass} />;
      case AppState.QR_CODE_SCANNER:
        return <QRCodeScannerScreen 
            onJudgeScanSuccess={handleJudgeQrScanned} 
            onDirectorScanSuccess={handleDirectorQrScanned}
            onCancel={() => setAppState(AppState.UNIVERSAL_LOGIN)} 
        />;
      case AppState.DIRECTOR_PASS_VIEW:
        return userProfile && <DirectorPassScreen profile={userProfile} onAcknowledged={handleDirectorPassAcknowledged} />;
      case AppState.JUDGE_PASS_VIEW:
        return judgeData && <JudgePassScreen judge={judgeData} onAcknowledged={handleJudgePassAcknowledged} />;
      case AppState.WELCOME:
        return <WelcomeScreen onWelcomeComplete={handleWelcomeComplete} />;
      case AppState.REGISTRATION:
        return <RegistrationForm onRegistrationComplete={handleRegistrationComplete} />;
      case AppState.ID_CARD_VIEW:
        return userProfile && <IDCardScreen profile={userProfile} onAcknowledged={handleIDCardAcknowledged} />;
      case AppState.STUDY_PLAN:
        return userProfile?.studyPlan && <StudyPlanScreen plan={userProfile.studyPlan} onAcknowledged={handlePlanAcknowledged} />;
      case AppState.DASHBOARD:
        return userProfile && <ConservatoryDashboard 
          profile={userProfile} 
          onBeginModule={() => setAppState(AppState.MODULE_VIEW)}
          onEnterHallOfKnowledge={() => setAppState(AppState.HALL_OF_KNOWLEDGE)}
          onEnterAstralPianoHall={() => setAppState(AppState.ASTRAL_PIANO_HALL)}
          onEnterScriptorium={() => setAppState(AppState.SCRIPTURUM)}
          onEnterVoiceHall={() => setAppState(AppState.VOICE_HALL)}
          onEnterChromeLab={() => setAppState(AppState.CHROME_EXTENSION_LAB)}
          onEnterAtelier={() => setAppState(AppState.ATELIER_OF_VISION)}
          onEnterFounderGrant={() => setAppState(AppState.FOUNDER_GRANT)}
          onEnterMusicBook={() => setAppState(AppState.MUSIC_BOOK)}
          onEnterExhibitionHall={() => setAppState(AppState.GRAND_EXHIBITION_HALL)}
          onEnterBriefingRoom={() => setAppState(AppState.PROJECT_BRIEFING_ROOM)}
          onEnterFeatureSuggestions={() => setAppState(AppState.FEATURE_SUGGESTIONS)}
          onLogout={logoutAndReset}
        />;
      case AppState.MODULE_VIEW:
        return userProfile && <ModuleScreen profile={userProfile} onReturnToDashboard={handleReturnToDashboard} onBeginEvaluation={() => setAppState(AppState.LIVE_CLASSROOM)} onSaveToArchive={handleSaveToArchive} />;
      case AppState.HALL_OF_KNOWLEDGE:
        return <HallOfKnowledge onLeave={handleReturnToDashboard} />;
      case AppState.ASTRAL_PIANO_HALL:
        return <AstralPianoHall onLeave={handleReturnToDashboard} onSaveToArchive={handleSaveToArchive} />;
      case AppState.SCRIPTURUM:
          return userProfile && <Scriptorium profile={userProfile} onLeave={handleReturnToDashboard} />;
      case AppState.LIVE_CLASSROOM:
          return userProfile && <LiveClassroom profile={userProfile} onEvaluationComplete={handleEvaluationComplete} />;
      case AppState.VOICE_HALL:
          return <VoiceHall onLeave={handleReturnToDashboard} />;
      case AppState.CHROME_EXTENSION_LAB:
          return <ChromeExtensionLab onLeave={handleReturnToDashboard} />;
      case AppState.ATELIER_OF_VISION:
          return <AtelierOfVision onLeave={handleReturnToDashboard} />;
      case AppState.FOUNDER_GRANT:
        return userProfile && <FounderGrantScreen onGrantClaimed={() => {
            setUserProfile(p => p ? {...p, founderGrantClaimed: true} : null);
            setAppState(AppState.DASHBOARD);
        }} residence={userProfile.residence} />;
      case AppState.MUSIC_BOOK:
        return userProfile && <MusicBook profile={userProfile} onLeave={handleReturnToDashboard} />;
      case AppState.GRAND_EXHIBITION_HALL:
        return userProfile && <GrandExhibitionHall profile={userProfile} onLeave={handleReturnToDashboard} onExploreStudentExperience={handleExploreStudentExperience} />;
      case AppState.PROJECT_BRIEFING_ROOM:
        return <ProjectBriefingRoom onLeave={handleReturnToDashboard} />;
      case AppState.FEATURE_SUGGESTIONS:
        return <FeatureSuggestions onLeave={handleReturnToDashboard} />;
      default:
        return <LoadingSpinner message={t('loading')} />;
    }
  };

  return (
    <>
        {toast && (
            <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[2000] animate-fade-in-up">
                {toast}
            </div>
        )}
        {renderAppContent()}
        {userProfile && appState !== AppState.LIVE_CLASSROOM && <MaestreArcoTutor />}
    </>
  );
};

export default App;
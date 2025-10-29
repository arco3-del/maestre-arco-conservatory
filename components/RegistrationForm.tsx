import React, { useState, useCallback } from 'react';
import { UserProfile } from '../types';
import CameraCapture from './CameraCapture';
import { useLanguage } from '../context/LanguageContext';
import { getPlaceFromCoordinates } from '../services/geminiService';
import { LocationIcon } from './Icons/LocationIcon';
import TextToSpeechButton from './TextToSpeechButton';
import { TutorIcon } from './Icons/TutorIcon';

interface RegistrationFormProps {
  onRegistrationComplete: (profile: Omit<UserProfile, 'studyPlan' | 'currentModuleIndex' | 'founderGrantClaimed' | 'role' | 'boardMembers' | 'personalArchive' | 'xp' | 'rank' | 'isCalendarConnected'> & { isFamous: boolean }) => void;
}

const WelcomePanel: React.FC = () => {
    const { t } = useLanguage();
    const welcomeMessage = t('welcomePanelQuotes');

    return (
        <div className="w-full bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-8 border border-yellow-500/20 flex items-center gap-4 animate-fade-in">
            <div className="flex-shrink-0">
               <TutorIcon />
            </div>
            <div className="flex-grow">
                <p className="text-gray-200 italic">"{welcomeMessage}"</p>
            </div>
            <div className="flex-shrink-0">
                <TextToSpeechButton textToSpeak={welcomeMessage} />
            </div>
        </div>
    );
};

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegistrationComplete }) => {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<Omit<UserProfile, 'photo' | 'studyPlan' | 'currentModuleIndex' | 'founderGrantClaimed' | 'role' | 'boardMembers' | 'personalArchive' | 'xp' | 'rank' | 'isFamous' | 'isCalendarConnected'>>({
    fullName: '',
    age: '',
    residence: '',
    instrument: '',
  });
  const [isFamous, setIsFamous] = useState(false);
  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoTaken = (dataUrl: string) => {
    setPhoto(dataUrl);
  };

  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError(t('locationUnavailable'));
      return;
    }
    setIsGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const placeName = await getPlaceFromCoordinates(latitude, longitude, language);
          setProfile(prev => ({ ...prev, residence: placeName }));
        } catch (apiError) {
          console.error("Error getting place from coordinates:", apiError);
          setError(t('locationApiError'));
        } finally {
          setIsGettingLocation(false);
        }
      },
      (geoError) => {
        let message = t('locationUnavailable');
        if (geoError.code === geoError.PERMISSION_DENIED) {
            message = t('locationPermissionDenied');
        }
        console.error("Geolocation error:", geoError);
        setError(message);
        setIsGettingLocation(false);
      }
    );
  }, [language, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      setError(t('photoError'));
      return;
    }
    
    if (Object.values(profile).some(value => String(value).trim() === '')) {
      setError(t('fieldsError'));
      return;
    }
    setError('');
    onRegistrationComplete({ ...profile, photo, isFamous });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        <WelcomePanel />
        <div className="w-full bg-gray-800/50 backdrop-blur-md rounded-lg shadow-2xl shadow-cyan-500/10 border border-yellow-500/30 p-8">
            <h2 className="text-4xl text-center font-bold text-white mb-2">{t('idCardTitle')}</h2>
            <p className="text-center text-gray-400 mb-8">{t('idCardSubtitle')}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
                <CameraCapture onPhotoTaken={handlePhotoTaken} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-yellow-400">{t('fullNameLabel')}</label>
                <input type="text" name="fullName" id="fullName" value={profile.fullName} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                <label htmlFor="age" className="block text-sm font-medium text-yellow-400">{t('ageLabel')}</label>
                <input type="number" name="age" id="age" value={profile.age} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>

            <div>
                <label htmlFor="residence" className="block text-sm font-medium text-yellow-400">{t('residenceLabel')}</label>
                <div className="flex items-center gap-2 mt-1">
                    <input
                        type="text"
                        name="residence"
                        id="residence"
                        value={profile.residence}
                        onChange={handleChange}
                        className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                        disabled={isGettingLocation}
                    />
                    <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isGettingLocation}
                        className="flex-shrink-0 p-2.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                        title={t('getLocationButton')}
                    >
                        {isGettingLocation ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ) : (
                        <LocationIcon />
                        )}
                    </button>
                </div>
                {isGettingLocation && <p className="text-xs text-cyan-400 mt-1 animate-pulse">{t('gettingLocation')}</p>}
            </div>

            <div>
                <label htmlFor="instrument" className="block text-sm font-medium text-yellow-400">{t('instrumentLabel')}</label>
                <input type="text" name="instrument" id="instrument" value={profile.instrument} onChange={handleChange} placeholder={t('instrumentPlaceholder')} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
            </div>

            <div className="flex items-center justify-center bg-gray-700/50 p-3 rounded-md">
                <input
                    type="checkbox"
                    id="isFamous"
                    checked={isFamous}
                    onChange={(e) => setIsFamous(e.target.checked)}
                    className="h-4 w-4 text-yellow-500 bg-gray-600 border-gray-500 rounded focus:ring-yellow-600"
                />
                <label htmlFor="isFamous" className="ml-3 block text-sm font-medium text-yellow-300">
                    {t('isFamousArtistLabel')}
                </label>
            </div>

            {error && <p className="text-red-400 text-center">{error}</p>}
            
            <div>
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-gray-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-800 transition-all duration-300">
                {t('generatePlanButton')}
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
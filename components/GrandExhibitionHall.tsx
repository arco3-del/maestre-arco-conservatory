import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile, Rank } from '../types';
import IDCard from './IDCard';
import { StudentIcon } from './Icons/StudentIcon';
import { generateAndDownloadDossier } from '../utils/dossierGenerator';
import { DownloadIcon } from './Icons/DownloadIcon';

interface GrandExhibitionHallProps {
    profile: UserProfile;
    onLeave: () => void;
    onExploreStudentExperience: () => void;
}

const GrandExhibitionHall: React.FC<GrandExhibitionHallProps> = ({ profile, onLeave, onExploreStudentExperience }) => {
    const { t, language } = useLanguage();

    const criteria = [
        { key: 'functionality', title: t('criteriaFunctionality'), content: t('responseFunctionality') },
        { key: 'purpose', title: t('criteriaPurpose'), content: t('responsePurpose') },
        { key: 'content', title: t('criteriaContent'), content: t('responseContent') },
        { key: 'ux', title: t('criteriaUX'), content: t('responseUX') },
        { key: 'tech', title: t('criteriaTech'), content: t('responseTech') },
    ];
    
    const boardMembers = [
      { name: 'Bradford Lee', title: 'Gerente de Marketing de Productos, Chrome', photo: 'https://i.ibb.co/wJ24s81/Bradford-Lee.webp' },
      { name: 'François Beaufort', title: 'Ingeniero de Relaciones con Desarrolladores, Chrome', photo: 'https://i.ibb.co/ZJpWkcc/Francois-Beaufort.webp' },
      { name: 'Alexandra Klepper', title: 'Redactora Técnica Sénior, Chrome', photo: 'https://i.ibb.co/qD5BNcH/Alexandra-Klepper.webp' },
      { name: 'Thomas Steiner', title: 'Ingeniero de Relaciones con Desarrolladores, Chrome', photo: 'https://i.ibb.co/QvjNn8G/Thomas-Steiner.webp' },
      { name: 'Andre Bandarra', title: 'Ingeniero de Relaciones con Desarrolladores, Chrome', photo: 'https://i.ibb.co/dM302sM/Andre-Bandarra.webp' },
      { name: 'Rob Kochman', title: 'Gerente de Producto del Grupo, Chrome', photo: 'https://i.ibb.co/s57P3V3/Rob-Kochman.webp' },
      { name: 'Kenji Baheux', title: 'Gerente Sénior de Producto, Chrome', photo: 'https://i.ibb.co/1q2x0W5/Kenji-Baheux.webp' },
      { name: 'Sebastian Benz', title: 'Ingeniero Líder, Extensiones de Chrome', photo: 'https://i.ibb.co/7jX4mNf/Sebastian-Benz.webp' }
    ];

    const [selectedMember, setSelectedMember] = useState(profile.role === 'judge' ? boardMembers.find(m => m.name === profile.fullName) || boardMembers[0] : boardMembers[0]);

    const handleDownloadDossier = () => {
        generateAndDownloadDossier(language);
    };

    const Criterion: React.FC<{ title: string, content: string }> = ({ title, content }) => (
        <details className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20 transition-all duration-300 open:bg-cyan-900/20 open:shadow-lg">
            <summary className="font-semibold text-lg text-cyan-300 cursor-pointer">{title}</summary>
            <p className="mt-2 text-gray-300 whitespace-pre-line">{content}</p>
        </details>
    );
    
    const memberProfile: UserProfile = {
        fullName: selectedMember.name,
        photo: selectedMember.photo,
        instrument: selectedMember.title,
        role: 'judge',
        rank: Rank.MAESTRO_VIRTUOSO_INTERESTELAR,
        age: 'N/A',
        residence: 'Royal Board of Google',
        studyPlan: null,
        currentModuleIndex: 0,
        founderGrantClaimed: true,
        personalArchive: [],
        isFamous: true,
        xp: 9999,
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-5xl mx-auto">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-6">
                    &larr; {t('backToDashboardButton')}
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('exhibitionHallTitle')}</h1>
                    <p className="text-lg text-cyan-300 mt-2">{t('exhibitionHallSubtitle')}</p>
                    <div className="mt-4 max-w-lg mx-auto p-3 bg-red-900/50 border border-red-500 rounded-lg animate-pulse">
                        <p className="font-bold text-red-300">{t('convocationUrgencyNote')}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-md rounded-lg border border-yellow-500/30 p-8 space-y-16">
                    
                    {/* Official Convocation Section */}
                    <section className="animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-white text-center mb-6 border-b-2 border-yellow-400/50 pb-3">{t('convocationTitle')}</h2>
                        <div className="max-w-3xl mx-auto bg-gray-900/70 border-2 border-yellow-600 rounded-lg p-6 shadow-2xl shadow-yellow-500/10">
                            <h3 className="text-2xl font-bold text-yellow-400 text-center mb-4" style={{ fontFamily: 'var(--font-serif)' }}>{t('convocationOfficialTitle')}</h3>
                            <div className="max-h-80 overflow-y-auto pr-4 space-y-4 text-gray-300 text-base leading-relaxed">
                                <p>{t('convocationBodyP1')}</p>
                                <p>{t('convocationBodyP2')}</p>
                                <p>{t('convocationBodyP3')}</p>

                                <h4 className="text-xl font-semibold text-cyan-300 pt-2 border-t border-yellow-600/50">{t('convocationPrizesTitle')}</h4>
                                <ul className="list-disc pl-6 text-gray-200" dangerouslySetInnerHTML={{ __html: t('convocationPrizesList') }} />

                                <h4 className="text-xl font-semibold text-cyan-300 pt-2 border-t border-yellow-600/50">{t('convocationCriteriaTitle')}</h4>
                                <ul className="list-disc pl-6 text-gray-200 space-y-2" dangerouslySetInnerHTML={{ __html: t('convocationCriteriaList') }} />
                            </div>
                        </div>
                    </section>
                    
                    {/* Inaugural Address Section */}
                    <section className="animate-fade-in-up" style={{animationDelay: '100ms'}}>
                        <h2 className="text-3xl font-bold text-white text-center mb-6 border-b-2 border-yellow-400/50 pb-3">{t('inauguralAddressTitle')}</h2>
                         <div className="max-w-3xl mx-auto bg-gray-900/50 p-6 rounded-lg border border-cyan-700">
                            <p className="text-gray-300 italic text-lg leading-relaxed text-left whitespace-pre-line" style={{ fontFamily: 'var(--font-serif)' }}>
                                "{t('inauguralAddressBody')}"
                            </p>
                            <p className="text-right mt-4 text-gray-400">- {profile.fullName}, Director</p>
                        </div>
                    </section>

                    {/* Project Manifesto Section */}
                    <section className="animate-fade-in-up" style={{animationDelay: '200ms'}}>
                        <h2 className="text-3xl font-bold text-white text-center mb-6 border-b-2 border-yellow-400/50 pb-3">{t('projectManifestoTitle')}</h2>
                        <div className="max-w-3xl mx-auto bg-gray-900/50 p-6 rounded-lg border border-cyan-700">
                            <p className="text-gray-300 text-base leading-relaxed text-left whitespace-pre-line">
                                {t('projectManifestoBody')}
                            </p>
                        </div>
                    </section>

                    {/* Judging Panel */}
                    <section className="animate-fade-in-up" style={{animationDelay: '300ms'}}>
                        <h2 className="text-3xl font-bold text-white text-center mb-6 border-b-2 border-yellow-400/50 pb-3">{t('judgingPanelTitle')}</h2>
                        <div className="flex flex-col items-center">
                            <div className="mb-6">
                                <IDCard profile={memberProfile} />
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                            {boardMembers.map(member => (
                                <button
                                key={member.name}
                                onClick={() => setSelectedMember(member)}
                                className={`px-3 py-1 text-xs rounded-full border-2 transition-colors flex items-center gap-2 ${selectedMember.name === member.name ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-gray-700 text-gray-200 border-gray-600'}`}
                                >
                                <img src={member.photo} alt={member.name} className="w-6 h-6 rounded-full" />
                                {member.name}
                                </button>
                            ))}
                            </div>
                        </div>
                    </section>

                    {/* Evaluation Criteria Response Section */}
                    <section className="animate-fade-in-up" style={{animationDelay: '400ms'}}>
                        <h2 className="text-3xl font-bold text-white text-center mb-6 border-b-2 border-yellow-400/50 pb-3">{t('evaluationResponseTitle')}</h2>
                        <div className="space-y-4">
                            {criteria.map(c => <Criterion key={c.key} title={c.title} content={c.content} />)}
                        </div>
                    </section>
                    
                    {/* Future Vision Section */}
                    <section className="animate-fade-in-up" style={{animationDelay: '500ms'}}>
                        <h2 className="text-3xl font-bold text-white text-center mb-6 border-b-2 border-yellow-400/50 pb-3">{t('futureVisionTitle')}</h2>
                        <p className="text-center text-gray-300 mt-2 mb-8">{t('futureVisionDescription')}</p>
                        <div className="bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600">
                            <img src="https://i.ibb.co/Xz9gT0C/ejercicio-diario-ss.png" alt="Future Vision Mockup" className="w-full h-auto" />
                        </div>
                    </section>
                    
                    {/* Final Resources Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <div className="mt-16 pt-8 border-t-2 border-cyan-500/20 text-center">
                            <h2 className="text-3xl font-bold text-white text-center mb-6">{t('finalLinksTitle')}</h2>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={handleDownloadDossier}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300"
                                >
                                    <DownloadIcon />
                                    {t('downloadDossierButton')}
                                </button>
                                <button
                                    onClick={onExploreStudentExperience}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-300 font-bold rounded-full hover:bg-cyan-900/50 hover:text-white transition-all duration-300"
                                >
                                    <StudentIcon />
                                    {t('exploreLiveButton')}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default GrandExhibitionHall;
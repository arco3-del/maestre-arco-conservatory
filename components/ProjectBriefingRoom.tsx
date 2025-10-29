import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ProjectBriefingRoomProps {
    onLeave: () => void;
}

const ProjectBriefingRoom: React.FC<ProjectBriefingRoomProps> = ({ onLeave }) => {
    const { t } = useLanguage();

    const sections = [
        { titleKey: 'directorOfficeFunction', content: [
            { label: 'Function', key: 'directorOfficeFunction' },
            { label: 'Technology', key: 'directorOfficeTech' },
            { label: 'Real-World Impact', key: 'directorOfficeImpact' },
        ]},
        { titleKey: 'studyPlanFunction', content: [
            { label: 'Function', key: 'studyPlanFunction' },
            { label: 'Technology', key: 'studyPlanTech' },
            { label: 'Real-World Impact', key: 'studyPlanImpact' },
        ]},
        { titleKey: 'studyRoomFunction', content: [
            { label: 'Function', key: 'studyRoomFunction' },
            { label: 'Technology', key: 'studyRoomTech' },
            { label: 'Real-World Impact', key: 'studyRoomImpact' },
        ]},
        { titleKey: 'liveClassroomFunction', content: [
            { label: 'Function', key: 'liveClassroomFunction' },
            { label: 'Technology', key: 'liveClassroomTech' },
            { label: 'Real-World Impact', key: 'liveClassroomImpact' },
        ]},
        { titleKey: 'knowledgeHallFunction', content: [
            { label: 'Function', key: 'knowledgeHallFunction' },
            { label: 'Technology', key: 'knowledgeHallTech' },
            { label: 'Real-World Impact', key: 'knowledgeHallImpact' },
        ]},
        { titleKey: 'pianoHallFunction', content: [
            { label: 'Function', key: 'pianoHallFunction' },
            { label: 'Technology', key: 'pianoHallTech' },
            { label: 'Real-World Impact', key: 'pianoHallImpact' },
        ]},
         { titleKey: 'scriptoriumFunction', content: [
            { label: 'Function', key: 'scriptoriumFunction' },
            { label: 'Technology', key: 'scriptoriumTech' },
            { label: 'Real-World Impact', key: 'scriptoriumImpact' },
        ]},
        { titleKey: 'visionAtelierFunction', content: [
            { label: 'Function', key: 'visionAtelierFunction' },
            { label: 'Technology', key: 'visionAtelierTech' },
            { label: 'Real-World Impact', key: 'visionAtelierImpact' },
        ]},
        { titleKey: 'chromeLabFunction', content: [
            { label: 'Function', key: 'chromeLabFunction' },
            { label: 'Technology', key: 'chromeLabTech' },
            { label: 'Real-World Impact', key: 'chromeLabImpact' },
        ]},
        { titleKey: 'musicBookFunction', content: [
            { label: 'Function', key: 'musicBookFunction' },
            { label: 'Technology', key: 'musicBookTech' },
            { label: 'Real-World Impact', key: 'musicBookImpact' },
        ]},
        { titleKey: 'voiceHallFunction', content: [
            { label: 'Function', key: 'voiceHallFunction' },
            { label: 'Technology', key: 'voiceHallTech' },
            { label: 'Real-World Impact', key: 'voiceHallImpact' },
        ]},
    ];

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-6">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="bg-gray-800/50 backdrop-blur-md rounded-lg border border-yellow-500/30 p-8 space-y-12">
                    
                    <section className="animate-fade-in-up">
                        <h1 className="text-3xl font-bold text-white text-center mb-6 border-b-2 border-yellow-400/50 pb-3">{t('briefingTitle')}</h1>
                        <div className="space-y-8">
                            {sections.map((section, index) => (
                                <details key={index} className="bg-gray-900/50 p-4 rounded-lg border border-cyan-500/20 transition-all duration-300 open:bg-cyan-900/20">
                                    <summary className="font-semibold text-lg text-cyan-300 cursor-pointer" dangerouslySetInnerHTML={{ __html: t(section.titleKey) }}></summary>
                                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-600">
                                        {section.content.slice(1).map(item => (
                                            <p key={item.key} className="text-gray-300" dangerouslySetInnerHTML={{ __html: t(item.key) }}></p>
                                        ))}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default ProjectBriefingRoom;

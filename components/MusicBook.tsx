import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile, PracticeLogPost, ArchivedItem, Rank, Conversation } from '../types';
import { ApplauseIcon } from './Icons/ApplauseIcon';
import { EchoIcon } from './Icons/EchoIcon';
import ChatScreen from './ChatScreen';
import VideoCallScreen from './VideoCallScreen';
import { ChatIcon } from './Icons/ChatIcon';
import { VideoCallIcon } from './Icons/VideoCallIcon';
import { ArchiveIcon } from './Icons/ArchiveIcon';
import RankBadge from './RankBadge';

interface MusicBookProps {
    profile: UserProfile;
    onLeave: () => void;
}

type MusicBookView = 'main' | 'chat' | 'video_call';
type Student = { id: string; name: string; photo: string; instrument: string; isOnline: boolean; rank: Rank };

// Mock Data for demonstration
const mockStudents: Student[] = [
    { id: 'elena', name: 'Elena Petrova', photo: 'https://i.pravatar.cc/150?u=elena', instrument: 'Violin', isOnline: true, rank: Rank.SOLISTA_AVENTAJADO },
    { id: 'kenji', name: 'Kenji Tanaka', photo: 'https://i.pravatar.cc/150?u=kenji', instrument: 'Piano', isOnline: true, rank: Rank.COMPAÑERO_ARMONICO },
    { id: 'aisha', name: 'Aisha Khan', photo: 'https://i.pravatar.cc/150?u=aisha', instrument: 'Cello', isOnline: false, rank: Rank.APRENDIZ_MELODICO },
    { id: 'marco', name: 'Marco Rossi', photo: 'https://i.pravatar.cc/150?u=marco', instrument: 'Guitar', isOnline: true, rank: Rank.COMPAÑERO_ARMONICO },
    { id: 'chloe', name: 'Chloé Dubois', photo: 'https://i.pravatar.cc/150?u=chloe', instrument: 'Flute', isOnline: false, rank: Rank.POLLITO_CON_MADERA },
];

const initialPosts: PracticeLogPost[] = [
    {
        id: 'post-maestre',
        authorName: 'Maestre Arco',
        authorPhoto: '/default-profile-icon.svg',
        authorRank: Rank.MAESTRO_VIRTUOSO_INTERESTELAR,
        content: "La música, en su esencia, es el sonido del sentimiento. No busquen la perfección en las notas, sino la verdad en la emoción que transmiten. La técnica es el barco, pero la emoción es el viento que lo impulsa.",
        moduleTitle: "Reflexión del Día del Maestre",
        timestamp: "Hace 2 horas",
        applauseCount: 15,
        echoes: []
    },
    {
        id: 'post-1',
        authorName: 'Elena Petrova',
        authorPhoto: 'https://i.pravatar.cc/150?u=elena',
        authorRank: Rank.SOLISTA_AVENTAJADO,
        content: "¡Finalmente superé esa sección de arpegios en el Módulo 4! Me costó mucho trabajo pero la sensación de logro es increíble. El secreto fue practicar muy, muy lento al principio.",
        moduleTitle: "Módulo 4: Dinámicas y Articulación Avanzada",
        timestamp: "Hace 5 horas",
        applauseCount: 8,
        echoes: [{ id: 'echo-1', authorName: 'Kenji Tanaka', authorPhoto: 'https://i.pravatar.cc/150?u=kenji', content: '¡Felicidades, Elena! Esa parte también me costó.', timestamp: 'hace 4h' }]
    },
];

const MusicBook: React.FC<MusicBookProps> = ({ profile, onLeave }) => {
    const { t } = useLanguage();
    const [view, setView] = useState<MusicBookView>('main');
    const [activeChatStudent, setActiveChatStudent] = useState<Student | null>(null);
    const [activeCallStudent, setActiveCallStudent] = useState<Student | null>(null);

    const handleStartChat = (student: Student) => {
        setActiveChatStudent(student);
        setView('chat');
    };
    
    const handleStartVideoCall = (student: Student) => {
        setActiveCallStudent(student);
        setView('video_call');
    };

    if (view === 'chat' && activeChatStudent) {
        return <ChatScreen currentUser={profile} student={activeChatStudent} onBack={() => setView('main')} />;
    }
    
    if (view === 'video_call' && activeCallStudent) {
        return <VideoCallScreen student={activeCallStudent} onEndCall={() => setView('main')} />;
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <button onClick={onLeave} className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-4">
                    &larr; {t('backToDashboardButton')}
                </button>
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t('musicBookCommunityTitle')}</h1>
                    <p className="text-lg text-indigo-300 mt-2">{t('musicBookCommunitySubtitle')}</p>
                </div>
                <MainSocialView profile={profile} onStartChat={handleStartChat} onStartVideoCall={handleStartVideoCall} />
            </div>
        </div>
    );
};

// --- Main View with Tabs ---
const MainSocialView: React.FC<{
    profile: UserProfile,
    onStartChat: (student: Student) => void,
    onStartVideoCall: (student: Student) => void
}> = ({ profile, onStartChat, onStartVideoCall }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'wall' | 'messages' | 'collaborate'>('wall');

    const TabButton = ({ tab, label }: { tab: string, label: string }) => (
        <button
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-4 ${activeTab === tab ? 'text-white border-indigo-400' : 'text-gray-400 border-transparent hover:text-white'}`}
        >
            {label}
        </button>
    );

    return (
        <>
            <div className="flex bg-gray-800/50 rounded-t-lg">
                <TabButton tab="wall" label={t('theWallTab')} />
                <TabButton tab="messages" label={t('messagesTab')} />
                <TabButton tab="collaborate" label={t('collaborationsTab')} />
            </div>
            <div className="bg-gray-800/70 rounded-b-lg p-4">
                {activeTab === 'wall' && <WallView profile={profile} />}
                {activeTab === 'messages' && <MessagesView onStartChat={onStartChat} />}
                {activeTab === 'collaborate' && <CollaborateView onStartVideoCall={onStartVideoCall} />}
            </div>
        </>
    );
};

// --- Wall Tab ---
const WallView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<PracticeLogPost[]>(initialPosts);
    const [newPostContent, setNewPostContent] = useState('');
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [attachment, setAttachment] = useState<ArchivedItem | null>(null);

    const handlePost = () => {
        if (!newPostContent.trim() && !attachment) return;

        const newPost: PracticeLogPost = {
            id: `post-${Date.now()}`,
            authorName: profile.fullName,
            authorPhoto: profile.photo,
            authorRank: profile.rank,
            content: newPostContent,
            moduleTitle: profile.studyPlan?.modules[profile.currentModuleIndex]?.title || "Estudio General",
            timestamp: "Justo ahora",
            applauseCount: 0,
            echoes: [],
            attachment: attachment || undefined
        };

        setPosts([newPost, ...posts]);
        setNewPostContent('');
        setAttachment(null);
    };

    const handleApplause = (postId: string) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, applauseCount: p.applauseCount + 1 } : p));
    };

    const handleAttach = (item: ArchivedItem) => {
        setAttachment(item);
        setIsArchiveOpen(false);
    };

    return (
        <div>
            {/* Create Post Card */}
            <div className="bg-gray-800 rounded-lg p-4 mb-8 border border-gray-700">
                 <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={t('practiceLogPlaceholder')}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 resize-none"
                    rows={3}
                />
                {attachment && (
                    <div className="mt-2 p-2 bg-gray-700/50 rounded-md text-sm text-cyan-300 border border-cyan-500/30">
                        <strong>Adjunto:</strong> {attachment.title}
                    </div>
                )}
                <div className="flex justify-between items-center mt-2">
                    <button onClick={() => setIsArchiveOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-500">
                        <ArchiveIcon /> {t('attachFromArchiveButton')}
                    </button>
                    <button onClick={handlePost} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500">
                        {t('postButton')}
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
                 {posts.map(post => (
                    <div key={post.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700 animate-fade-in-up">
                        <div className="flex items-start gap-4">
                            <img src={post.authorPhoto} alt={post.authorName} className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400" />
                            <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-white">{post.authorName}</p>
                                    <RankBadge rank={post.authorRank} isSmall={true} />
                                    <p className="text-xs text-gray-400 ml-auto">{post.timestamp}</p>
                                </div>
                                <p className={`text-sm ${post.authorName === 'Maestre Arco' ? 'text-yellow-300' : 'text-cyan-300'}`}>
                                    {post.attachment 
                                        ? (post.attachment.type === 'composition' ? t('publishedAPiece') : t('publishedAPractice'))
                                        : post.moduleTitle
                                    }
                                </p>
                                {post.attachment && (
                                     <div className="mt-2 p-3 bg-gray-900/50 rounded-md text-sm border border-gray-600">
                                         <p className="font-bold text-yellow-300">{post.attachment.title}</p>
                                         <p className="text-gray-400 text-xs mt-1 truncate">{JSON.stringify(post.attachment.content)}</p>
                                     </div>
                                )}
                                <p className={`mt-2 ${post.authorName === 'Maestre Arco' ? 'text-gray-200 italic font-serif text-lg' : 'text-gray-300'}`}>{post.content}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-700 flex items-center gap-6">
                            <button onClick={() => handleApplause(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors">
                                <ApplauseIcon />
                                <span>{post.applauseCount} {t('applaudButton')}</span>
                            </button>
                            <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                                <EchoIcon />
                                <span>{post.echoes.length} {t('echoesButton')}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {isArchiveOpen && <ArchiveModal profile={profile} onAttach={handleAttach} onClose={() => setIsArchiveOpen(false)} />}
        </div>
    );
};

// --- Archive Modal ---
const ArchiveModal: React.FC<{ profile: UserProfile, onAttach: (item: ArchivedItem) => void, onClose: () => void }> = ({ profile, onAttach, onClose }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-yellow-500/50" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white text-center mb-4">{t('personalArchiveTitle')}</h2>
                <div className="max-h-96 overflow-y-auto space-y-3">
                    {profile.personalArchive.length > 0 ? profile.personalArchive.map(item => (
                        <div key={item.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-cyan-300">{item.title}</p>
                                <p className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                            <button onClick={() => onAttach(item)} className="px-4 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-500">
                                {t('attachButton')}
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 py-8">{t('emptyArchiveMessage')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Messages Tab ---
const MessagesView: React.FC<{ onStartChat: (student: Student) => void }> = ({ onStartChat }) => {
    return (
        <div className="space-y-3">
            {mockStudents.map(student => (
                <div key={student.id} className="bg-gray-700/50 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full"/>
                        <div>
                            <div className="flex items-center gap-2">
                               <p className="font-semibold text-white">{student.name}</p>
                               <RankBadge rank={student.rank} isSmall={true} />
                            </div>
                            <p className="text-xs text-gray-400">{student.instrument}</p>
                        </div>
                    </div>
                    <button onClick={() => onStartChat(student)} className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-500">
                        <ChatIcon />
                    </button>
                </div>
            ))}
        </div>
    );
};

// --- Collaborate Tab ---
const CollaborateView: React.FC<{ onStartVideoCall: (student: Student) => void }> = ({ onStartVideoCall }) => {
    const { t } = useLanguage();
    return (
         <div className="space-y-3">
            {mockStudents.map(student => (
                <div key={student.id} className="bg-gray-700/50 p-3 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                         <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full"/>
                         <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-white">{student.name}</p>
                                <RankBadge rank={student.rank} isSmall={true} />
                            </div>
                            <p className={`text-xs ${student.isOnline ? 'text-green-400' : 'text-gray-500'}`}>{student.isOnline ? t('onlineStatus') : t('offlineStatus')}</p>
                        </div>
                    </div>
                     <button disabled={!student.isOnline} onClick={() => onStartVideoCall(student)} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <VideoCallIcon />
                    </button>
                </div>
            ))}
        </div>
    );
};


export default MusicBook;
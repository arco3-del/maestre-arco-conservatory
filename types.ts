export enum AppState {
  WELCOME,
  REGISTRATION,
  ID_CARD_VIEW,
  STUDY_PLAN,
  DASHBOARD,
  MODULE_VIEW,
  HALL_OF_KNOWLEDGE,
  ASTRAL_PIANO_HALL,
  SCRIPTURUM,
  LIVE_CLASSROOM,
  VOICE_HALL,
  CHROME_EXTENSION_LAB,
  ATELIER_OF_VISION,
  FOUNDER_GRANT,
  DIRECTOR_PASS_VIEW,
  JUDGE_PASS_VIEW,
  GRAND_EXHIBITION_HALL,
  MUSIC_BOOK,
  UNIVERSAL_LOGIN,
  QR_CODE_SCANNER,
  PROJECT_BRIEFING_ROOM,
  FEATURE_SUGGESTIONS,
}

export enum Rank {
    POLLITO_CON_MADERA = "Pollito con Madera",
    APRENDIZ_MELODICO = "Aprendiz Melódico",
    COMPAÑERO_ARMONICO = "Compañero Armónico",
    SOLISTA_AVENTAJADO = "Solista Aventajado",
    MAESTRO_DE_ESCENA = "Maestro de Escena",
    MAESTRO_VIRTUOSO_INTERESTELAR = "Maestro Virtuoso Interestelar",
}

export interface ArchivedItem {
    id: string;
    type: 'composition' | 'practice_feedback';
    title: string;
    content: any; 
    timestamp: string;
}

export interface UserProfile {
  fullName: string;
  age: string;
  residence: string;
  instrument: string;
  photo: string;
  studyPlan: StudyPlan | null;
  currentModuleIndex: number;
  founderGrantClaimed: boolean;
  role: 'student' | 'director' | 'judge';
  bio?: string;
  personalArchive: ArchivedItem[];
  isFamous: boolean;
  xp: number;
  rank: Rank;
}

export interface SubModule {
  title: string;
  description: string;
  sources?: GroundingSource[];
}

export interface Module {
  module: number;
  title: string;
  description: string;
  instrument_technique: SubModule[];
  music_theory: SubModule[];
  music_history: SubModule[];
}

export interface StudyPlan {
  instrument: string;
  modules: Module[];
}

export interface EvaluationScore {
  intonation: number;
  rhythm: number;
  musicality: number;
  interpretation: number;
  total: number;
}

export interface InstrumentFeedback {
  instrumento: string;
  analisisTono: string;
  analisisRitmo: string;
  analisisPostura: string;
  sugerencias: string;
  evaluacion: EvaluationScore;
}

export interface FinalEvaluation {
  overallFeedback: string;
  score: EvaluationScore;
  passed: boolean;
}

export interface StudyMaterial {
  title: string;
  theoretical_concepts: string[];
  warm_up_exercises: string[];
  main_pieces: string[];
  interpretation_tips: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SearchResult {
  answer: string;
  sources: GroundingSource[];
}

export interface Composition {
  lyrics: string;
  chords: string;
  melodyDescription: string;
  mood: string;
}

export interface Exercise {
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  answer: string;
}

export interface TheoryLesson {
  topic: string;
  explanation: string;
  exercises: Exercise[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface Echo {
    id: string;
    authorName: string;
    authorPhoto: string;
    content: string;
    timestamp: string;
}

export interface PracticeLogPost {
    id: string;
    authorName: string;
    authorPhoto: string;
    authorRank: Rank;
    content: string;
    moduleTitle: string;
    timestamp: string;
    applauseCount: number;
    echoes: Echo[];
    attachment?: ArchivedItem;
}

export interface Conversation {
    studentId: string;
    studentPhoto: string;
    studentInstrument: string;
    studentRank: Rank;
    messages: ChatMessage[];
}

export interface VocalFeedback {
  pitchAnalysis: string;
  rhythmAnalysis: string;
  breathingAnalysis: string;
  overallFeedback: string;
}

export interface WarmUpFeedback {
  feedback: string;
}

export interface JudgePassData {
  id: string;
  type: 'MAESTRE_ARCO_JUDGE_PASS';
  name: string;
  title: string;
  photo: string;
}

export interface DirectorPassData {
  type: 'MAESTRE_ARCO_DIRECTOR_PASS';
  name: string;
}
export type SubjectType = 
  | 'বাংলা ভাষা ও সাহিত্য' 
  | 'English Language & Literature' 
  | 'গাণিতিক যুক্তি ও মানসিক দক্ষতা' 
  | 'বাংলাদেশ বিষয়াবলী' 
  | 'আন্তর্জাতিক বিষয়াবলী' 
  | 'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'superadmin' | 'admin';
  targetExam: string;
  studyMinutes: number;
  currentStreak: number;
  lastActiveDate: string;
  score: number;
  completedTopics: string[]; // "Subject|Topic"
  bookmarkedTopics: string[];
  registeredDate?: string;
  status?: 'active' | 'blocked';
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  author: string;
  isImportant?: boolean;
}

export interface SyllabusItem {
  id: string;
  subject: SubjectType;
  category: string;
  topic: string;
  estimatedMinutes: number;
  importance: 'High' | 'Medium' | 'Essential';
  youtubeQuery: string;
  keySummary: string;
}

export interface GKItem {
  id: string;
  title: string;
  category: 'বাংলাদেশ' | 'আন্তর্জাতিক' | 'অর্থনীতি' | 'বিজ্ঞান ও পরিবেশ' | 'খেলাধুলা';
  date: string;
  details: string;
  examTip: string;
  source?: string;
}

export interface QuizQuestion {
  id: string;
  subject: SubjectType;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface VivaQuestion {
  id: string;
  category: string;
  question: string;
  context: string;
  expectedKeywords: string[];
  sampleModelAnswer: string;
}

export interface PodcastChapter {
  id: string;
  title: string;
  subject: string;
  durationText: string;
  speechText: string;
  summary: string;
}

export interface LearnerPeer {
  id: string;
  name: string;
  target: string;
  avatar: string;
  currentTopic: string;
  minutesToday: number;
  status: 'studying' | 'break' | 'mock-exam';
}

export interface ErrorQuestionItem {
  id: string;
  question: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  subject: string;
  date: string;
}

export interface SpacedRevisionItem {
  id: string;
  topicKey: string;
  subject: string;
  topic: string;
  level: number; // 1 to 5
  nextReviewDate: string;
  lastReviewed: string;
}

export type JobExamCategory = 
  | '১১-২০তম গ্রেড সরকারি চাকরি'
  | 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক'
  | 'NTRCA শিক্ষক নিবন্ধন'
  | 'ব্যাংক নিয়োগ পরীক্ষা'
  | 'বিসিএস প্রিলিমিনারি';

export interface PastPaperQuestion {
  id: string;
  category: JobExamCategory;
  examTitle: string;
  bcsYear?: string;
  subject: SubjectType;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
  gradeLevel?: string;
}

export interface CheatSheetItem {
  id: string;
  subject: SubjectType | 'সাধারণ জ্ঞান ও ভূরাজনীতি';
  category: string;
  title: string;
  ruleOrFormula: string;
  explanation: string;
  example: string;
  shortcutTip: string;
}

export interface EditorialWord {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  bengaliMeaning: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  newspaperSource: string;
  examTip: string;
}

export interface DailyPlannerTask {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  isCompleted: boolean;
  priority: 'High' | 'Normal';
}

export interface TargetExamCountdown {
  id: string;
  name: string;
  targetDate: string; // YYYY-MM-DD
  authority: string;
  vacancyInfo?: string;
  color: string;
}

export interface WrittenQuestionItem {
  id: string;
  examTitle: string;
  gradeLevel: string;
  question: string;
  marks: number;
  modelAnswer: string;
  examTip: string;
}

export interface TopicStudyModule {
  id: string;
  subject: SubjectType;
  chapter: string;
  topicTitle: string;
  targetExams: string[];
  estimatedMinutes: number;
  importance: 'Essential' | 'High' | 'Medium';
  youtubeEmbedId: string;
  youtubeVideoTitle: string;
  referenceSource: {
    title: string;
    authority: string;
    webUrl: string;
    summaryNotes: string;
    keyRules: string[];
  };
  pastMCQs: {
    examName: string;
    grade: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  pastWrittenQuestions: WrittenQuestionItem[];
}


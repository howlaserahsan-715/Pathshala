import React, { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { 
  INITIAL_SYLLABUS, 
  INITIAL_GK_ITEMS, 
  MOCK_EXAM_QUESTIONS, 
  VIVA_QUESTIONS, 
  PODCAST_CHAPTERS, 
  MOCK_PEERS 
} from './data/mockData';
import { 
  UserProfile, 
  SyllabusItem, 
  GKItem, 
  QuizQuestion, 
  ErrorQuestionItem, 
  SpacedRevisionItem,
  PlatformAnnouncement
} from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeDashboard } from './components/HomeDashboard';
import { ConceptExplainer } from './components/ConceptExplainer';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AITutor } from './components/AITutor';
import { SyllabusLessons } from './components/SyllabusLessons';
import { LiveGK } from './components/LiveGK';
import { VivaSimulator } from './components/VivaSimulator';
import { AudioPodcast } from './components/AudioPodcast';
import { FocusRoom } from './components/FocusRoom';
import { DailyChallenge } from './components/DailyChallenge';
import { JobEligibility } from './components/JobEligibility';
import { MockTestOMR } from './components/MockTestOMR';
import { RevisionQueue } from './components/RevisionQueue';
import { ErrorLog } from './components/ErrorLog';
import { CloudSettings } from './components/CloudSettings';
import { AuthModal } from './components/AuthModal';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { PastBCSPapers } from './components/PastBCSPapers';
import { CustomQuizMaker } from './components/CustomQuizMaker';
import { LeaderboardBadges } from './components/LeaderboardBadges';
import { FormulaVault } from './components/FormulaVault';
import { DailyVocabulary } from './components/DailyVocabulary';
import { ExamPlanner } from './components/ExamPlanner';

export default function App() {
  // Theme dark/light state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pathsala_theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('pathsala_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
        localStorage.setItem('pathsala_theme', 'light');
      }
    } catch (e) {
      console.error('Error applying theme:', e);
    }
  }, [isDark]);

  // Multi-user database in localStorage
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>(() => {
    const defaultSuperAdmin: UserProfile = {
      id: 'creativeteamoperation@gmail.com',
      email: 'creativeteamoperation@gmail.com',
      name: 'প্রধান সুপার এডমিন',
      password: 'Admin@123456',
      role: 'superadmin',
      targetExam: '৪৭তম বিসিএস (সুপার এডমিন কন্ট্রোল)',
      studyMinutes: 150,
      currentStreak: 7,
      lastActiveDate: new Date().toISOString(),
      score: 600,
      completedTopics: ['বাংলা ভাষা ও সাহিত্য|সমাস নির্ণয় ও নিয়মাবলী', 'বাংলাদেশ বিষয়াবলী|বাংলাদেশের সংবিধান: মূল অনুচ্ছেদ ও সংশোধনী'],
      bookmarkedTopics: [],
      registeredDate: '০১/০১/২০২৬',
      status: 'active',
    };

    const secondaryAdmin: UserProfile = {
      id: 'admin@pathsala.com',
      email: 'admin@pathsala.com',
      name: 'সুপার এডমিন (অফিসিয়াল)',
      password: 'Admin@123456',
      role: 'superadmin',
      targetExam: 'বিসিএস ও ব্যাংক পরীক্ষা মডারেটর',
      studyMinutes: 90,
      currentStreak: 5,
      lastActiveDate: new Date().toISOString(),
      score: 450,
      completedTopics: ['বাংলা ভাষা ও সাহিত্য|সমাস নির্ণয় ও নিয়মাবলী'],
      bookmarkedTopics: [],
      registeredDate: '০১/০১/২০২৬',
      status: 'active',
    };

    const sampleStudent: UserProfile = {
      id: 'student@gmail.com',
      email: 'student@gmail.com',
      name: 'বিসিএস পরীক্ষার্থী',
      password: 'Student@123',
      role: 'student',
      targetExam: '৪৭তম বিসিএস (প্রশাসন)',
      studyMinutes: 45,
      currentStreak: 3,
      lastActiveDate: new Date().toISOString(),
      score: 120,
      completedTopics: ['বাংলা ভাষা ও সাহিত্য|সমাস নির্ণয় ও নিয়মাবলী'],
      bookmarkedTopics: [],
      registeredDate: '১৫/০২/২০২৬',
      status: 'active',
    };

    try {
      const stored = localStorage.getItem('pathsala_multi_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure master super admin always exists
        if (!parsed['creativeteamoperation@gmail.com']) {
          parsed['creativeteamoperation@gmail.com'] = defaultSuperAdmin;
        }
        if (!parsed['admin@pathsala.com']) {
          parsed['admin@pathsala.com'] = secondaryAdmin;
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }

    return {
      'creativeteamoperation@gmail.com': defaultSuperAdmin,
      'admin@pathsala.com': secondaryAdmin,
      'student@gmail.com': sampleStudent,
    };
  });

  // Current active user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    // Default to the user's email if possible, or student
    const defaultEmail = 'creativeteamoperation@gmail.com';
    return allUsers[defaultEmail] || allUsers['student@gmail.com'] || {
      id: 'student@gmail.com',
      email: 'student@gmail.com',
      name: 'বিসিএস পরীক্ষার্থী',
      password: 'Student@123',
      role: 'student',
      targetExam: '৪৭তম বিসিএস (প্রশাসন)',
      studyMinutes: 45,
      currentStreak: 3,
      lastActiveDate: new Date().toISOString(),
      score: 120,
      completedTopics: ['বাংলা ভাষা ও সাহিত্য|সমাস নির্ণয় ও নিয়মাবলী'],
      bookmarkedTopics: [],
      registeredDate: 'আজ',
      status: 'active',
    };
  });

  // Dynamic Mock Questions Bank (Admin editable)
  const [mockQuestions, setMockQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const stored = localStorage.getItem('pathsala_custom_questions');
      return stored ? JSON.parse(stored) : MOCK_EXAM_QUESTIONS;
    } catch {
      return MOCK_EXAM_QUESTIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('pathsala_custom_questions', JSON.stringify(mockQuestions));
  }, [mockQuestions]);

  // Platform Announcements (Admin broadcastable)
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(() => {
    try {
      const stored = localStorage.getItem('pathsala_announcements');
      return stored ? JSON.parse(stored) : [
        {
          id: 'ann-init-1',
          title: '📢 ৪৭তম বিসিএস গ্র্যান্ড মেগা মক টেস্ট আগামী শুক্রবার অনুষ্ঠিত হবে!',
          message: 'বিসিএস প্রিলিমিনারি প্রস্তুতির চূড়ান্ত মূল্য��য়নের জন্য সকল শিক্ষার্��ীকে ওএমআর মক টেস্ট ট্যাবে অংশ নেওয়ার জন্য অনুরোধ করা হচ্ছে। নেগেটিভ মার্কিং -০.৫০ নিয়মে স্বয়ংক্রিয় মেরিট লিস্ট ও ভুল খাতা আপডেট হবে।',
          date: 'আজকের নোটিশ',
          author: 'প্রধান সুপার এডমিন',
          isImportant: true,
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pathsala_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // User Error Notebook Items
  const [errorLog, setErrorLog] = useState<ErrorQuestionItem[]>(() => {
    try {
      const stored = localStorage.getItem(`pathsala_errors_${currentUser.email}`);
      return stored ? JSON.parse(stored) : [
        {
          id: 'err-sample-1',
          question: 'কোনো সংখ্যার ৬০% থেকে ৬০ বিয়োগ করলে বিয়োগফল ৬০ হয়। সংখ্যাটি কত?',
          options: ['১০০', '১৫০', '২০০', '২৫০'],
          userAnswer: '১৫০',
          correctAnswer: '২০০',
          explanation: '০.৬x - ৬০ = ৬০ => ০.৬x = ১২০ => x = ২০০।',
          subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
          date: 'আজ',
        }
      ];
    } catch {
      return [];
    }
  });

  // Spaced Revision Queue Items
  const [revisionQueue, setRevisionQueue] = useState<SpacedRevisionItem[]>(() => {
    try {
      const stored = localStorage.getItem(`pathsala_revision_${currentUser.email}`);
      return stored ? JSON.parse(stored) : [
        {
          id: 'rev-1',
          topicKey: 'বাংলা ভাষা ও সাহিত্য|সমাস নির্ণয় ও নিয়মাবলী',
          subject: 'বাংলা ভাষা ও সাহিত্য',
          topic: 'সমাস নির্ণয় ও নিয়মাবলী',
          level: 2,
          nextReviewDate: 'আগামীকাল',
          lastReviewed: 'গতকাল',
        }
      ];
    } catch {
      return [];
    }
  });

  // Active Tab & Navigation
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Explainer context
  const [explainerContext, setExplainerContext] = useState<{ subject: string; topic: string }>({
    subject: 'বাংলা ভাষা ও সাহিত্য',
    topic: 'সমাস নির্ণয় ও নিয়মাবলী',
  });

  // Save changes to current user in allUsers DB & localStorage
  const saveUserData = (updated: Partial<UserProfile>) => {
    const newProfile = { ...currentUser, ...updated };
    setCurrentUser(newProfile);

    const updatedAll = {
      ...allUsers,
      [newProfile.email]: newProfile,
    };
    setAllUsers(updatedAll);
    localStorage.setItem('pathsala_multi_users', JSON.stringify(updatedAll));
  };

  // Sync error log to localStorage
  useEffect(() => {
    localStorage.setItem(`pathsala_errors_${currentUser.email}`, JSON.stringify(errorLog));
  }, [errorLog, currentUser.email]);

  // Sync revision queue to localStorage
  useEffect(() => {
    localStorage.setItem(`pathsala_revision_${currentUser.email}`, JSON.stringify(revisionQueue));
  }, [revisionQueue, currentUser.email]);

  // User Registration Handler
  const handleRegisterUser = (newUser: UserProfile) => {
    const updated = {
      ...allUsers,
      [newUser.email]: newUser,
    };
    setAllUsers(updated);
    localStorage.setItem('pathsala_multi_users', JSON.stringify(updated));
  };

  // User Password Update Handler (e.g. from Forgot Password)
  const handleUpdateUserPassword = (email: string, newPass: string): boolean => {
    const user = allUsers[email];
    if (!user) return false;

    const updatedUser = { ...user, password: newPass };
    const updated = {
      ...allUsers,
      [email]: updatedUser,
    };
    setAllUsers(updated);
    localStorage.setItem('pathsala_multi_users', JSON.stringify(updated));

    if (currentUser.email === email) {
      setCurrentUser(updatedUser);
    }
    return true;
  };

  // Super Admin: Update Role (promote/demote)
  const handleUpdateUserRole = (email: string, newRole: 'student' | 'superadmin') => {
    const user = allUsers[email];
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    const updated = { ...allUsers, [email]: updatedUser };
    setAllUsers(updated);
    localStorage.setItem('pathsala_multi_users', JSON.stringify(updated));
    if (currentUser.email === email) {
      setCurrentUser(updatedUser);
    }
    alert(`${user.name} এর রোল পরিবর্তন করে "${newRole === 'superadmin' ? 'সুপার এডমিন' : 'শিক্ষার্থী'}" করা হয়েছে!`);
  };

  // Super Admin: Update Status (block/active)
  const handleUpdateUserStatus = (email: string, newStatus: 'active' | 'blocked') => {
    const user = allUsers[email];
    if (!user) return;
    const updatedUser = { ...user, status: newStatus };
    const updated = { ...allUsers, [email]: updatedUser };
    setAllUsers(updated);
    localStorage.setItem('pathsala_multi_users', JSON.stringify(updated));
    alert(`${user.name} এর অ্যাকাউন্ট "${newStatus === 'blocked' ? 'ব্লক' : 'সক্রিয়'}" করা হয়েছে!`);
  };

  // Super Admin: Admin Reset Password
  const handleAdminResetPassword = (email: string, tempPass: string) => {
    handleUpdateUserPassword(email, tempPass);
  };

  // Super Admin: Delete User
  const handleDeleteUser = (email: string) => {
    const updated = { ...allUsers };
    delete updated[email];
    setAllUsers(updated);
    localStorage.setItem('pathsala_multi_users', JSON.stringify(updated));
    alert(`ইউজার মুছে ফেলা হয়েছে।`);
  };

  // Super Admin: Question Bank Handlers
  const handleAddQuestion = (q: QuizQuestion) => {
    setMockQuestions((prev) => [q, ...prev]);
  };

  const handleDeleteQuestion = (id: string) => {
    setMockQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Super Admin: Announcement Handlers
  const handleAddAnnouncement = (a: PlatformAnnouncement) => {
    setAnnouncements((prev) => [a, ...prev]);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Study Handlers
  const handleStudyTimeEarned = (minutes: number) => {
    const newMinutes = currentUser.studyMinutes + minutes;
    const newScore = currentUser.score + minutes * 2;
    saveUserData({ studyMinutes: newMinutes, score: newScore });
  };

  const handleToggleComplete = (subject: string, topic: string) => {
    const key = `${subject}|${topic}`;
    const exists = currentUser.completedTopics.includes(key);
    let nextList: string[];
    if (exists) {
      nextList = currentUser.completedTopics.filter((t) => t !== key);
    } else {
      nextList = [...currentUser.completedTopics, key];
    }
    saveUserData({ completedTopics: nextList });
  };

  const handleOpenConcept = (subject: string, topic: string) => {
    setExplainerContext({ subject, topic });
    setActiveTab('conceptExplainer');
  };

  const handleAddMissedQuestion = (q: QuizQuestion, selectedOption: string) => {
    const newError: ErrorQuestionItem = {
      id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question: q.question,
      options: q.options,
      userAnswer: selectedOption,
      correctAnswer: q.options[q.correctIndex],
      explanation: q.explanation,
      subject: q.subject,
      date: new Date().toLocaleDateString('bn-BD'),
    };
    setErrorLog((prev) => [newError, ...prev.filter((e) => e.question !== q.question)]);
  };

  const handleRemoveError = (id: string) => {
    setErrorLog((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearAllErrors = () => {
    setErrorLog([]);
  };

  const handleAddToRevision = (subject: string, topic: string) => {
    const key = `${subject}|${topic}`;
    if (revisionQueue.some((r) => r.topicKey === key)) {
      alert('টপিকটি ইতিমধ্যে আপনার রিভিশন কিউতে রয়েছে!');
      return;
    }

    const newItem: SpacedRevisionItem = {
      id: `rev-${Date.now()}`,
      topicKey: key,
      subject,
      topic,
      level: 1,
      nextReviewDate: 'আগামীকাল',
      lastReviewed: 'আজ',
    };
    setRevisionQueue([newItem, ...revisionQueue]);
    alert(`"${topic}" সফলভাবে রিভিশন কিউতে যুক্ত হয়েছে!`);
  };

  const handleReviewPerformance = (id: string, performance: 'again' | 'hard' | 'good' | 'easy') => {
    setRevisionQueue((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let newLevel = item.level;
        let nextDate = 'আগামীকাল';

        if (performance === 'again') {
          newLevel = 1;
          nextDate = 'আগামীকাল';
        } else if (performance === 'hard') {
          newLevel = Math.max(1, item.level);
          nextDate = '৩ দিন পর';
        } else if (performance === 'good') {
          newLevel = Math.min(5, item.level + 1);
          nextDate = `${newLevel * 3} দিন পর`;
        } else {
          newLevel = Math.min(5, item.level + 2);
          nextDate = '১৪ দিন পর';
        }

        return {
          ...item,
          level: newLevel,
          nextReviewDate: nextDate,
          lastReviewed: 'আজ',
        };
      })
    );
  };

  const handleRemoveRevision = (id: string) => {
    setRevisionQueue((prev) => prev.filter((r) => r.id !== id));
  };

  const handleLoginUser = (profile: UserProfile) => {
    setCurrentUser(profile);
    const updated = {
      ...allUsers,
      [profile.email]: profile,
    };
    setAllUsers(updated);
    localStorage.setItem('pathsala_multi_users', JSON.stringify(updated));
    setIsAuthModalOpen(false);

    // Load errors & revision queue for selected user
    try {
      const uErrors = localStorage.getItem(`pathsala_errors_${profile.email}`);
      if (uErrors) setErrorLog(JSON.parse(uErrors));
      else setErrorLog([]);

      const uRev = localStorage.getItem(`pathsala_revision_${profile.email}`);
      if (uRev) setRevisionQueue(JSON.parse(uRev));
      else setRevisionQueue([]);
    } catch (e) {
      // ignore
    }
  };

  const handleResetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Header Titles lookup
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    home: { title: 'হোম ড্যাশবোর্ড', subtitle: 'আপনার সম্পূর্ণ ও স্বয়ংক্রিয় সরকারি চাকরি প্রস্তুতির হাব' },
    planner: { title: 'পরীক্ষার কাউন্টডাউন ও স্টাডি রুটিন', subtitle: 'টার্গেট পরীক্ষার দিনক্ষণ ও দৈনিক টু-ডু প্ল্যানার' },
    pastPapers: { title: 'বিগত বিসিএস প্রশ্ন ব্যাংক আর্কাইভ', subtitle: '১০ম থেকে ৪৬তম বিসিএস প্রিলিমিনারি প্রশ্ন সমাধান ও মক টেস্ট' },
    customQuiz: { title: 'কাস্টম স্পিড কুইজ মেকার', subtitle: 'দুর্বল বিষয়ের ওপর ভিত্তি করে কাস্টম টেস্ট তৈরি করুন' },
    leaderboard: { title: 'ক্যাডার লিডারবোর্ড ও সম্মাননা ব্যাজ', subtitle: 'সাপ্তাহিক সেরা ১০ শিক্ষার্থী ও অর্জন' },
    formulaVault: { title: 'শর্টকাট সূত্র ও চিট-শীট ভল্ট', subtitle: 'গণিত, ব্যাকরণ ও সংবিধানের মেমোরি ছন্দ' },
    vocabulary: { title: 'সম্পাদকীয় ভোকাবুলারি ব্যাংক', subtitle: 'The Daily Star ও প্রখ্যাত পত্রিকার সম্পাদকীয় শব্দভাণ্ডার' },
    superAdmin: { title: 'সুপার এডমিন কন্ট্রোল রুম', subtitle: 'ইউজার ম্যানেজমেন্ট, প্রশ্ন ব্যাংক ও নোটিশ পাবলিশিং' },
    conceptExplainer: { title: 'ডেইলি কনসেপ্ট ক্ল্যারিফায়ার', subtitle: 'প্রতিদিনের পড়ার কনসেপ্ট, শর্টকাট টেকনিক ও উদাহরণ' },
    pomodoro: { title: 'পোমোডোরো স্টাডি টাইমার', subtitle: 'ফোকাসড ও সুশৃঙ্খল স্টাডি সেশন' },
    tutor: { title: 'এআই প্রাইভেট টিউটর', subtitle: 'যেকোনো বিষয়ের ডাউট সলভার ও মেন্টর' },
    syllabus: { title: 'অধ্যায়ভিত্তিক পড়াশোনা — লিখিত ও এমসিকিউ হাব', subtitle: 'টপিক অনুযায়ী বিগত MCQ, লিখিত প্রশ্ন ও সমাধান, প্রামাণ্য রেফারেন্স ও ক্লাস' },
    current: { title: 'AI Live GK & Current Affairs', subtitle: 'রিয়েল-টাইম সংগৃহীত তথ্য ও সাধারণ জ্ঞান ক্যাপসুল' },
    viva: { title: 'এআই ভাইভা সিমুলেটর', subtitle: 'মৌখিক পরীক্ষার মক ভাইভা ও তাৎক্ষণিক স্কোরকার্ড' },
    podcast: { title: 'স্টাডি পডকাস্ট অডিও মোড', subtitle: 'অডিও আকারে শুনুন গুরুত্বপূর্ণ লেকচার' },
    focusRoom: { title: 'ফোকাস স্টাডি ওয়ার্ল্ড', subtitle: 'অনলাইনে সক্রিয় অন্যান্য চাকরিপ্রার্থীদের সাথে লাইভ স্টাডি' },
    challenge: { title: 'ডেইলি চ্যালেঞ্জ এরিনা', subtitle: 'প্রতিদিনের এমসিকিউ টেস্ট ও পয়েন্ট অর্জন' },
    eligibility: { title: 'চাকরি যোগ্যতা ক্যালকুলেটর', subtitle: 'বয়স ও ডিগ্রি অনুযায়ী যোগ্য চাকরির সার্কুলার' },
    exams: { title: 'ওএমআর মক টেস্ট', subtitle: 'নেগেটিভ মার্কিং সহ বাস্তব মডেল টেস্ট' },
    revision: { title: 'স্পেসড রিভিশন কিউ', subtitle: 'স্মৃতিতে তথ্য দীর্ঘস্থায়ী করার শিডিউল' },
    errors: { title: 'ভুল খাতা (Error Log)', subtitle: 'ভুল হওয়া প্রশ্নসমূহ পুনরায় অনুশীলনের ডায়রি' },
    settings: { title: 'ক্লাউ�� সিঙ্ক ও সেটিংস', subtitle: 'গুগল শিট ব্যাকএণ্ড ও প্রোফাইল ব্যবস্থাপনা' },
  };

  const currentTabInfo = tabTitles[activeTab] || { title: 'পাঠশালা', subtitle: 'স্টাডি রুম' };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={() => setIsAuthModalOpen(true)}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        errorCount={errorLog.length}
        revisionCount={revisionQueue.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          title={currentTabInfo.title}
          subtitle={currentTabInfo.subtitle}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenProfileModal={() => setIsAuthModalOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        />

        {/* Viewport Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeDashboard
              currentUser={currentUser}
              syllabus={INITIAL_SYLLABUS}
              latestGK={INITIAL_GK_ITEMS}
              errorCount={errorLog.length}
              announcements={announcements}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenTopic={handleOpenConcept}
            />
          )}

          {activeTab === 'planner' && (
            <ExamPlanner onStartPomodoro={() => setActiveTab('pomodoro')} />
          )}

          {activeTab === 'pastPapers' && (
            <PastBCSPapers
              onAddToRevision={handleAddToRevision}
              onAddMissedToErrorLog={handleAddMissedQuestion}
            />
          )}

          {activeTab === 'customQuiz' && (
            <CustomQuizMaker
              availableQuestions={mockQuestions}
              onPointsEarned={(pts) => saveUserData({ score: currentUser.score + pts })}
              onQuestionMissed={handleAddMissedQuestion}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardBadges
              currentUser={currentUser}
              allUsers={allUsers}
              peers={MOCK_PEERS}
            />
          )}

          {activeTab === 'formulaVault' && <FormulaVault />}

          {activeTab === 'vocabulary' && <DailyVocabulary />}

          {activeTab === 'superAdmin' && currentUser.role === 'superadmin' && (
            <SuperAdminPanel
              currentUser={currentUser}
              allUsers={allUsers}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateUserStatus={handleUpdateUserStatus}
              onAdminResetPassword={handleAdminResetPassword}
              onDeleteUser={handleDeleteUser}
              mockQuestions={mockQuestions}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {activeTab === 'conceptExplainer' && (
            <ConceptExplainer
              initialSubject={explainerContext.subject}
              initialTopic={explainerContext.topic}
              onMarkComplete={handleToggleComplete}
              onOpenVideo={(t) => {
                setActiveTab('syllabus');
              }}
              isTopicCompleted={currentUser.completedTopics.includes(
                `${explainerContext.subject}|${explainerContext.topic}`
              )}
            />
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroTimer onStudyTimeEarned={handleStudyTimeEarned} />
          )}

          {activeTab === 'tutor' && <AITutor />}

          {activeTab === 'syllabus' && (
            <SyllabusLessons
              syllabus={INITIAL_SYLLABUS}
              completedTopics={currentUser.completedTopics}
              onToggleComplete={handleToggleComplete}
              onOpenConcept={handleOpenConcept}
              onAddToRevision={handleAddToRevision}
              onStartPomodoro={() => setActiveTab('pomodoro')}
            />
          )}

          {activeTab === 'current' && <LiveGK initialItems={INITIAL_GK_ITEMS} />}

          {activeTab === 'viva' && <VivaSimulator questions={VIVA_QUESTIONS} />}

          {activeTab === 'podcast' && <AudioPodcast chapters={PODCAST_CHAPTERS} />}

          {activeTab === 'focusRoom' && (
            <FocusRoom currentUser={currentUser} initialPeers={MOCK_PEERS} />
          )}

          {activeTab === 'challenge' && (
            <DailyChallenge
              questions={mockQuestions.slice(0, 5)}
              onPointsEarned={(pts) => saveUserData({ score: currentUser.score + pts })}
              onQuestionMissed={handleAddMissedQuestion}
            />
          )}

          {activeTab === 'eligibility' && <JobEligibility />}

          {activeTab === 'exams' && (
            <MockTestOMR
              questions={mockQuestions}
              onTestCompleted={(earnedScore) =>
                saveUserData({ score: currentUser.score + earnedScore })
              }
              onAddMissedToErrorLog={handleAddMissedQuestion}
            />
          )}

          {activeTab === 'revision' && (
            <RevisionQueue
              items={revisionQueue}
              onReviewItem={handleReviewPerformance}
              onRemoveItem={handleRemoveRevision}
              onOpenConcept={handleOpenConcept}
            />
          )}

          {activeTab === 'errors' && (
            <ErrorLog
              errors={errorLog}
              onRemoveError={handleRemoveError}
              onClearAll={handleClearAllErrors}
            />
          )}

          {activeTab === 'settings' && (
            <CloudSettings
              currentUser={currentUser}
              onUpdateProfile={(up) => saveUserData(up)}
              onResetAllData={handleResetAllData}
              completedTopicsCount={currentUser.completedTopics.length}
            />
          )}
        </main>
      </div>

      {/* Multi-User Login, Registration & Forgot Password Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLoginUser}
        existingUsers={allUsers}
        onRegisterUser={handleRegisterUser}
        onUpdateUserPassword={handleUpdateUserPassword}
        currentEmail={currentUser.email}
      />
      
      {/* Vercel Speed Insights */}
      <SpeedInsights />
    </div>
  );
}

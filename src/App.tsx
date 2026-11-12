import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_SYLLABUS,
  INITIAL_GK_ITEMS,
  MOCK_EXAM_QUESTIONS,
  VIVA_QUESTIONS,
  PODCAST_CHAPTERS,
  MOCK_PEERS,
} from './data/mockData';
import {
  UserProfile,
  SyllabusItem,
  GKItem,
  QuizQuestion,
  ErrorQuestionItem,
  SpacedRevisionItem,
  PlatformAnnouncement,
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
import { api } from './lib/api';

type ResetRequest = { id: string; email: string; requested_at: string };

export default function App() {
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

  const [booting, setBooting] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>({});
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const [mockQuestions, setMockQuestions] = useState<QuizQuestion[]>(MOCK_EXAM_QUESTIONS);
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [errorLog, setErrorLog] = useState<ErrorQuestionItem[]>([]);
  const [revisionQueue, setRevisionQueue] = useState<SpacedRevisionItem[]>([]);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [explainerContext, setExplainerContext] = useState<{ subject: string; topic: string }>({
    subject: 'বাংলা ভাষা ও সাহিত্য',
    topic: 'সমাস নির্ণয় ও নিয়মাবলী',
  });

  const profileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revisionsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedErrors = useRef<string>('');
  const lastSavedRevisions = useRef<string>('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Boot: restore session + load cloud data                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api.me();
        if (!cancelled && me.user) {
          setCurrentUser(me.user);
          await loadUserData(me.user);
        }
      } catch (error) {
        console.error('Session restore failed', error);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async (user: UserProfile) => {
    const [errorsRes, revisionsRes, questionsRes, announcementsRes, leaderboardRes] =
      await Promise.allSettled([
        api.getData<ErrorQuestionItem[]>('errors'),
        api.getData<SpacedRevisionItem[]>('revisions'),
        api.questions(),
        api.announcements(),
        api.leaderboard(),
      ]);

    if (errorsRes.status === 'fulfilled' && Array.isArray(errorsRes.value.data)) {
      lastSavedErrors.current = JSON.stringify(errorsRes.value.data);
      setErrorLog(errorsRes.value.data);
    } else {
      lastSavedErrors.current = '[]';
      setErrorLog([]);
    }

    if (revisionsRes.status === 'fulfilled' && Array.isArray(revisionsRes.value.data)) {
      lastSavedRevisions.current = JSON.stringify(revisionsRes.value.data);
      setRevisionQueue(revisionsRes.value.data);
    } else {
      lastSavedRevisions.current = '[]';
      setRevisionQueue([]);
    }

    if (questionsRes.status === 'fulfilled' && questionsRes.value.questions.length) {
      setMockQuestions(questionsRes.value.questions as QuizQuestion[]);
    } else {
      setMockQuestions(MOCK_EXAM_QUESTIONS);
    }

    if (announcementsRes.status === 'fulfilled') {
      setAnnouncements(announcementsRes.value.announcements as PlatformAnnouncement[]);
    }

    if (leaderboardRes.status === 'fulfilled') {
      const map: Record<string, UserProfile> = {};
      for (const peer of leaderboardRes.value.users) map[peer.email] = peer;
      setAllUsers(map);
    }

    if (user.role === 'superadmin') {
      await refreshAdminData();
    }
  };

  const refreshAdminData = async () => {
    try {
      const [usersRes, resetsRes] = await Promise.all([
        api.admin.users(),
        api.admin.resetRequests(),
      ]);
      setAllUsers(usersRes.users);
      setResetRequests(resetsRes.requests);
    } catch (error) {
      console.error('Admin data load failed', error);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Persistence                                                        */
  /* ------------------------------------------------------------------ */

  const scheduleProfileSave = (patch: Partial<UserProfile>) => {
    if (profileTimer.current) clearTimeout(profileTimer.current);
    setSyncState('saving');
    profileTimer.current = setTimeout(async () => {
      try {
        const result = await api.updateProfile(patch);
        if (mounted.current) {
          setCurrentUser(result.user);
          setSyncState('saved');
          setTimeout(() => mounted.current && setSyncState('idle'), 1800);
        }
      } catch (error) {
        console.error('Profile save failed', error);
        if (mounted.current) setSyncState('error');
      }
    }, 500);
  };

  const saveUserData = (updated: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      scheduleProfileSave(updated);
      return next;
    });
  };

  useEffect(() => {
    if (!currentUser) return;
    const serialized = JSON.stringify(errorLog);
    if (serialized === lastSavedErrors.current) return;
    lastSavedErrors.current = serialized;
    if (errorsTimer.current) clearTimeout(errorsTimer.current);
    errorsTimer.current = setTimeout(() => {
      api.putData('errors', errorLog).catch((e) => console.error('Error log save failed', e));
    }, 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorLog, currentUser?.email]);

  useEffect(() => {
    if (!currentUser) return;
    const serialized = JSON.stringify(revisionQueue);
    if (serialized === lastSavedRevisions.current) return;
    lastSavedRevisions.current = serialized;
    if (revisionsTimer.current) clearTimeout(revisionsTimer.current);
    revisionsTimer.current = setTimeout(() => {
      api.putData('revisions', revisionQueue).catch((e) => console.error('Revision save failed', e));
    }, 700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revisionQueue, currentUser?.email]);

  /* ------------------------------------------------------------------ */
  /* Auth                                                               */
  /* ------------------------------------------------------------------ */

  const handleAuthed = async (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('home');
    lastSavedErrors.current = '';
    lastSavedRevisions.current = '';
    await loadUserData(user);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
    setCurrentUser(null);
    setAllUsers({});
    setErrorLog([]);
    setRevisionQueue([]);
    setAnnouncements([]);
    setMockQuestions(MOCK_EXAM_QUESTIONS);
    setResetRequests([]);
  };

  /* ------------------------------------------------------------------ */
  /* Study handlers                                                     */
  /* ------------------------------------------------------------------ */

  const handleStudyTimeEarned = (minutes: number) => {
    if (!currentUser) return;
    saveUserData({
      studyMinutes: currentUser.studyMinutes + minutes,
      score: currentUser.score + minutes * 2,
    });
  };

  const handleToggleComplete = (subject: string, topic: string) => {
    if (!currentUser) return;
    const key = `${subject}|${topic}`;
    const exists = currentUser.completedTopics.includes(key);
    const nextList = exists
      ? currentUser.completedTopics.filter((t) => t !== key)
      : [...currentUser.completedTopics, key];
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
      alert('টপিকটি ইতিমধ্যে আপনার রিভিশন কিউতে রয়েছে!');
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
    alert(`"${topic}" সফলভাবে রিভিশন কিউতে যুক্ত হয়েছে!`);
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

        return { ...item, level: newLevel, nextReviewDate: nextDate, lastReviewed: 'আজ' };
      }),
    );
  };

  const handleRemoveRevision = (id: string) => {
    setRevisionQueue((prev) => prev.filter((r) => r.id !== id));
  };

  /* ------------------------------------------------------------------ */
  /* Admin handlers (server-backed)                                     */
  /* ------------------------------------------------------------------ */

  const handleUpdateUserRole = async (email: string, newRole: 'student' | 'superadmin') => {
    try {
      await api.admin.updateUser(email, { role: newRole });
      await refreshAdminData();
      alert(
        `${email} এর রোল পরিবর্তন করে "${newRole === 'superadmin' ? 'সুপার এডমিন' : 'শিক্ষার্থী'}" করা হয়েছে!`,
      );
    } catch (error: any) {
      alert(error?.message || 'রোল পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleUpdateUserStatus = async (email: string, newStatus: 'active' | 'blocked') => {
    try {
      await api.admin.updateUser(email, { status: newStatus });
      await refreshAdminData();
      alert(`অ্যাকাউন্ট "${newStatus === 'blocked' ? 'ব্লক' : 'সক্রিয়'}" করা হয়েছে!`);
    } catch (error: any) {
      alert(error?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleAdminResetPassword = async (email: string, tempPass: string) => {
    try {
      await api.admin.resetPassword(email, tempPass);
      await refreshAdminData();
      alert(`${email} এর পাসওয়ার্ড রিসেট হয়েছে। নতুন পাসওয়ার্ডটি ইউজারকে জানিয়ে দিন।`);
    } catch (error: any) {
      alert(error?.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteUser = async (email: string) => {
    try {
      await api.admin.deleteUser(email);
      await refreshAdminData();
      alert('ইউজার মুছে ফেলা হয়েছে।');
    } catch (error: any) {
      alert(error?.message || 'ইউজার মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const handleAddQuestion = async (q: QuizQuestion) => {
    try {
      await api.admin.addQuestion(q);
      setMockQuestions((prev) => [q, ...prev]);
    } catch (error: any) {
      alert(error?.message || 'প্রশ্ন যোগ করা যায়নি।');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await api.admin.deleteQuestion(id);
      setMockQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error: any) {
      alert(error?.message || 'প্রশ্ন মুছে ফেলা যায়নি।');
    }
  };

  const handleAddAnnouncement = async (a: PlatformAnnouncement) => {
    try {
      await api.admin.addAnnouncement(a);
      setAnnouncements((prev) => [a, ...prev]);
    } catch (error: any) {
      alert(error?.message || 'নোটিশ যোগ করা যায়নি।');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.admin.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (error: any) {
      alert(error?.message || 'নোটিশ মুছে ফেলা যায়নি।');
    }
  };

  const handleResetAllData = () => {
    // Cloud data stays safe; this only clears device-local caches.
    try {
      const theme = localStorage.getItem('pathsala_theme');
      localStorage.clear();
      if (theme) localStorage.setItem('pathsala_theme', theme);
    } catch {
      // ignore
    }
    window.location.reload();
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    home: { title: 'হোম ড্যাশবোর্ড', subtitle: 'আপনার সম্পূর্ণ ও স্বয়ংক্রিয় সরকারি চাকরি প্রস্তুতির হাব' },
    planner: { title: 'পরীক্ষার কাউন্টডাউন ও স্টাডি রুটিন', subtitle: 'টার্গেট পরীক্ষার দিনক্ষণ ও দৈনিক টু-ডু প্ল্যানার' },
    pastPapers: { title: 'বিগত বিসিএস প্রশ্ন ব্যাংক আর্কাইভ', subtitle: '১০ম থেকে ৪৬তম বিসিএস প্রিলিমিনারি প্রশ্ন সমাধান ও মক টেস্ট' },
    customQuiz: { title: 'কাস্টম স্পিড কুইজ মেকার', subtitle: 'দুর্বল বিষয়ের ওপর ভিত্তি করে কাস্টম টেস্ট তৈরি করুন' },
    leaderboard: { title: 'ক্যাডার লিডারবোর্ড ও সম্মাননা ব্যাজ', subtitle: 'সাপ্তাহিক সেরা ১০ শিক্ষার্থী ও অর্জন' },
    formulaVault: { title: 'শর্টকাট সূত্র ও চিট-শীট ভল্ট', subtitle: 'গণিত, ব্যাকরণ ও সংবিধানের মেমোরি ছন্দ' },
    vocabulary: { title: 'সম্পাদকীয় ভোকাবুলারি ব্যাংক', subtitle: 'The Daily Star ও প্রখ্যাত পত্রিকার সম্পাদকীয় শব্দভাণ্ডার' },
    superAdmin: { title: 'সুপার এডমিন কন্ট্রোল রুম', subtitle: 'ইউজার ম্যানেজমেন্ট, প্রশ্ন ব্যাংক ও নোটিশ পাবলিশিং' },
    conceptExplainer: { title: 'ডেইলি কনসেপ্ট ক্ল্যারিফায়ার', subtitle: 'প্রতিদিনের পড়ার কনসেপ্ট, শর্টকাট টেকনিক ও উদাহরণ' },
    pomodoro: { title: 'পোমোডোরো স্টাডি টাইমার', subtitle: 'ফোকাসড ও সুশৃঙ্খল স্টাডি সেশন' },
    tutor: { title: 'এআই প্রাইভেট টিউটর', subtitle: 'যেকোনো বিষয়ের ডাউট সলভার ও মেন্টর' },
    syllabus: { title: 'অধ্যায়ভিত্তিক পড়াশোনা — লিখিত ও এমসিকিউ হাব', subtitle: 'টপিক অনুযায়ী বিগত MCQ, লিখিত প্রশ্ন ও সমাধান, প্রামাণ্য রেফারেন্স ও ক্লাস' },
    current: { title: 'AI Live GK & Current Affairs', subtitle: 'রিয়েল-টাইম সংগৃহীত তথ্য ও সাধারণ জ্ঞান ক্যাপসুল' },
    viva: { title: 'এআই ভাইভা সিমুলেটর', subtitle: 'মৌখিক পরীক্ষার মক ভাইভা ও তাৎক্ষণিক স্কোরকার্ড' },
    podcast: { title: 'স্টাডি পডকাস্ট অডিও মোড', subtitle: 'অডিও আকারে শুনুন গুরুত্বপূর্ণ লেকচার' },
    focusRoom: { title: 'ফোকাস স্টাডি ওয়ার্ল্ড', subtitle: 'অনলাইনে সক্রিয় অন্যান্য চাকরিপ্রার্থীদের সাথে লাইভ স্টাডি' },
    challenge: { title: 'ডেইলি চ্যালেঞ্জ এরিনা', subtitle: 'প্রতিদিনের এমসিকিউ টেস্ট ও পয়েন্ট অর্জন' },
    eligibility: { title: 'চাকরি যোগ্যতা ক্যালকুলেটর', subtitle: 'বয়স ও ডিগ্রি অনুযায়ী যোগ্য চাকরির সার্কুলার' },
    exams: { title: 'ওএমআর মক টেস্ট', subtitle: 'নেগেটিভ মার্কিং সহ বাস্তব মডেল টেস্ট' },
    revision: { title: 'স্পেসড রিভিশন কিউ', subtitle: 'স্মৃতিতে তথ্য দীর্ঘস্থায়ী করার শিডিউল' },
    errors: { title: 'ভুল খাতা (Error Log)', subtitle: 'ভুল হওয়া প্রশ্নসমূহ পুনরায় অনুশীলনের ডায়রি' },
    settings: { title: 'ক্লাউড সিঙ্ক ও সেটিংস', subtitle: 'প্রোফাইল, পাসওয়ার্ড ও ডেটা ব্যাকআপ' },
  };

  const currentTabInfo = tabTitles[activeTab] || { title: 'পাঠশালা', subtitle: 'স্টাডি রুম' };

  if (booting) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse">
          প
        </div>
        <p className="text-sm font-semibold text-slate-500">পাঠশালা ক্লাউড স্টাডি রুম লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
        <AuthModal isOpen onClose={() => undefined} onAuthed={handleAuthed} canClose={false} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        errorCount={errorLog.length}
        revisionCount={revisionQueue.length}
      />

      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <Header
          title={currentTabInfo.title}
          subtitle={currentTabInfo.subtitle}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenProfileModal={() => setActiveTab('settings')}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
        />

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

          {activeTab === 'planner' && <ExamPlanner onStartPomodoro={() => setActiveTab('pomodoro')} />}

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
            <LeaderboardBadges currentUser={currentUser} allUsers={allUsers} peers={MOCK_PEERS} />
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
              resetRequests={resetRequests}
              onRefreshResetRequests={refreshAdminData}
            />
          )}

          {activeTab === 'conceptExplainer' && (
            <ConceptExplainer
              initialSubject={explainerContext.subject}
              initialTopic={explainerContext.topic}
              onMarkComplete={handleToggleComplete}
              onOpenVideo={() => setActiveTab('syllabus')}
              isTopicCompleted={currentUser.completedTopics.includes(
                `${explainerContext.subject}|${explainerContext.topic}`,
              )}
            />
          )}

          {activeTab === 'pomodoro' && <PomodoroTimer onStudyTimeEarned={handleStudyTimeEarned} />}

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
            <ErrorLog errors={errorLog} onRemoveError={handleRemoveError} onClearAll={handleClearAllErrors} />
          )}

          {activeTab === 'settings' && (
            <CloudSettings
              currentUser={currentUser}
              onUpdateProfile={(up) => saveUserData(up)}
              onResetAllData={handleResetAllData}
              completedTopicsCount={currentUser.completedTopics.length}
            />
          )}

          {syncState !== 'idle' && (
            <div className="fixed bottom-4 right-4 z-40 text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg border bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700">
              {syncState === 'saving' && <span className="text-slate-500">☁️ ক্লাউডে সেভ হচ্ছে...</span>}
              {syncState === 'saved' && <span className="text-emerald-600">✓ ক্লাউডে সেভ হয়েছে</span>}
              {syncState === 'error' && <span className="text-rose-600">⚠️ সেভ ব্যর্থ — আবার চেষ্টা হবে</span>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

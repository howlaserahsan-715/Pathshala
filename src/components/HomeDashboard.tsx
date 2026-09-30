import React from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Timer, 
  FileCheck2, 
  Mic, 
  CheckCircle2, 
  Clock, 
  Flame, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  BookOpen,
  Award,
  Users,
  Megaphone,
  Crown,
  ShieldCheck,
  History,
  Sliders,
  Trophy,
  BookMarked,
  Calendar
} from 'lucide-react';
import { UserProfile, GKItem, SyllabusItem, PlatformAnnouncement } from '../types';

interface HomeDashboardProps {
  currentUser: UserProfile;
  syllabus: SyllabusItem[];
  latestGK: GKItem[];
  errorCount: number;
  announcements?: PlatformAnnouncement[];
  onNavigate: (tab: string) => void;
  onOpenTopic: (subject: string, topic: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  syllabus,
  latestGK,
  errorCount,
  announcements = [],
  onNavigate,
  onOpenTopic,
}) => {
  const isSuperAdmin = currentUser.role === 'superadmin';
  const completedCount = currentUser.completedTopics.length;
  const totalTopics = syllabus.length;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // Time based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'শুভ সকাল' : hour < 17 ? 'শুভ অপরাহ্ন' : 'শুভ সন্ধ্যা';

  const quotes = [
    { quote: "ঘুমিয়ে যা দেখা যায় তা স্বপ্ন নয়, যা তোমাকে ঘুমাতে দেয় না সেটাই স্বপ্ন।", author: "ড. এ পি জে আবদুল কালাম" },
    { quote: "তুমি যদি ধৈর্যশীল হও এবং পরিশ্রম করো, তবে সাফল্য তোমার পদচুম্বন করবে।", author: "রবীন্দ্রনাথ ঠাকুর" },
    { quote: "মানুষের অসাধ্য কিছুই নেই, চেষ্টার কাছে ভাগ্যও নতি স্বীকার করে।", author: "কাজী নজরুল ইসলাম" },
  ];
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Super Admin Announcements Banner */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${
                a.isImportant
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              <Megaphone className={`w-5 h-5 shrink-0 mt-0.5 ${a.isImportant ? 'text-rose-600 animate-bounce' : 'text-indigo-600'}`} />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{a.title}</span>
                  {a.isImportant && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold text-[10px]">
                      জরুরি
                    </span>
                  )}
                </div>
                <p className="mt-1 leading-relaxed opacity-90">{a.message}</p>
                <div className="text-[10px] text-slate-400 mt-1">
                  প্রকাশক: {a.author} • {a.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
            {isSuperAdmin ? (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            )}
            <span>{isSuperAdmin ? '👑 সুপার এডমিন হিসেবে লগইন আছেন' : (currentUser.targetExam || '১১-২০তম গ্রেড, প্রাইমারি শিক্ষক ও NTRCA প্রস্তুতি')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}, {currentUser.name || 'শিক্ষার্থী'} 👋
          </h2>
          <p className="mt-2 text-slate-200 text-sm sm:text-base leading-relaxed">
            {isSuperAdmin 
              ? 'সুপার এডমিন হিসেবে আপনি যেকোনো ইউজার ম্যানেজ করতে পারেন, প্রশ্ন যোগ করতে পারেন ও সার্বজনীন নোটিশ প্রকাশ করতে পারেন।'
              : 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ, ১৮/১৯তম শিক্ষক নিবন্ধন (NTRCA) ও ১১-২০তম গ্রেডের সরকারি চাকরির জন্য আপনি কতটুকু প্রস্তুত? প্রতিদিনের সুনির্দিষ্ট প্রস্তুতি আপনাকে যেকোনো নিয়োগ পরীক্ষায় এগিয়ে রাখবে।'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {isSuperAdmin && (
              <button
                onClick={() => onNavigate('superAdmin')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition transform active:scale-95"
              >
                <Crown className="w-4 h-4 fill-current" />
                <span>সুপার এডমিন কন্ট্রোল প্যানেল</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('pastPapers')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-sm shadow-md transition transform active:scale-95"
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span>বিগত চাকরির প্রশ্ন ব্যাংক</span>
            </button>
            <button
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-sm border border-emerald-400/30 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>পরীক্ষার কাউন্টডাউন ও রুটিন</span>
            </button>
          </div>
        </div>

        {/* Abstract Glow shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 🎯 Target Focus Selector Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              আপনার প্রধান টার্গেট পরীক্ষার প্রস্তুতি ফোকাস:
            </span>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
            সিলেবাস ও প্রশ্ন ব্যাংক স্বয়ংক্রিয়ভাবে ফিল্টার হবে
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            { label: '🏫 প্রাথমিক শিক্ষক নিয়োগ', sub: '১৩তম গ্রেড (DPE)', val: 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক' },
            { label: '🎓 NTRCA শিক্ষক নিবন্ধন', sub: 'স্কুল ও কলেজ এমপিও', val: 'NTRCA শিক্ষক নিবন্ধন' },
            { label: '🏛️ ১১-২০তম গ্রেড চাকরি', sub: 'অডিটর, অফিস সহকারী', val: '১১-২০তম গ্রেড সরকারি চাকরি' },
            { label: '🏦 ব্যাংক অফিসার ও ক্যাশ', sub: 'বাংলাদেশ ব্যাংক ও সমন্বিত', val: 'ব্যাংক নিয়োগ পরীক্ষা' },
            { label: '📜 বিসিএস ও পিএসসি', sub: 'ক্যাডার ও নন-ক্যাডার', val: 'বিসিএস প্রিলিমিনারি' },
          ].map((item) => {
            const isCurrent = currentUser.targetExam === item.val || (!currentUser.targetExam && item.val.includes('১১-২০তম'));
            return (
              <button
                key={item.val}
                onClick={() => onNavigate('pastPapers')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold leading-tight">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-1">{item.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Time */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">অধ্যয়ন সময়</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {currentUser.studyMinutes} <span className="text-sm font-semibold text-slate-400">মিনিট</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> আজ সক্রিয়
            </p>
          </div>
        </div>

        {/* Syllabus Progress */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">সিলেবাস কভার</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {completedCount} <span className="text-sm font-semibold text-slate-400">/ {totalTopics}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Streak & Score */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">স্টাডি স্ট্রিক ও পয়েন্ট</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {currentUser.score} <span className="text-sm font-semibold text-slate-400">pts</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              🔥 টানা {currentUser.currentStreak || 1} দিন পড়াশোনায় নিয়মিত
            </p>
          </div>
        </div>

        {/* Error Notebook Count */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ভুল খাতা (Error Log)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {errorCount} <span className="text-sm font-semibold text-slate-400">টি ভুল</span>
            </div>
            <button
              onClick={() => onNavigate('errors')}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium mt-1 flex items-center gap-1"
            >
              এখনই রিভিশন দিন <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 New Job Preparation Power Tools */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>চাকরি প্রস্তুতি পাওয়ার টুলস (Job Prep Suite)</span>
            </h3>
            <p className="text-xs text-slate-500">
              ১১-২০তম গ্রেড, প্রাইমারি সহকারী শিক্ষক, NTRCA ও ব্যাংক প্রস্তুতিকে আরও নিখুঁত করার পাওয়ার ফিচারসমূহ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('planner')}
            className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-900/40 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">কাউন্টডাউন ও রুটিন</div>
            <div className="text-[10px] text-slate-500 mt-0.5">প্রাইমারি, NTRCA ও অডিটর</div>
          </button>

          <button
            onClick={() => onNavigate('pastPapers')}
            className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-100 dark:border-amber-900/40 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-105 transition">
              <History className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">বিগত প্রশ্ন ব্যাংক</div>
            <div className="text-[10px] text-slate-500 mt-0.5">১১-২০ গ্রেড, প্রাইমারি, NTRCA</div>
          </button>

          <button
            onClick={() => onNavigate('customQuiz')}
            className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 border border-violet-100 dark:border-violet-900/40 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-105 transition">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">কাস্টম টেস্ট মেকার</div>
            <div className="text-[10px] text-slate-500 mt-0.5">নিজের ইচ্ছেমতো পরীক্ষা দিন</div>
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-900/40 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-105 transition">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">লিডারবোর্ড ও ব্যাজ</div>
            <div className="text-[10px] text-slate-500 mt-0.5">সাপ্তাহিক টপ ১০ র‍্যাংক</div>
          </button>

          <button
            onClick={() => onNavigate('formulaVault')}
            className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-100 dark:border-rose-900/40 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-105 transition">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">শর্টকাট চিট-শীট</div>
            <div className="text-[10px] text-slate-500 mt-0.5">ঐকিক নিয়ম, সমাস ও সন্ধি</div>
          </button>

          <button
            onClick={() => onNavigate('vocabulary')}
            className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-100 dark:border-sky-900/40 text-left transition group"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm mb-2 group-hover:scale-105 transition">
              <BookMarked className="w-5 h-5" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">সম্পাদকীয় ভোকাবুলারি</div>
            <div className="text-[10px] text-slate-500 mt-0.5">ডেইলি স্টার ফ্ল্যাশকার্ড</div>
          </button>
        </div>
      </div>

      {/* Main Content 2-Column: Live GK & Quick Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live GK Feed & High-Yield Topics */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live GK Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  আজকের লাইভ জিকে ও কারেন্ট অ্যাফেয়ার্স
                </h3>
              </div>
              <button
                onClick={() => onNavigate('current')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                সবগুলো দেখুন <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {latestGK.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.date}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mt-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Topics for Today */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>আজকের গুরুত্বপূর্ণ চ্যাপ্টার (১১-২০ গ্রেড, প্রাইমারি ও শিক্ষক নিবন্ধন)</span>
              </h3>
              <button
                onClick={() => onNavigate('syllabus')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>সকল চ্যাপ্টার ও লিখিত সমাধান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {syllabus.slice(0, 4).map((item) => {
                const isDone = currentUser.completedTopics.includes(`${item.subject}|${item.topic}`);
                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenTopic(item.subject, item.topic)}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 hover:shadow-xs cursor-pointer transition bg-white dark:bg-slate-800/60 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      {isDone ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          সম্পন্ন ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                          বাকি
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mt-1">
                      {item.topic}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {item.keySummary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Launch Actions & Focus Room Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Launch Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
              কুইক স্টাডি টুলস
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('exams')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      ওএমআর মক টেস্ট
                    </div>
                    <div className="text-xs text-slate-500">নেগেটিভ মার্কিং সহ প্র্যাকটিস</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </button>

              <button
                onClick={() => onNavigate('viva')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-slate-200/60 dark:border-slate-800 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                      এআই ভাইভা সিমুলেটর
                    </div>
                    <div className="text-xs text-slate-500">মৌখিক পরীক্ষার তাৎক্ষণিক স্কোর</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition" />
              </button>

              <button
                onClick={() => onNavigate('challenge')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-800 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      ডেইলি চ্যালেঞ্জ এরিনা
                    </div>
                    <div className="text-xs text-slate-500">আজকের ২০ পয়েন্ট আর্ন করুন</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </button>
            </div>
          </div>

          {/* Daily Motivational Quote */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-slate-800/80 dark:to-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-slate-800 p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              আজকের অনুপ্রেরণা 🌟
            </span>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">
              "{dailyQuote.quote}"
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">
              — {dailyQuote.author}
            </p>
          </div>

          {/* Focus World Live Peer Widget */}
          <div 
            onClick={() => onNavigate('focusRoom')}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-indigo-400 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">ফোকাস স্টাডি ওয়ার্ল্ড</span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                ৪৫ জন লাইভ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              অন্যান্য প্রার্থীদের সাথে ভার্চুয়াল লাইব্রেরিতে বসে একত্রে ফোকাস করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Home, 
  Lightbulb, 
  Timer, 
  Bot, 
  BookOpen, 
  Sparkles, 
  Mic, 
  Headphones, 
  Users, 
  Zap, 
  Target, 
  FileCheck2, 
  Repeat, 
  AlertOctagon, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  GraduationCap,
  X,
  Crown,
  ShieldCheck,
  History,
  Sliders,
  Trophy,
  BookMarked,
  Calendar
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserProfile;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  errorCount: number;
  revisionCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isDark,
  onToggleDark,
  isOpenMobile,
  onCloseMobile,
  errorCount,
  revisionCount,
}) => {
  const isSuperAdmin = currentUser.role === 'superadmin';

  const baseNavItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home, badge: null },
    { id: 'planner', label: 'প্রাইমারি ও চাকরি কাউন্টডাউন', icon: Calendar, badge: 'Target' },
    { id: 'pastPapers', label: '১১-২০ গ্রেড ও বিগত প্রশ্ন ব্যাংক', icon: History, badge: 'DPE/NTRCA', badgeColor: 'bg-emerald-600' },
    { id: 'customQuiz', label: 'কাস্টম স্পিড টেস্ট মেকার', icon: Sliders, badge: 'New' },
    { id: 'leaderboard', label: 'সাপ্তাহিক লিডারবোর্ড ও ব্যাজ', icon: Trophy, badge: 'Rank' },
    { id: 'formulaVault', label: 'শর্টকাট সূত্র ও চিট-শীট ভল্ট', icon: Lightbulb, badge: 'Hot' },
    { id: 'vocabulary', label: 'সম্পাদকীয় ভোকাবুলারি ব্যাংক', icon: BookMarked, badge: 'Daily' },
    { id: 'conceptExplainer', label: 'AI Concept Clarifier', icon: Sparkles, badge: 'AI' },
    { id: 'pomodoro', label: 'Pomodoro Timer', icon: Timer, badge: null },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, badge: 'Smart' },
    { id: 'syllabus', label: 'অধ্যায়ভিত্তিক লিখিত ও MCQ', icon: BookOpen, badge: 'Full Hub', badgeColor: 'bg-emerald-600' },
    { id: 'current', label: 'AI Live GK & Affairs', icon: Sparkles, badge: 'Live' },
    { id: 'viva', label: 'AI Viva Simulator', icon: Mic, badge: 'Voice' },
    { id: 'podcast', label: 'Audio Podcast', icon: Headphones, badge: null },
    { id: 'focusRoom', label: 'Focus World (Live)', icon: Users, badge: 'Active' },
    { id: 'challenge', label: 'Daily Challenge', icon: Zap, badge: '20pts' },
    { id: 'eligibility', label: 'Job Eligibility Check', icon: Target, badge: null },
    { id: 'exams', label: 'Mock Tests & OMR', icon: FileCheck2, badge: 'OMR' },
    { id: 'revision', label: 'Revision Queue', icon: Repeat, badge: revisionCount > 0 ? String(revisionCount) : null },
    { id: 'errors', label: 'Error Log', icon: AlertOctagon, badge: errorCount > 0 ? String(errorCount) : null, badgeColor: 'bg-rose-500' },
    { id: 'settings', label: 'Cloud & Settings', icon: Settings, badge: null },
  ];

  const superAdminItem = {
    id: 'superAdmin',
    label: 'Super Admin Control Room',
    icon: ShieldCheck,
    badge: '👑 Master',
    badgeColor: 'bg-amber-500',
  };

  const navItems = isSuperAdmin ? [superAdminItem, ...baseNavItems] : baseNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-xl">
              প
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">পাঠশালা</span>
                <span className={`text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-sm border ${
                  isSuperAdmin 
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                }`}>
                  {isSuperAdmin ? '👑 SUPER ADMIN' : 'PRO AI'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[130px] flex items-center gap-1">
                {isSuperAdmin && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                <span>{currentUser.name || 'শিক্ষার্থী'}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Stat Pill */}
        <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
              {currentUser.targetExam || '৪৭তম বিসিএস'}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {currentUser.studyMinutes} মি.
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.badgeColor 
                        ? `${item.badgeColor} text-white` 
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDark}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={onLogout}
              title="লগআউট বা প্রোফাইল পরিবর্তন"
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

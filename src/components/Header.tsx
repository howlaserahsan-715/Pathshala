import React from 'react';
import { Menu, Flame, Star, Clock, User, Bell, Crown, ShieldCheck, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentUser: UserProfile;
  onOpenMobileSidebar: () => void;
  onOpenProfileModal: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentUser,
  onOpenMobileSidebar,
  onOpenProfileModal,
  isDark = false,
  onToggleDark,
}) => {
  const isSuperAdmin = currentUser.role === 'superadmin';

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>
              {isSuperAdmin && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[10px] border border-amber-300 dark:border-amber-800">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span>SUPER ADMIN</span>
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Gamification Badges & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{currentUser.currentStreak || 1} দিন</span>
          </div>

          {/* Points */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
            <span>{currentUser.score} pts</span>
          </div>

          {/* Study Minutes */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{currentUser.studyMinutes} মিনিট</span>
          </div>

          {/* Dark / Light Mode Toggle Button */}
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              className="p-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              )}
            </button>
          )}

          {/* User Profile Switcher */}
          <button
            onClick={onOpenProfileModal}
            className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border transition ${
              isSuperAdmin
                ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
              isSuperAdmin
                ? 'bg-gradient-to-tr from-amber-500 to-amber-700'
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600'
            }`}>
              {isSuperAdmin ? <Crown className="w-3.5 h-3.5" /> : (currentUser.name ? currentUser.name[0] : 'প')}
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:inline max-w-[110px] truncate">
              {currentUser.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

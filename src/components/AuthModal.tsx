import React, { useState } from 'react';
import {
  User,
  LogIn,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  X,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthed: (user: UserProfile) => void;
  canClose?: boolean;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthed,
  canClose = true,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetExam, setTargetExam] = useState('৪৭তম বিসিএস (প্রশাসন)');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetMessages();
    setPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('ইমেল এবং পাসওয়ার্ড প্রদান করা আবশ্যক।');
      return;
    }
    setBusy(true);
    try {
      const result = await api.login(cleanEmail, password);
      onAuthed(result.user);
      onClose();
    } catch (error: any) {
      setErrorMessage(error?.message || 'লগইন ব্যর্থ হয়েছে।');
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanName || !password) {
      setErrorMessage('সবগুলো ঘর পূরণ করা আবশ্যক।');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি মেলেনি। পুনরায় চেক করুন।');
      return;
    }

    setBusy(true);
    try {
      const result = await api.register({
        name: cleanName,
        email: cleanEmail,
        password,
        targetExam,
      });
      onAuthed(result.user);
      onClose();
    } catch (error: any) {
      setErrorMessage(error?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    } finally {
      setBusy(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('আপনার নিবন্ধিত ইমেল ঠিকানা দিন।');
      return;
    }
    setBusy(true);
    try {
      const result = await api.requestReset(cleanEmail);
      setSuccessMessage(result.message);
    } catch (error: any) {
      setErrorMessage(error?.message || 'রিকোয়েস্ট পাঠানো যায়নি।');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 my-8">
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="উইন্ডো বন্ধ করুন"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30">
            প
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {mode === 'login' && 'পাঠশালা লগইন'}
            {mode === 'register' && 'নতুন একাউন্ট রেজিস্ট্রেশন'}
            {mode === 'forgot' && 'পাসওয়ার্ড রিসেট রিকোয়েস্ট'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' && 'আপনার নিবন্ধিত ইমেল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন'}
            {mode === 'register' && 'একবার রেজিস্ট্রেশন করলে সব ডিভাইসে স্টাডি ডেটা সিঙ্ক থাকবে'}
            {mode === 'forgot' && 'রিকোয়েস্ট পাঠালে সুপার এডমিন পাসওয়ার্ড রিসেট করে দেবেন'}
          </p>
        </div>

        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSwitchMode('login')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🔐 লগইন
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('register')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            📝 রেজিস্ট্রেশন
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('forgot')}
            className={`flex-1 py-2 rounded-xl transition text-center ${
              mode === 'forgot'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            🔑 রিসেট
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                ইমেল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="যেমন: rahim@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  পাসওয়ার্ড
                </label>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('forgot')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline py-1.5 px-1 -my-1.5 -mr-1"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড দিন"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{busy ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}</span>
            </button>

            <div className="text-center pt-2 text-xs text-slate-500">
              অ্যাকাউন্ট নেই?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                নতুন রেজিস্ট্রেশন করুন
              </button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                আপনার পুরো নাম
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রহিম আহমেদ"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                ইমেল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="যেমন: rahim@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                টার্গেট পরীক্ষা
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="৪৭তম বিসিএস (প্রশাসন)">৪৭তম বিসিএস (প্রশাসন)</option>
                  <option value="৪৭তম বিসিএস (পুলিশ)">৪৭তম বিসিএস (পুলিশ)</option>
                  <option value="বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)">বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)</option>
                  <option value="সম্মিলিত ব্যাংক সিনিয়র অফিসার">সম্মিলিত ব্যাংক সিনিয়র অফিসার</option>
                  <option value="প্রাথমিক সহকারী শিক্ষক নিয়োগ">প্রাথমিক সহকারী শিক্ষক নিয়োগ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                নতুন পাসওয়ার্ড (ন্যূনতম ৮ অক্ষর)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখান'}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="একই পাসওয়ার্ড আবার লিখুন"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{busy ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}</span>
            </button>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                প্রথম রেজিস্ট্রেশন করা অ্যাকাউন্টটি স্বয়ংক্রিয়ভাবে <b>সুপার এডমিন</b> হবে। বাকিরা শিক্ষার্থী হিসেবে যুক্ত হবেন।
              </span>
            </div>

            <div className="text-center pt-1 text-xs text-slate-500">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                লগইন করুন
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleRequestReset} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                নিবন্ধিত ইমেল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="যেমন: rahim@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                রিকোয়েস্ট সুপার এডমিনের প্যানেলে যাবে। তিনিই আপনার জন্য নতুন পাসওয়ার্ড সেট করে দেবেন — নিরাপত্তার জন্য কোনো পাসওয়ার্ড ইমেইলে পাঠানো হয় না।
              </p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>{busy ? 'পাঠানো হচ্ছে...' : 'রিসেট রিকোয়েস্ট পাঠান'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>লগইনে ফিরে যান</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

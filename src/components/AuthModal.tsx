import React, { useState } from 'react';
import { 
  User, 
  LogIn, 
  Sparkles, 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Crown, 
  ArrowLeft,
  Copy,
  Check,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (profile: UserProfile) => void;
  existingUsers: Record<string, UserProfile>;
  onRegisterUser: (profile: UserProfile) => void;
  onUpdateUserPassword: (email: string, newPass: string) => boolean;
  currentEmail: string;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  existingUsers,
  onRegisterUser,
  onUpdateUserPassword,
  currentEmail,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetExam, setTargetExam] = useState('৪৭তম বিসিএস (প্রশাসন)');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Flow States
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [copiedOTP, setCopiedOTP] = useState(false);

  // Feedback Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setForgotStep(1);
    setGeneratedOTP(null);
    setVerificationCode('');
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('ইমেল এবং পাসওয়ার্ড প্রদান করা আবশ্যক।');
      return;
    }

    const user = existingUsers[cleanEmail];
    if (!user) {
      setErrorMessage('এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নতুন রেজিস্ট্রেশন করুন।');
      return;
    }

    if (user.status === 'blocked') {
      setErrorMessage('আপনার অ্যাকাউন্টটি সাময়িকভাবে ব্লক করা হয়েছে। সুপার এডমিনের সাথে যোগাযোগ করুন।');
      return;
    }

    // Check password
    if (user.password && user.password !== password) {
      setErrorMessage('ভুল পাসওয়ার্ড! অনুগ্রহ করে সঠিক পাসওয়ার্ড দিন অথবা "পাসওয়ার্ড ভুলে গেছেন" লিংকে ক্লিক করুন।');
      return;
    }

    onLogin(user);
    onClose();
  };

  // 2. REGISTRATION HANDLER
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanName || !password) {
      setErrorMessage('সবগুলো ঘর পূরণ করা আবশ্যক।');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি মেলেনি। পুনরায় চেক করুন।');
      return;
    }

    if (existingUsers[cleanEmail]) {
      setErrorMessage('এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগইন করুন।');
      return;
    }

    // Auto promote master emails to Super Admin
    const isSuperAdminEmail = 
      cleanEmail === 'creativeteamoperation@gmail.com' || 
      cleanEmail === 'admin@pathsala.com';

    const newUser: UserProfile = {
      id: cleanEmail,
      email: cleanEmail,
      name: cleanName,
      password: password,
      role: isSuperAdminEmail ? 'superadmin' : 'student',
      targetExam: targetExam,
      studyMinutes: 0,
      currentStreak: 1,
      lastActiveDate: new Date().toISOString(),
      score: 100,
      completedTopics: [],
      bookmarkedTopics: [],
      registeredDate: new Date().toLocaleDateString('bn-BD'),
      status: 'active',
    };

    onRegisterUser(newUser);
    onLogin(newUser);
    onClose();
  };

  // 3. FORGOT PASSWORD - STEP 1: SEND OTP
  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('আপনার নিবন্ধিত ইমেল ঠিকানা দিন।');
      return;
    }

    const user = existingUsers[cleanEmail];
    if (!user) {
      setErrorMessage('এই ইমেইলে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি।');
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    setForgotStep(2);
    setSuccessMessage(`ভেরিফিকেশন কোড পাঠানো হয়েছে!`);
  };

  // 4. FORGOT PASSWORD - STEP 2: VERIFY & RESET
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const cleanEmail = email.trim().toLowerCase();

    if (verificationCode.trim() !== generatedOTP) {
      setErrorMessage('ভেরিফিকেশন কোডটি সঠিক নয়! দয়া করে ৬ ডিজিটের কোডটি সঠিক লিখুন।');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('নতুন পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
      return;
    }

    const success = onUpdateUserPassword(cleanEmail, newPassword);
    if (success) {
      setSuccessMessage('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।');
      setTimeout(() => {
        handleSwitchMode('login');
        setPassword(newPassword);
      }, 1500);
    } else {
      setErrorMessage('পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  // 5. ONE-CLICK SUPER ADMIN DIRECT LOGIN
  const handleDirectSuperAdmin = (adminEmail: string) => {
    const adminUser = existingUsers[adminEmail];
    if (adminUser) {
      onLogin(adminUser);
      onClose();
    } else {
      // Auto-create super admin if not present
      const defaultAdmin: UserProfile = {
        id: adminEmail,
        email: adminEmail,
        name: adminEmail.includes('creative') ? 'সুপার এডমিন (Creative Team)' : 'প্রধান সুপার এডমিন',
        password: 'Admin@123456',
        role: 'superadmin',
        targetExam: '৪৭তম বিসিএস (সুপার এডমিন কন্ট্রোল)',
        studyMinutes: 120,
        currentStreak: 7,
        lastActiveDate: new Date().toISOString(),
        score: 500,
        completedTopics: ['বাংলা ভাষা ও সাহিত্য|সমাস নির্ণয় ও নিয়মাবলী', 'বাংলাদেশ বিষয়াবলী|বাংলাদেশের সংবিধান: মূল অনুচ্ছেদ ও সংশোধনী'],
        bookmarkedTopics: [],
        registeredDate: new Date().toLocaleDateString('bn-BD'),
        status: 'active',
      };
      onRegisterUser(defaultAdmin);
      onLogin(defaultAdmin);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="উইন্ডো বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30">
            প
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {mode === 'login' && 'পাঠশালা লগইন'}
            {mode === 'register' && 'নতুন একাউন্ট রেজিস্ট্রেশন'}
            {mode === 'forgot' && 'পাসওয়ার্ড পুনরুদ্ধার (Forgot Password)'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' && 'আপনার নিবন্ধিত ইমেল ও পাসওয়ার্ড দিয়ে প্রবেশ করুন'}
            {mode === 'register' && 'একবার রেজিস্ট্রেশন করে আজীবন স্টাডি ডেটা সুরক্ষিত রাখুন'}
            {mode === 'forgot' && 'নিবন্ধিত ইমেইলের মাধ্যমে সহজে নতুন পাসওয়ার্ড সেট করুন'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
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
            🔑 ফরগট পাসওয়ার্ড
          </button>
        </div>

        {/* Error / Success Feedback */}
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

        {/* ----------------- MODE 1: LOGIN ----------------- */}
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
                  পাসওয়ার্ড
                </label>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('forgot')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার পাসওয়ার্ড দিন"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>লগইন করুন</span>
            </button>

            {/* Quick Switch to Register */}
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

            {/* Quick Super Admin Direct Access Highlight */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                👑 সুপার এডমিন অ্যাক্সেস (Super Admin Access)
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleDirectSuperAdmin('creativeteamoperation@gmail.com')}
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-200 dark:border-amber-900/60 hover:border-amber-400 transition text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        সুপার এডমিন লগইন (creativeteamoperation@gmail.com)
                      </div>
                      <div className="text-[10px] text-slate-500">পাসওয়ার্ড: Admin@123456 (১-ক্লিকে সরাসরি লগইন)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                    প্রবেশ
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectSuperAdmin('admin@pathsala.com')}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-left flex items-center justify-between text-xs"
                >
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    বিকল্প এডমিন: <b>admin@pathsala.com</b> (Admin@123456)
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold">লগইন</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ----------------- MODE 2: REGISTRATION ----------------- */}
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
                  <option value="সম্মিলিত ব্যাংক সিনিয়র অফিসার">সম্মিলিত ব্যাংক সিনিয়র অফিসার</option>
                  <option value="প্রাথমিক সহকারী শিক্ষক নিয়োগ">প্রাথমিক সহকারী শিক্ষক নিয়োগ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                নতুন পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="একই পাসওয়ার্ড আবার লিখুন"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>রেজিস্ট্রেশন সম্পন্ন করুন</span>
            </button>

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

        {/* ----------------- MODE 3: FORGOT PASSWORD ----------------- */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {forgotStep === 1 ? (
              /* Step 1: Input Email to receive code */
              <form onSubmit={handleSendOTP} className="space-y-3.5">
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
                  <p className="text-[11px] text-slate-500 mt-1">
                    এই ইমেইলে একটি ৬ ডিজিটের ভেরিফিকেশন ওটিপি পাঠানো হবে।
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>ভেরিফিকেশন কোড পাঠান</span>
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
            ) : (
              /* Step 2: Enter Verification Code & New Password */
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {/* Simulated Email Delivery Card */}
                {generatedOTP && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        ইনবক্স সিমুলেশন ({email}):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setVerificationCode(generatedOTP);
                          setCopiedOTP(true);
                          setTimeout(() => setCopiedOTP(false), 2000);
                        }}
                        className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        {copiedOTP ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedOTP ? 'অটো-ফিল্ড হয়েছে' : 'কোড পেস্ট করুন'}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-indigo-200/80 font-mono text-base font-black tracking-widest text-indigo-600 text-center">
                      <span className="w-full">{generatedOTP}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center">
                      (আপনার নিরাপত্তার জন্য কোডটি স্ক্রিনেও প্রদর্শিত হয়েছে)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    ৬ ডিজিটের ভেরিফিকেশন কোড
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="যেমন: 123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold text-center tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    নতুন পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড দিন"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>নতুন পাসওয়ার্ড সেভ করুন ও লগইন করুন</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-slate-500 hover:underline"
                  >
                    ← অন্য ইমেল চেষ্টা করুন
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

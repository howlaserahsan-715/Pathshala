import React, { useState } from 'react';
import {
  Cloud,
  FileDown,
  RotateCcw,
  Check,
  ShieldCheck,
  User,
  GraduationCap,
  Mail,
  KeyRound,
  Loader2,
  Database,
  Smartphone,
  BadgeCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface CloudSettingsProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetAllData: () => void;
  completedTopicsCount: number;
}

export const CloudSettings: React.FC<CloudSettingsProps> = ({
  currentUser,
  onUpdateProfile,
  onResetAllData,
  completedTopicsCount,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [targetExam, setTargetExam] = useState(currentUser.targetExam);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name: name.trim() || currentUser.name, targetExam: targetExam.trim() });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড দুটি মেলেনি।' });
      return;
    }
    setPasswordBusy(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'ok', text: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: currentUser,
      completedTopicsCount,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pathshala-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Cloud status */}
      <div className="rounded-3xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow-lg shadow-emerald-600/30">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              ক্লাউড সিঙ্ক সক্রিয়
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              আপনার প্রোফাইল, স্টাডি টাইম, ভুল খাতা ও রিভিশন কিউ Cloudflare D1 ডেটাবেসে সংরক্ষিত।
              যেকোনো ডিভাইসে একই ইমেইলে লগইন করলেই সব ডেটা ফিরে পাবেন।
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> এনক্রিপ্টেড পাসওয়ার্ড (PBKDF2)
              </span>
              <span className="inline-flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> D1 ডেটাবেস
              </span>
              <span className="inline-flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> মাল্টি-ডিভাইস
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Profile */}
        <form
          onSubmit={handleSaveProfile}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> প্রোফাইল তথ্য
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">ইমেইল (পরিবর্তনযোগ্য নয়)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={currentUser.email}
                readOnly
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">পুরো নাম</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">টার্গেট পরীক্ষা</label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {profileSaved ? <Check className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
            {profileSaved ? 'ক্লাউডে সেভ হয়েছে' : 'প্রোফাইল সেভ করুন'}
          </button>
        </form>

        {/* Password */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-3"
        >
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-600" /> পাসওয়ার্ড পরিবর্তন
          </h3>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="বর্তমান পাসওয়ার্ড"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="নতুন পাসওয়ার্ড (ন্যূনতম ৮ অক্ষর)"
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
            required
            autoComplete="new-password"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {passwordMessage && (
            <p
              className={`text-[11px] font-semibold ${
                passwordMessage.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {passwordMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordBusy}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {passwordBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            পাসওয়ার্ড আপডেট করুন
          </button>
        </form>
      </div>

      {/* Data tools */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-600" /> ডেটা ও ডিভাইস
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">স্টাডি টাইম</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">
              {Math.floor(currentUser.studyMinutes / 60)}ঘ {currentUser.studyMinutes % 60}মি
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">সম্পন্ন টপিক</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">{completedTopicsCount}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">স্কোর</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">{currentUser.score}</div>
          </div>
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">স্ট্রিক</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">{currentUser.currentStreak} দিন</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExportJson}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <FileDown className="w-4 h-4" /> ব্যাকআপ ডাউনলোড (JSON)
          </button>
          <button
            onClick={() => {
              if (confirm('শুধু এই ডিভাইসের লোকাল ক্যাশ মুছে যাবে। ক্লাউড ডেটা অক্ষত থাকবে। চালিয়ে যাবেন?')) {
                onResetAllData();
              }
            }}
            className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" /> ডিভাইস ক্যাশ রিসেট
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          ডিভাইস ক্যাশ রিসেট করলে শুধু এই ব্রাউজারের লোকাল সেটিংস মুছে যাবে। আপনার অ্যাকাউন্ট ও স্টাডি ডেটা
          Cloudflare D1-এ সুরক্ষিত থাকবে — আবার লগইন করলেই ফিরে পাবেন।
        </p>
      </div>
    </div>
  );
};

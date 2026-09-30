import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Users, 
  UserCheck, 
  UserX, 
  KeyRound, 
  Trash2, 
  Plus, 
  FileCheck2, 
  Megaphone, 
  Sparkles, 
  Search, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Lock
} from 'lucide-react';
import { UserProfile, QuizQuestion, PlatformAnnouncement, SubjectType } from '../types';

interface SuperAdminPanelProps {
  currentUser: UserProfile;
  allUsers: Record<string, UserProfile>;
  onUpdateUserRole: (email: string, newRole: 'student' | 'superadmin') => void;
  onUpdateUserStatus: (email: string, newStatus: 'active' | 'blocked') => void;
  onAdminResetPassword: (email: string, tempPass: string) => void;
  onDeleteUser: (email: string) => void;
  mockQuestions: QuizQuestion[];
  onAddQuestion: (q: QuizQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  announcements: PlatformAnnouncement[];
  onAddAnnouncement: (a: PlatformAnnouncement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  currentUser,
  allUsers,
  onUpdateUserRole,
  onUpdateUserStatus,
  onAdminResetPassword,
  onDeleteUser,
  mockQuestions,
  onAddQuestion,
  onDeleteQuestion,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'questions' | 'announcements' | 'guide'>('users');
  const [userSearch, setUserSearch] = useState('');

  // New Question Form state
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [qSubject, setQSubject] = useState<SubjectType>('বাংলা ভাষা ও সাহিত্য');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [qExplanation, setQExplanation] = useState('');

  // New Announcement Form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [isNoticeImportant, setIsNoticeImportant] = useState(false);

  // Password reset prompt state
  const [resettingUserEmail, setResettingUserEmail] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('Pass@123456');

  const usersList = Object.values(allUsers);
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Platform KPIs
  const totalUsers = usersList.length;
  const totalAdmins = usersList.filter((u) => u.role === 'superadmin').length;
  const totalStudyMinutes = usersList.reduce((acc, u) => acc + (u.studyMinutes || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || qOptions.some((o) => !o.trim())) {
      alert('প্রশ্নের টেক্সট এবং ৪টি অপশন পূরণ করা আবশ্যক!');
      return;
    }

    const newQ: QuizQuestion = {
      id: `q-custom-${Date.now()}`,
      subject: qSubject,
      question: qText.trim(),
      options: qOptions.map((o) => o.trim()),
      correctIndex: qCorrectIndex,
      explanation: qExplanation.trim() || 'সঠিক উত্তর দেওয়া হয়েছে।',
      difficulty: 'Medium',
    };

    onAddQuestion(newQ);
    setQText('');
    setQOptions(['', '', '', '']);
    setQExplanation('');
    setShowAddQuestion(false);
    alert('নতুন প্রশ্ন সফলভাবে প্রশ্ন ব্যাংকে যুক্ত হয়েছে! ✓');
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;

    const newA: PlatformAnnouncement = {
      id: `ann-${Date.now()}`,
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
      date: new Date().toLocaleDateString('bn-BD'),
      author: currentUser.name || 'সুপার এডমিন',
      isImportant: isNoticeImportant,
    };

    onAddAnnouncement(newA);
    setNoticeTitle('');
    setNoticeMessage('');
    alert('নোটিশ সফলভাবে সকল শিক্ষার্থীর ড্যাশবোর্ডে প্রকাশিত হয়েছে! ✓');
  };

  const handleConfirmResetPassword = (email: string) => {
    onAdminResetPassword(email, tempPassword);
    alert(`${email} এর পাসওয়ার্ড রিসেট করে "${tempPassword}" সেট করা হয়েছে!`);
    setResettingUserEmail(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Super Admin Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>সুপার এডমিন কন্ট্রোল রুম (Super Admin Control Room)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              পাঠশালা মাস্টার কন্ট্রোল প্যানেল
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              ইউজার ম্যানেজমেন্ট, পাসওয়ার্ড রিসেট, রোল পরিবর্তন, প্রশ্ন ব্যাংক ও নোটিশ পাবলিশিং
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">অ্যাক্সেস করেছেন:</span>
            <span className="px-3 py-1 rounded-xl bg-white/10 text-amber-300 border border-white/10 text-xs font-bold">
              {currentUser.email}
            </span>
          </div>
        </div>

        {/* Abstract Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>মোট নিবন্ধিত ইউজার</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalUsers} <span className="text-xs font-normal text-slate-400">জন</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>সুপার এডমিন সংখ্যা</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {totalAdmins} <span className="text-xs font-normal text-slate-400">জন</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>মোট স্টাডি আওয়ার্স</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalStudyHours} <span className="text-xs font-normal text-slate-400">ঘণ্টা</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>মক টেস্ট প্রশ্ন ব্যাংক</span>
            <FileCheck2 className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-violet-600 dark:text-violet-400 mt-2">
            {mockQuestions.length} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-sm font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ইউজার ম্যানেজমেন্ট ({totalUsers})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>প্রশ্ন ব্যাংক ম্যানেজমেন্ট ({mockQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>লাইভ নোটিশ বোর্ড ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>এডমিন অ্যাক্সেস গাইড</span>
        </button>
      </div>

      {/* ---------------- SUB-TAB 1: USER MANAGEMENT ---------------- */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              নিবন্ধিত শিক্ষার্থী ও ইউজার তালিকা
            </h3>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 px-3">ব্যবহারকারী</th>
                  <th className="pb-3 px-3">টার্গেট পরীক্ষা</th>
                  <th className="pb-3 px-3">রোল (Role)</th>
                  <th className="pb-3 px-3">স্টাডি মিনিট</th>
                  <th className="pb-3 px-3">পাসওয়ার্ড</th>
                  <th className="pb-3 px-3">স্ট্যাটাস</th>
                  <th className="pb-3 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isCurrent = u.email === currentUser.email;
                  const isSuper = u.role === 'superadmin';
                  return (
                    <tr key={u.email} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isCurrent && <span className="text-[10px] text-indigo-600 font-semibold">(আপনি)</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {u.targetExam}
                      </td>

                      <td className="py-3 px-3">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                            <Crown className="w-3 h-3" /> সুপার এডমিন
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                            শিক্ষার্থী
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {u.studyMinutes} মি. ({u.score} pts)
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {u.password ? '••••••••' : 'ডিফল্ট'}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          u.status === 'blocked'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        }`}>
                          {u.status === 'blocked' ? 'ব্লকড' : 'সক্রিয়'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Toggle */}
                          {!isCurrent && (
                            <button
                              onClick={() => onUpdateUserRole(u.email, isSuper ? 'student' : 'superadmin')}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                isSuper
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 hover:bg-amber-200'
                              }`}
                              title={isSuper ? 'শিক্ষার্থী করুন' : 'সুপার এডমিন করুন'}
                            >
                              {isSuper ? 'সাধারণ ইউজার' : '👑 এডমিন বানান'}
                            </button>
                          )}

                          {/* Reset Password */}
                          <button
                            onClick={() => setResettingUserEmail(u.email)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-indigo-600 transition"
                            title="পাসওয়ার্ড রিসেট করুন"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Block/Unblock */}
                          {!isCurrent && (
                            <button
                              onClick={() => onUpdateUserStatus(u.email, u.status === 'blocked' ? 'active' : 'blocked')}
                              className={`p-1.5 rounded-lg transition ${
                                u.status === 'blocked'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              }`}
                              title={u.status === 'blocked' ? 'আনব্লক করুন' : 'ব্লক করুন'}
                            >
                              {u.status === 'blocked' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Delete */}
                          {!isCurrent && (
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিত যে "${u.name}" (${u.email})-কে মুছে ফেলতে চান?`)) {
                                  onDeleteUser(u.email);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                              title="ইউজার মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Reset Password Modal in Admin */}
          {resettingUserEmail && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <KeyRound className="w-4 h-4" />
                  <span>পাসওয়ার্ড পরিবর্তন করুন</span>
                </div>
                <p className="text-xs text-slate-500">
                  <b>{resettingUserEmail}</b> এর জন্য নতুন অস্থায়ী পাসওয়ার্ড সেট করুন:
                </p>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setResettingUserEmail(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => handleConfirmResetPassword(resettingUserEmail)}
                    className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    সেভ করুন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- SUB-TAB 2: QUESTION BANK MANAGEMENT ---------------- */}
      {activeTab === 'questions' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-600" />
                মক টেস্ট প্রশ্ন ব্যাংক ম্যানেজার ({mockQuestions.length} টি প্রশ্ন)
              </h3>
              <p className="text-xs text-slate-500">
                নতুন প্রশ্ন যুক্ত করুন বা বিদ্যমান প্রশ্নগুলোর তালিকা রিভিউ করুন
              </p>
            </div>

            <button
              onClick={() => setShowAddQuestion(!showAddQuestion)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddQuestion ? 'ফর্ম বন্ধ করুন' : 'নতুন প্রশ্ন যোগ করুন'}</span>
            </button>
          </div>

          {/* Add Question Form */}
          {showAddQuestion && (
            <form onSubmit={handleCreateQuestion} className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    বিষয় নির্বাচন
                  </label>
                  <select
                    value={qSubject}
                    onChange={(e) => setQSubject(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value="বাংলা ভাষা ও সাহিত্য">বাংলা ভাষা ও সাহিত্য</option>
                    <option value="English Language & Literature">English Language & Literature</option>
                    <option value="গাণিতিক যুক্তি ও মানসিক দক্ষতা">গাণিতিক যুক্তি ও মানসিক দক্ষতা</option>
                    <option value="বাংলাদেশ বিষয়াবলী">বাংলাদেশ বিষয়াবলী</option>
                    <option value="আন্তর্জাতিক বিষয়াবলী">আন্তর্জাতিক বিষয়াবলী</option>
                    <option value="সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি">সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correct Answer (Option)
                  </label>
                  <select
                    value={qCorrectIndex}
                    onChange={(e) => setQCorrectIndex(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  প্রশ্নটি লিখুন
                </label>
                <input
                  type="text"
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="যেমন: বাংলাদেশের প্রথম অস্থায়ী সরকার কোথায় শপথ নেয়?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {qOptions.map((opt, i) => (
                  <div key={i}>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Option {['A', 'B', 'C', 'D'][i]}
                    </label>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const copy = [...qOptions];
                        copy[i] = e.target.value;
                        setQOptions(copy);
                      }}
                      placeholder={`Enter Option ${['A', 'B', 'C', 'D'][i]}`}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ব্যাখ্যা ও রেফারেন্স
                </label>
                <textarea
                  rows={2}
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  placeholder="প্রশ্নের বিস্তারিত ব্যাখ্যা ও তথ্য..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestion(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  প্রশ্নটি যুক্ত করুন ✓
                </button>
              </div>
            </form>
          )}

          {/* Questions List */}
          <div className="space-y-3">
            {mockQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      #{idx + 1} - {q.subject}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {q.question}
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-1.5 rounded-lg border text-[11px] ${
                          oIdx === q.correctIndex
                            ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {['A', 'B', 'C', 'D'][oIdx]}) {opt}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 pt-1">
                    💡 <b>ব্যাখ্যা:</b> {q.explanation}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`প্রশ্ন #${idx + 1} মুছে ফেলবেন?`)) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition shrink-0"
                  title="প্রশ্ন মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 3: LIVE ANNOUNCEMENT BOARD ---------------- */}
      {activeTab === 'announcements' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-rose-500" />
              প্ল্যাটফর্ম সার্বজনীন নোটিশ ও নোটিফিকেশন ব্রডকাস্ট
            </h3>
            <p className="text-xs text-slate-500">
              এখান থেকে নোটিশ পোস্ট করলে তা সকল শিক্ষার্থীর ড্যাশবোর্ডে সাথে সাথে প্রদর্শিত হবে
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateAnnouncement} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                নোটিশ শিরোনাম
              </label>
              <input
                type="text"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="যেমন: আগামী শুক্রবার ৪৭তম বিসিএস গ্র্যান্ড মেগা মক টেস্ট অনুষ্ঠিত হবে!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                নোটিশের বিস্তারিত বিবরণ
              </label>
              <textarea
                rows={3}
                required
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="পরীক্ষার নিয়মাবলী, সময়সূচি বা বিশেষ দিকনির্দেশনা..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNoticeImportant}
                  onChange={(e) => setIsNoticeImportant(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                <span>জরুরি নোটিশ হিসেবে মার্ক করুন (লাল বর্ডার)</span>
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
              >
                নোটিশ প্রকাশ করুন 📢
              </button>
            </div>
          </form>

          {/* Current Notices */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              বর্তমান সক্রিয় নোটিশসমূহ:
            </h4>
            {announcements.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                  a.isImportant
                    ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      {a.title}
                    </h5>
                    {a.isImportant && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                        জরুরি
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {a.message}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-2">
                    পোস্ট করেছেন: {a.author} • {a.date}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteAnnouncement(a.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition shrink-0"
                  title="নোটিশ ডিলিট করুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 4: SUPER ADMIN GUIDE ---------------- */}
      {activeTab === 'guide' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>সুপার এডমিন অ্যাক্সেস নির্দেশিকা (Super Admin Guide)</span>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
              <h4 className="font-bold text-sm flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                পূর্বনির্ধারিত সুপার এডমিন ক্রেডেনশিয়াল (Default Super Admin Credentials):
              </h4>
              <p>১. <b>ইমেল:</b> <code className="bg-amber-200/60 dark:bg-amber-900 px-2 py-0.5 rounded">creativeteamoperation@gmail.com</code> বা <code className="bg-amber-200/60 dark:bg-amber-900 px-2 py-0.5 rounded">admin@pathsala.com</code></p>
              <p>২. <b>পাসওয়ার্ড:</b> <code className="bg-amber-200/60 dark:bg-amber-900 px-2 py-0.5 rounded">Admin@123456</code></p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                কীভাবে সুপার এডমিন অ্যাক্সেস পাবেন?
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>
                  <b>পদ্ধতি ১:</b> লগইন স্ক্রিনের নিচে দেওয়া <b>"সুপার এডমিন লগইন (creativeteamoperation@gmail.com)"</b> কার্ডটিতে ১-ক্লিকেই সরাসরি সুপার এডমিন হিসেবে প্রবেশ করতে পারেন।
                </li>
                <li>
                  <b>পদ্ধতি ২:</b> রেজিস্ট্রেশন করার সময় <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">creativeteamoperation@gmail.com</code> ইমেল ব্যবহার করলে স্বয়ংক্রিয়ভাবে সুপার এডমিন অধিকার অর্পিত হয়।
                </li>
                <li>
                  <b>পদ্ধতি ৩:</b> একজন সুপার এডমিন এই প্যানেলের <b>"ইউজার ম্যানেজমেন্ট"</b> ট্যাব থেকে যেকোনো শিক্ষার্থীর নামের পাশে থাকা <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">এডমিন বানান</code> বাটনে ক্লিক করে তাকেও সুপার এডমিন হিসেবে উন্নীত করতে পারেন।
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                পাসওয়ার্ড ভুলে গেলে করণীয়:
              </h4>
              <p className="text-slate-600 dark:text-slate-300">
                লগইন উইন্ডোতে থাকা <b>"পাসওয়ার্ড ভুলে গেছেন?"</b> বাটনে চাপ দিয়ে নিবন্ধিত ইমেল প্রদান করলে তাৎক্ষণিক ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোডের মাধ্যমে যে কেউ নিরাপদে নতুন পাসওয়ার্ড রিসেট করতে পারবেন। এছাড়াও সুপার এডমিন যেকোনো ইউজারের পাসওয়ার্ড এই কন্ট্রোল প্যানেল থেকে সরাসরি পরিবর্তন করে দিতে পারেন।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

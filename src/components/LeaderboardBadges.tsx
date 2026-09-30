import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Flame, 
  Star, 
  Clock, 
  Crown, 
  Award, 
  ShieldCheck, 
  Sparkles,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { UserProfile, LearnerPeer } from '../types';

interface LeaderboardBadgesProps {
  currentUser: UserProfile;
  allUsers: Record<string, UserProfile>;
  peers: LearnerPeer[];
}

export const LeaderboardBadges: React.FC<LeaderboardBadgesProps> = ({
  currentUser,
  allUsers,
  peers,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges'>('leaderboard');

  // Synthesize leaderboard list combining allUsers and peers
  const userList = Object.values(allUsers);
  const peerList = peers.map((p, i) => ({
    id: p.id,
    name: p.name,
    email: `${p.id}@pathsala.edu`,
    role: 'student' as const,
    targetExam: p.target,
    studyMinutes: p.minutesToday * 4 + (i * 35),
    currentStreak: (i % 5) + 3,
    lastActiveDate: 'Today',
    score: (p.minutesToday * 3) + (i * 45) + 210,
    completedTopics: [],
    bookmarkedTopics: [],
  }));

  const combined = [...userList, ...peerList];
  // Sort descending by score
  const sorted = combined.sort((a, b) => b.score - a.score);

  // Find user's rank
  const myRank = sorted.findIndex((u) => u.email === currentUser.email) + 1 || 1;

  // Achievement Badges definitions
  const badgesList = [
    {
      id: 'b-streak-7',
      title: '৭ দিনের স্টাডি স্ট্রিক',
      desc: 'টানা ৭ দিন পাঠশালায় প্রতিদিন পড়াশোনা করেছেন',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
      unlocked: currentUser.currentStreak >= 7,
      progress: Math.min(100, Math.round((currentUser.currentStreak / 7) * 100)),
      requirement: `${currentUser.currentStreak} / 7 দিন`,
    },
    {
      id: 'b-score-500',
      title: 'নলেজ চ্যাম্পিয়ন (৫০০+ পয়েন্ট)',
      desc: 'মডেল টেস্ট ও কুইজের মাধ্যমে ৫০০ এর বেশি পয়েন্ট অর্জন',
      icon: Trophy,
      color: 'from-yellow-400 to-amber-600',
      unlocked: currentUser.score >= 500,
      progress: Math.min(100, Math.round((currentUser.score / 500) * 100)),
      requirement: `${currentUser.score} / 500 pts`,
    },
    {
      id: 'b-focus-120',
      title: 'পোমোডোরো ফোকাস মনক',
      desc: '১২০ মিনিটের বেশি ফোকাসড পোমোডোরো সেশন সম্পন্ন',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      unlocked: currentUser.studyMinutes >= 120,
      progress: Math.min(100, Math.round((currentUser.studyMinutes / 120) * 100)),
      requirement: `${currentUser.studyMinutes} / 120 মিনিট`,
    },
    {
      id: 'b-syllabus-5',
      title: 'সিলেবাস ক্রাশার',
      desc: 'বিসিএস প্রিলিমিনারি সিলেবাসের ৫টি টপিক সম্পূর্ণ রিভিশন',
      icon: Award,
      color: 'from-indigo-500 to-violet-600',
      unlocked: currentUser.completedTopics.length >= 5,
      progress: Math.min(100, Math.round((currentUser.completedTopics.length / 5) * 100)),
      requirement: `${currentUser.completedTopics.length} / 5 টপিক`,
    },
    {
      id: 'b-super-aspirant',
      title: 'ক্যাডার ড্রিমার ব্যাজ',
      desc: 'পাঠশালা প্ল্যাটফর্মে নিয়মিত সক্রিয় ক্যাডার প্রত্যাশী',
      icon: Crown,
      color: 'from-pink-500 to-rose-600',
      unlocked: true,
      progress: 100,
      requirement: 'সম্পন্ন ✓',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>সাপ্তাহিক ক্যাডার লিডারবোর্ড ও সম্মাননা</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Cadre Leaderboard & Badges
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              আপনার পড়াশোনার গতি, স্ট্রিক ও মক টেস্ট স্কোরে সেরা শিক্ষার্থীদের সাথে সুস্থ প্রতিযোগিতা
            </p>
          </div>

          {/* Current User Snapshot Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
              #{myRank}
            </div>
            <div>
              <div className="text-xs text-slate-300">আপনার বর্তমান র‍্যাংক</div>
              <div className="text-base font-bold text-white">{currentUser.name}</div>
              <div className="text-xs text-amber-300 font-semibold">{currentUser.score} pts | {currentUser.studyMinutes} মিনিট</div>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="relative z-10 flex items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'leaderboard'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🏆 সাপ্তাহিক লিডারবোর্ড
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'badges'
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            🎖️ আপনার অর্জন ও ব্যাজ
          </button>
        </div>
      </div>

      {/* ----------------- TAB 1: LEADERBOARD ----------------- */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sorted.slice(0, 3).map((user, idx) => {
              const medalColors = [
                'from-amber-400 to-amber-600 border-amber-300', // 1st
                'from-slate-300 to-slate-400 border-slate-300', // 2nd
                'from-amber-600 to-amber-800 border-amber-700', // 3rd
              ];
              const medalTitles = ['🥇 প্রথম স্থান', '🥈 দ্বিতীয় স্থান', '🥉 তৃতীয় স্থান'];

              return (
                <div
                  key={user.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 text-center space-y-3 relative overflow-hidden shadow-xs ${
                    idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {medalTitles[idx]}
                  </div>

                  <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-black bg-gradient-to-tr ${medalColors[idx]} shadow-lg`}>
                    {user.name[0] || 'ক'}
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h4>
                    <p className="text-xs text-slate-400">{user.targetExam || '৪৭তম বিসিএস ক্যাডার'}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-indigo-600">
                      <Star className="w-3.5 h-3.5 fill-current" /> {user.score} pts
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Clock className="w-3.5 h-3.5" /> {user.studyMinutes} মি.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>টপ ১০ ক্যাডার প্রত্যাশী তালিকা</span>
              </h3>
              <span className="text-xs text-slate-400">প্রতি ঘণ্টায় স্বয়ংক্রিয়ভাবে আপডেট হয়</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">র‍্যাংক</th>
                    <th className="py-3 px-4">শিক্ষার্থীর নাম</th>
                    <th className="py-3 px-4">টার্গেট পরীক্ষা</th>
                    <th className="py-3 px-4">স্টাডি সময়</th>
                    <th className="py-3 px-4">স্ট্রিক</th>
                    <th className="py-3 px-4 text-right">মোট পয়েন্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sorted.slice(0, 10).map((u, i) => {
                    const isMe = u.email === currentUser.email;
                    return (
                      <tr
                        key={u.id}
                        className={`transition ${
                          isMe
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-black">
                          {i === 0 ? '🥇 #1' : i === 1 ? '🥈 #2' : i === 2 ? '🥉 #3' : `#${i + 1}`}
                        </td>
                        <td className="py-3.5 px-4 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {u.name[0]}
                          </span>
                          <span>{u.name}</span>
                          {isMe && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-800 text-[10px] font-bold">
                              আপনি
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{u.targetExam || '৪৭তম বিসিএস'}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{u.studyMinutes} মিনিট</td>
                        <td className="py-3.5 px-4 text-amber-600 font-bold">🔥 {u.currentStreak || 1} দিন</td>
                        <td className="py-3.5 px-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                          {u.score} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: BADGES GALLERY ----------------- */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgesList.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-6 space-y-4 shadow-xs relative transition ${
                  badge.unlocked
                    ? 'border-indigo-200 dark:border-indigo-900'
                    : 'border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    badge.unlocked
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}>
                    {badge.unlocked ? 'আনলকড ✓' : 'লকড 🔒'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {badge.desc}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>অগ্রগতি:</span>
                    <span>{badge.requirement}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

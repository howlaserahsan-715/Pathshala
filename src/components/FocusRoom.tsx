import React, { useState } from 'react';
import { 
  Users, 
  Send, 
  Flame, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  ThumbsUp,
  Award
} from 'lucide-react';
import { LearnerPeer, UserProfile } from '../types';

interface FocusRoomProps {
  currentUser: UserProfile;
  initialPeers: LearnerPeer[];
}

export const FocusRoom: React.FC<FocusRoomProps> = ({ currentUser, initialPeers }) => {
  const [peers, setPeers] = useState<LearnerPeer[]>(initialPeers);
  const [myTopic, setMyTopic] = useState('৪৭তম বিসিএস - সাধারণ জ্ঞান ও রিভিশন');
  const [feedMessages, setFeedMessages] = useState<string[]>([
    'তানভীর আহমেদ: আজ সমাস শেষ করলাম, আলহামদুলিল্লাহ!',
    'নুসরাত জাহান: ব্যাংক ম্যাথের সুদকষা চ্যাপ্টারটি সত্যিই অনেক ট্রিকি।',
    'মেহেদী হাসান: পোমোডোরো ৩ সেশন কমপ্লিট! সবাই চালিয়ে যান।'
  ]);
  const [chatInput, setChatInput] = useState('');
  const [cheerNotice, setCheerNotice] = useState<string | null>(null);

  const handleCheer = (peerName: string) => {
    setCheerNotice(`${peerName}-কে সাবাশ ও শুভকামনা জানিয়েছেন! 👏`);
    setTimeout(() => setCheerNotice(null), 3000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setFeedMessages([`${currentUser.name}: ${chatInput}`, ...feedMessages]);
    setChatInput('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>লাইভ ভার্চুয়াল স্টাডি রুম</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Focus World (Online Study Community)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              একসাথে পড়ার অনুপ্রেরণা — দেখুন অন্য চাকরিপ্রার্থীরা এখন কী পড়ছেন এবং পরস্পরকে উৎসাহ দিন
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {peers.length + 1} জন শিক্ষার্থী পড়াশোনায় সক্রিয়
            </span>
          </div>
        </div>

        {/* My Status Broadcaster */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-bold text-slate-500 shrink-0">
            আপনার বর্তমান পড়ার টপিক:
          </span>
          <input
            type="text"
            value={myTopic}
            onChange={(e) => setMyTopic(e.target.value)}
            placeholder="এখন আপনি কোন টপিক পড়ছেন লিখুন..."
            className="flex-1 w-full bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-1 rounded-md shrink-0">
            রিয়েল-টাইম শেয়ার্ড
          </span>
        </div>
      </div>

      {/* Cheer Toast Notice */}
      {cheerNotice && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl text-center text-xs font-bold shadow-md animate-fade-in">
          {cheerNotice}
        </div>
      )}

      {/* 2-Column: Peers Active Cards & Live Study Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Peer Desks */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            স্টাডি ডেস্কে সক্রিয় প্রার্থীরা
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* User's own active card */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border-2 border-indigo-400 dark:border-indigo-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.name ? currentUser.name[0] : 'প'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{currentUser.name} (আপনি)</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{currentUser.targetExam}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    পড়ছেন
                  </span>
                </div>

                <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                  📖 {myTopic}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-indigo-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                  <Clock className="w-3.5 h-3.5" /> {currentUser.studyMinutes} মিনিট আজ
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  ⭐ {currentUser.score} pts
                </span>
              </div>
            </div>

            {/* Other peers */}
            {peers.map((peer) => (
              <div
                key={peer.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base">
                        {peer.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {peer.name}
                        </div>
                        <div className="text-[11px] text-slate-500">{peer.target}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      peer.status === 'studying'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : peer.status === 'mock-exam'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}>
                      {peer.status === 'studying' ? 'পড়ছেন' : peer.status === 'mock-exam' ? 'মক টেস্ট' : 'বিরতি'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-1">
                    📖 {peer.currentTopic}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {peer.minutesToday} মি. আজ
                  </span>

                  <button
                    onClick={() => handleCheer(peer.name)}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-2 py-1 rounded-lg transition"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>সাবাশ! 👏</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Study Wall / Feed */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between h-[520px]">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              স্টাডি রুম লাইভ বোর্ড
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              শিক্ষার্থীদের স্টাডি আপডেট ও আলোচনা
            </p>

            <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
              {feedMessages.map((msg, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {msg}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="একটি স্টাডি আপডেট লিখুন..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
            />
            <button
              onClick={handleSendChat}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

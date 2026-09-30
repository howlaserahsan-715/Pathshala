import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  BookOpen, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Video, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface ConceptExplainerProps {
  initialSubject?: string;
  initialTopic?: string;
  onMarkComplete?: (subject: string, topic: string) => void;
  onOpenVideo?: (topic: string) => void;
  isTopicCompleted?: boolean;
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({
  initialSubject = 'বাংলা ভাষা ও সাহিত্য',
  initialTopic = 'সমাস নির্ণয় ও নিয়মাবলী',
  onMarkComplete,
  onOpenVideo,
  isTopicCompleted = false,
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [topic, setTopic] = useState(initialTopic);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const popularChips: Record<string, string[]> = {
    'বাংলা ভাষা ও সাহিত্য': ['সমাস নির্ণয়', 'কারক ও বিভক্তি', 'সন্ধি বিচ্ছেদ', 'বানান শুদ্ধি', 'চর্যাপদের পদকর্তা'],
    'English Language & Literature': ['Subject-Verb Agreement', 'Prepositions', 'Voice Change', 'Conditionals', 'Shakespearean Quotes'],
    'গাণিতিক যুক্তি ও মানসিক দক্ষতা': ['শতকরা ও লাভ-ক্ষতি', 'সুদকষা (I=Pnr)', 'বীজগণিতীয় সূত্রাবলী', 'ঘড়ির কাঁটার কোণ', 'ঐকিক নিয়ম'],
    'বাংলাদেশ বিষয়াবলী': ['সংবিধানের গুরুত্বপূর্ণ অনুচ্ছেদ', 'মুজিবনগর সরকার গঠন', 'মুক্তিযুদ্ধের ১১টি সেক্টর', 'অর্থনৈতিক সমীক্ষা'],
  };

  const handleGenerate = async (targetTopic = topic, targetSubject = subject) => {
    if (!targetTopic.trim()) return;
    setLoading(true);
    audioEngine.stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/ai/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: targetSubject, topic: targetTopic }),
      });
      const data = await res.json();
      setExplanation(data.explanation || 'কোনো ব্যাখ্যা পাওয়া যায়নি।');
    } catch (e) {
      setExplanation(`### 💡 ${targetTopic} এর সহজ ব্যাখ্যা\n\n১. **মৌলিক নিয়ম:** বিষয়টি পরীক্ষার জন্য অত্যন্ত স্পর্শকাতর। সূত্র ও নিয়মের ব্যতিক্রম অংশগুলো বেশি আসে।\n২. **শর্টকাট:** পরীক্ষার হলে অপশন বাদ দিয়ে উত্তর বের করুন।`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      audioEngine.stopSpeaking();
      setIsSpeaking(false);
    } else {
      if (!explanation) return;
      setIsSpeaking(true);
      audioEngine.speakBangla(
        explanation.slice(0, 1000),
        1.0,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2">
          <Lightbulb className="w-5 h-5" />
          <span>Daily Topic Concept Clarifier</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          আপনার প্রতিদিনের পড়ার টপিক ক্লিয়ার করুন
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          যেকোনো জটিল বা বিভ্রান্তিকর চ্যাপ্টারের নাম লিখুন — এআই আপনাকে সহজ ভাষায়, শর্টকাট কৌশল ও পরীক্ষার বাস্তব প্রশ্নসহ বুঝিয়ে দেবে।
        </p>

        {/* Input Controls */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              বিষয় নির্বাচন করুন
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="বাংলা ভাষা ও সাহিত্য">বাংলা ভাষা ও সাহিত্য</option>
              <option value="English Language & Literature">English Language & Literature</option>
              <option value="গাণিতিক যুক্তি ও মানসিক দক্ষতা">গাণিতিক যুক্তি ও মানসিক দক্ষতা</option>
              <option value="বাংলাদেশ বিষয়াবলী">বাংলাদেশ বিষয়াবলী</option>
              <option value="আন্তর্জাতিক বিষয়াবলী">আন্তর্জাতিক বিষয়াবলী</option>
              <option value="সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি">সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি</option>
            </select>
          </div>

          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              চ্যাপ্টার বা টপিকের নাম
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="যেমন: সমাস, শতকরা, Preposition, সংবিধানের অনুচ্ছেদ..."
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !topic.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>ব্যাখ্যা নিন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        {popularChips[subject] && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400">জনপ্রিয় টপিক:</span>
            {popularChips[subject].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setTopic(chip);
                  handleGenerate(chip, subject);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Explanation Output Area */}
      {explanation ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                {subject}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-500" />}
                <span>{isSpeaking ? 'থামান' : 'অডিও শুনুন'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'নোট কপি'}</span>
              </button>

              {onOpenVideo && (
                <button
                  onClick={() => onOpenVideo(topic)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold border border-red-200 dark:border-red-900 transition"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>ভিডিও লেসন</span>
                </button>
              )}

              {onMarkComplete && (
                <button
                  onClick={() => onMarkComplete(subject, topic)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isTopicCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isTopicCompleted ? 'সম্পন্ন ✓' : 'পড়া সম্পন্ন করুন'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Formatted Markdown Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
            {explanation}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            আজকের পড়ার টপিক ক্লিয়ার করতে উপরের বাটনে চাপ দিন
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            টপিকের নাম লিখে "ব্যাখ্যা নিন" বাটনে ক্লিক করুন অথবা জনপ্রিয় টপিকের চিপসে ট্যাপ করুন।
          </p>
        </div>
      )}
    </div>
  );
};

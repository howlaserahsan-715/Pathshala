import React, { useState } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Filter, 
  Clock, 
  RotateCcw, 
  Award,
  BookOpen,
  BookmarkPlus,
  Play,
  FileCheck2,
  GraduationCap,
  Briefcase,
  Building2,
  Landmark,
  Layers
} from 'lucide-react';
import { PastPaperQuestion, SubjectType, JobExamCategory } from '../types';
import { JOB_PAST_PAPERS } from '../data/pastPapersData';
import { audioEngine } from '../utils/audio';

interface PastBCSPapersProps {
  onAddToRevision?: (subject: string, topic: string) => void;
  onAddMissedToErrorLog?: (q: any, selectedOption: string) => void;
}

export const PastBCSPapers: React.FC<PastBCSPapersProps> = ({
  onAddToRevision,
  onAddMissedToErrorLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'practice' | 'exam'>('practice');

  // Practice Mode state: reveals answers per question
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, number>>({});

  // Exam Mode state
  const [examRunning, setExamRunning] = useState(false);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60);

  const categories: { id: string; label: string; icon: any; color: string }[] = [
    { id: 'all', label: 'সব পরীক্ষা', icon: Layers, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' },
    { id: '১১-২০তম গ্রেড সরকারি চাকরি', label: '🏛️ ১১-২০তম গ্রেড সরকারি চাকরি', icon: Briefcase, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
    { id: 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক', label: '🏫 প্রাথমিক শিক্ষক নিয়োগ (DPE)', icon: Building2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
    { id: 'NTRCA শিক্ষক নিবন্ধন', label: '🎓 NTRCA শিক্ষক নিবন্ধন', icon: GraduationCap, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950' },
    { id: 'ব্যাংক নিয়োগ পরীক্ষা', label: '🏦 ব্যাংক নিয়োগ (Officer & Cash)', icon: Landmark, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
    { id: 'বিসিএস প্রিলিমিনারি', label: '📜 বিসিএস ও পিএসসি', icon: History, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
  ];

  const filteredQuestions = JOB_PAST_PAPERS.filter((q) => {
    const matchCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchSubject = selectedSubject === 'all' || q.subject === selectedSubject;
    const matchSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.topic && q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSubject && matchSearch;
  });

  const handlePracticeSelect = (qId: string, optIdx: number) => {
    audioEngine.playTick();
    setRevealedAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
    }));
  };

  const isPrimary = selectedCategory === 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক';
  const negativeMarkValue = isPrimary ? 0.25 : 0.50;

  const handleStartExam = () => {
    setExamAnswers({});
    setTimeLeft(Math.min(60 * 60, Math.max(10 * 60, filteredQuestions.length * 75)));
    setExamRunning(true);
    setExamSubmitted(false);
    audioEngine.playTick();
  };

  const handleSubmitExam = () => {
    setExamRunning(false);
    setExamSubmitted(true);
    audioEngine.playChime(true);
  };

  // Exam Score calculation
  let correctCount = 0;
  let wrongCount = 0;
  filteredQuestions.forEach((q, idx) => {
    const ans = examAnswers[idx];
    if (ans !== undefined) {
      if (ans === q.correctIndex) {
        correctCount += 1;
      } else {
        wrongCount += 1;
        if (onAddMissedToErrorLog) {
          onAddMissedToErrorLog(q, q.options[ans]);
        }
      }
    }
  });
  const netScore = Math.max(0, correctCount * 1 - wrongCount * negativeMarkValue);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800">
            <History className="w-3.5 h-3.5" />
            <span>বিগত সরকারি চাকরি প্রশ্ন ব্যাংক ও মডেল টেস্ট</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            ১১-২০তম গ্রেড, প্রাইমারি শিক্ষক, NTRCA ও ব্যাংক প্রশ্ন ব্যাংক
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            অডিটর, অফিস সহকারী, প্রাইমারি সহকারী শিক্ষক, ১৮তম শিক্ষক নিবন্ধন ও ব্যাংক পরীক্ষার বিগত প্রশ্ন ও সমাধান
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => {
              setViewMode('practice');
              setExamRunning(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'practice'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📖 প্র্যাকটিস ও সমাধান
          </button>
          <button
            onClick={() => setViewMode('exam')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'exam'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ⏱️ বিগত পরীক্ষার ওএমআর মক টেস্ট
          </button>
        </div>
      </div>

      {/* Target Exam Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Subject Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">সকল বিষয় (All Subjects)</option>
              <option value="বাংলা ভাষা ও সাহিত্য">বাংলা ভাষা ও সাহিত্য</option>
              <option value="English Language & Literature">English Language & Literature</option>
              <option value="গাণিতিক যুক্তি ও মানসিক দক্ষতা">গাণিতিক যুক্তি ও মানসিক দক্ষতা</option>
              <option value="বাংলাদেশ বিষয়াবলী">বাংলাদেশ বিষয়াবলী</option>
              <option value="আন্তর্জাতিক বিষয়াবলী">আন্তর্জাতিক বিষয়াবলী</option>
              <option value="সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি">সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পরীক্ষার নাম, প্রশ্ন বা বিষয় দিয়ে সার্চ করুন (যেমন: প্রাথমিক শিক্ষক, অডিটর, সন্ধি, ঐকিক নিয়ম)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ----------------- MODE 1: PRACTICE MODE ----------------- */}
      {viewMode === 'practice' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
            <span>মোট প্রশ্ন পাওয়া গেছে: {filteredQuestions.length} টি</span>
            <span>সরাসরি অপশন সিলেক্ট করে সঠিক উত্তর ও ব্যাখ্যা দেখুন</span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি। অন্য ক্যাটাগরি বা বিষয় সিলেক্ট করুন।
              </p>
            </div>
          ) : (
            filteredQuestions.map((q, qIndex) => {
              const selectedOpt = revealedAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800">
                        {q.examTitle}
                      </span>
                      {q.gradeLevel && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-900">
                          {q.gradeLevel}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-500">
                        #{qIndex + 1} — {q.subject}
                      </span>
                    </div>

                    {q.topic && (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                        {q.topic}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Options with English Badges (A, B, C, D) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === optIdx;
                      const isThisCorrect = optIdx === q.correctIndex;

                      let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (isThisSelected) {
                          btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handlePracticeSelect(q.id, optIdx)}
                          className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl font-mono text-xs font-bold flex items-center justify-center bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 shrink-0">
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isAnswered && isThisCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isAnswered && isThisSelected && !isThisCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Solution & Explanation */}
                  {isAnswered && (
                    <div className="mt-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 text-xs sm:text-sm space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" />
                          সঠিক উত্তর: Option {['A', 'B', 'C', 'D'][q.correctIndex]} ({q.options[q.correctIndex]})
                        </span>

                        {onAddToRevision && (
                          <button
                            onClick={() => onAddToRevision(q.subject, q.topic || q.question.slice(0, 30))}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-900 text-indigo-600 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 flex items-center gap-1"
                          >
                            <BookmarkPlus className="w-3 h-3" />
                            <span>রিভিশনে রাখুন</span>
                          </button>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        💡 <b>ব্যাখ্যা ও পরীক্ষার শর্টকাট:</b> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ----------------- MODE 2: TIMED EXAM MODE ----------------- */}
      {viewMode === 'exam' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs">
          {!examRunning && !examSubmitted ? (
            <div className="text-center max-w-xl mx-auto space-y-6 py-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 mx-auto flex items-center justify-center">
                <FileCheck2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedCategory === 'all'
                    ? 'সরকারি চাকরি সমন্বিত বিগত সালের স্পিড টেস্ট'
                    : `${selectedCategory} বিগত সালের মডেল টেস্ট`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  মোট প্রশ্ন: {filteredQuestions.length} টি | সময়: {Math.round(filteredQuestions.length * 1.25)} মিনিট | নেগেটিভ মার্কিং: -{negativeMarkValue}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1.5 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-slate-200">পরীক্ষার অফিসিয়াল মানদণ্ড:</p>
                <p>১. প্রতিটি সঠিক উত্তরের জন্য পাবেন +১.০০ নম্বর।</p>
                <p>২. প্রতিটি ভুল উত্তরের জন্য {negativeMarkValue} নম্বর কাটা যাবে ({isPrimary ? 'প্রাথমিক শিক্ষক নিয়ম' : 'সাধারণ নিয়োগ নিয়ম'})।</p>
                <p>৩. ওএমআর বাবল শিটে সরাসরি A, B, C, D অপশনে ক্লিক করে উত্তর সাবমিট করুন।</p>
              </div>

              <button
                onClick={handleStartExam}
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition transform active:scale-95 flex items-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>মডেল টেস্ট শুরু করুন</span>
              </button>
            </div>
          ) : examRunning ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-black text-lg text-slate-900 dark:text-white">
                    {selectedCategory === 'all' ? 'সরকারি চাকরি বিগত প্রশ্ন পরীক্ষা' : selectedCategory}
                  </h4>
                  <p className="text-xs text-slate-400">
                    উত্তর দেওয়া হয়েছে: {Object.keys(examAnswers).length} / {filteredQuestions.length} টি
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-sm font-bold">
                  <Clock className="w-4 h-4 animate-pulse text-indigo-600" />
                  <span>সময় বাকি: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>

              {/* Questions List for Exam */}
              <div className="space-y-6">
                {filteredQuestions.map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>#{idx + 1} — {q.examTitle}</span>
                      <span className="text-indigo-600">{q.subject}</span>
                    </div>

                    <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {q.question}
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = examAnswers[idx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              audioEngine.playTick();
                              setExamAnswers((prev) => ({ ...prev, [idx]: optIdx }));
                            }}
                            className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition flex items-center gap-3 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center ${
                              isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                            }`}>
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSubmitExam}
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
                >
                  পরীক্ষা সাবমিট করুন ✓
                </button>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="space-y-6 text-center max-w-lg mx-auto py-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  মক টেস্ট ফলাফল
                </h3>
                <p className="text-3xl font-black text-indigo-600 mt-2">
                  নেট নম্বর: {netScore.toFixed(2)} / {filteredQuestions.length}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold">
                  সঠিক: {correctCount} টি (+{correctCount})
                </div>
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 font-bold">
                  ভুল: {wrongCount} টি (-{(wrongCount * negativeMarkValue).toFixed(2)})
                </div>
              </div>

              <button
                onClick={handleStartExam}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পুনরায় পরীক্ষা দিন</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

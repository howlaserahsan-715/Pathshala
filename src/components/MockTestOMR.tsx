import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCheck2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  Award, 
  AlertTriangle,
  BookmarkPlus
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { audioEngine } from '../utils/audio';

interface MockTestOMRProps {
  questions: QuizQuestion[];
  onTestCompleted: (score: number) => void;
  onAddMissedToErrorLog: (q: QuizQuestion, selectedOption: string) => void;
}

export const MockTestOMR: React.FC<MockTestOMRProps> = ({
  questions,
  onTestCompleted,
  onAddMissedToErrorLog,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<'primary' | 'ntrca' | 'grade11_20' | 'bank' | 'bcs'>('primary');
  const [isRunning, setIsRunning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const patternConfig = {
    primary: { title: 'প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ মডেল টেস্ট', negMark: 0.25, time: 15, grade: '১৩তম গ্রেড' },
    ntrca: { title: '১৮তম/১৯তম শিক্ষক নিবন্ধন (NTRCA) প্রিলিমিনারি টেস্ট', negMark: 0.50, time: 15, grade: 'স্কুল ও কলেজ পর্যায়' },
    grade11_20: { title: '১১-২০তম গ্রেড সরকারি চাকরি স্পিড টেস্ট (অডিটর ও অফিস সহকারী)', negMark: 0.25, time: 15, grade: '১১-২০তম গ্রেড' },
    bank: { title: 'সম্মিলিত ব্যাংক সিনিয়র অফিসার / অফিসার মডেল টেস্ট', negMark: 0.25, time: 15, grade: '৯ম ও ১০ম গ্রেড' },
    bcs: { title: '৪৭তম বিসিএস প্রিলিমিনারি স্পিড টেস্ট', negMark: 0.50, time: 15, grade: 'ক্যাডার ও নন-ক্যাডার' },
  };

  const currentPattern = patternConfig[selectedPattern];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Tick
  useEffect(() => {
    if (isRunning && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isSubmitted]);

  const handleStart = () => {
    setAnswers({});
    setTimeLeft(15 * 60);
    setIsRunning(true);
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    audioEngine.playTick();
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted || !isRunning) return;
    audioEngine.playTick();
    setAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmit = () => {
    setIsRunning(false);
    setIsSubmitted(true);
    audioEngine.playChime(true);

    // Calculate score
    let correct = 0;
    let wrong = 0;

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected !== undefined) {
        if (selected === q.correctIndex) {
          correct += 1;
        } else {
          wrong += 1;
          onAddMissedToErrorLog(q, q.options[selected]);
        }
      }
    });

    const netScore = Math.max(0, correct * 1 - wrong * currentPattern.negMark);
    onTestCompleted(Math.round(netScore * 10));
  };

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Results calculation
  const totalQuestions = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q, idx) => {
    const selected = answers[idx];
    if (selected === undefined) {
      unattemptedCount += 1;
    } else if (selected === q.correctIndex) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }
  });

  const finalScore = (correctCount * 1.0 - wrongCount * currentPattern.negMark).toFixed(2);
  const accuracyPct = (correctCount + wrongCount) > 0 ? Math.round((correctCount / (correctCount + wrongCount)) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>ডিজিটাল ওএমআর মক টেস্ট — ১১-২০তম গ্রেড, প্রাইমারি শিক্ষক ও NTRCA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Job Mock Tests & Interactive OMR Sheet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {currentPattern.title} (নেগেটিভ মার্কিং: -{currentPattern.negMark})
          </p>
        </div>

        {isRunning && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/80 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-base font-bold shrink-0">
            <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>অবশিষ্ট সময়: {timeFormatted}</span>
          </div>
        )}
      </div>

      {!isRunning && !isSubmitted ? (
        /* Welcome / Start Screen */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-xs text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 mx-auto flex items-center justify-center">
            <FileCheck2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {currentPattern.grade}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {currentPattern.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              মোট প্রশ্ন: {questions.length} টি | সময়: {currentPattern.time} মিনিট | নেগেটিভ মার্কিং: -{currentPattern.negMark}
            </p>
          </div>

          {/* Test Pattern Switcher */}
          <div className="text-left space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              পরীক্ষার প্যাটার্ন ও নেগেটিভ মার্কিং নির্বাচন করুন:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'primary', label: '🏫 প্রাথমিক সহকারী শিক্ষক (নেগেটিভ -০.২৫)' },
                { id: 'ntrca', label: '🎓 NTRCA শিক্ষক নিবন্ধন (নেগেটিভ -০.৫০)' },
                { id: 'grade11_20', label: '🏛️ ১১-২০তম গ্রেড সরকারি চাকরি (নেগেটিভ -০.২৫)' },
                { id: 'bank', label: '🏦 ব্যাংক নিয়োগ পরীক্ষা (নেগেটিভ -০.২৫)' },
                { id: 'bcs', label: '📜 বিসিএস প্রিলিমিনারি (নেগেটিভ -০.৫০)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPattern(p.id as any)}
                  className={`p-3 rounded-xl border text-xs text-left font-bold transition ${
                    selectedPattern === p.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 text-left space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200">পরীক্ষার নির্দেশাবলী:</p>
            <p>১. প্রতিটি সঠিক উত্তরের জন্য পাবেন +১.০০ নম্বর।</p>
            <p>২. প্রতিটি ভুল উত্তরের জন্য কাটা যাবে {currentPattern.negMark} নম্বর।</p>
            <p>৩. ওএমআর বাবল শিটে সরাসরি A, B, C, D ক্লিক করে ভরাট করুন।</p>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
          >
            মডেল টেস্ট শুরু করুন 🚀
          </button>
        </div>
      ) : isRunning ? (
        /* Exam In Progress View: Question on Left, OMR Sheet on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Question Viewer */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400">
              <span>প্রশ্ন {currentQuestionIndex + 1} / {questions.length}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {questions[currentQuestionIndex].subject}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {questions[currentQuestionIndex].question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((opt, idx) => {
                const isSelected = answers[currentQuestionIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQuestionIndex, idx)}
                    className={`w-full p-3.5 rounded-xl border text-left text-sm transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border font-mono ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                ← আগের প্রশ্ন
              </button>

              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 disabled:opacity-40"
              >
                পরের প্রশ্ন →
              </button>
            </div>
          </div>

          {/* Right: Interactive OMR Bubble Sheet */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  ডিজিটাল ওএমআর বাবল শিট (OMR)
                </h4>
                <span className="text-xs text-slate-400 font-semibold">
                  উত্তর দিয়েছেন: {Object.keys(answers).length} / {questions.length}
                </span>
              </div>

              {/* OMR Grid Rows */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {questions.map((_, qIdx) => {
                  const selectedOpt = answers[qIdx];
                  const isCurrent = currentQuestionIndex === qIdx;
                  return (
                    <div
                      key={qIdx}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition ${
                        isCurrent
                          ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <button
                        onClick={() => setCurrentQuestionIndex(qIdx)}
                        className="text-xs font-bold text-slate-600 dark:text-slate-400 w-8 text-left hover:text-indigo-600"
                      >
                        #{qIdx + 1}
                      </button>

                      <div className="flex items-center gap-2">
                        {['A', 'B', 'C', 'D'].map((label, optIdx) => {
                          const isBubbleFilled = selectedOpt === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => {
                                handleSelectOption(qIdx, optIdx);
                                setCurrentQuestionIndex(qIdx);
                              }}
                              className={`w-6 h-6 rounded-full text-[10px] font-bold transition flex items-center justify-center border ${
                                isBubbleFilled
                                  ? 'bg-slate-900 dark:bg-indigo-500 text-white border-slate-900 dark:border-indigo-500 shadow-xs'
                                  : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition transform active:scale-95"
              >
                পরীক্ষা সমাপ্ত ও সাবমিট করুন ✓
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results & Review Scorecard */
        <div className="space-y-6">
          {/* KPI Score summary banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  ফলাফল বিশ্লেষণ (Scorecard)
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  প্রাপ্ত নেট নম্বর: {finalScore} / {totalQuestions}
                </h3>
              </div>

              <button
                onClick={handleStart}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পুনরায় পরীক্ষা দিন</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">সঠিক উত্তর (+১)</span>
                <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">
                  {correctCount} টি
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">ভুল উত্তর (-০.৫০)</span>
                <div className="text-2xl font-bold text-rose-800 dark:text-rose-200 mt-1">
                  {wrongCount} টি
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">উত্তরহীন</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {unattemptedCount} টি
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">নির্ভুলতার হার</span>
                <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200 mt-1">
                  {accuracyPct}%
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              প্রশ্নভিত্তিক বিস্তারিত সমাধান ও ব্যাখ্যা
            </h4>

            <div className="space-y-4">
              {questions.map((q, qIdx) => {
                const selected = answers[qIdx];
                const isCorrect = selected === q.correctIndex;
                const isSkipped = selected === undefined;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20'
                        : isSkipped
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40'
                        : 'border-rose-200 dark:border-rose-900 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        #{qIdx + 1} - {q.subject}
                      </span>
                      {isCorrect ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> সঠিক (+১)
                        </span>
                      ) : isSkipped ? (
                        <span className="text-xs font-semibold text-slate-400">
                          উত্তর দেননি (০)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> ভুল (-০.৫০)
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {q.question}
                    </h5>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isCorrectOption = oIdx === q.correctIndex;
                        const isSelectedOption = oIdx === selected;

                        let style = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                        if (isCorrectOption) {
                          style = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
                        } else if (isSelectedOption && !isCorrectOption) {
                          style = 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-900 dark:text-rose-200 font-bold';
                        }

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-lg border flex items-center gap-2 ${style}`}>
                            <span className="font-mono font-bold">
                              {['A', 'B', 'C', 'D'][oIdx]})
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      💡 <b>ব্যাখ্যা:</b> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

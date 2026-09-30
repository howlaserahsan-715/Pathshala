import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Clock, 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award,
  Zap,
  HelpCircle,
  FileText
} from 'lucide-react';
import { QuizQuestion, SubjectType } from '../types';
import { audioEngine } from '../utils/audio';

interface CustomQuizMakerProps {
  availableQuestions: QuizQuestion[];
  onPointsEarned: (pts: number) => void;
  onQuestionMissed: (q: QuizQuestion, selectedOption: string) => void;
}

export const CustomQuizMaker: React.FC<CustomQuizMakerProps> = ({
  availableQuestions,
  onPointsEarned,
  onQuestionMissed,
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectType[]>([
    'বাংলা ভাষা ও সাহিত্য',
    'বাংলাদেশ বিষয়াবলী',
  ]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeMinutes, setTimeMinutes] = useState<number>(10);
  const [sourceType, setSourceType] = useState<'bank' | 'ai'>('bank');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Active Test State
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const allSubjects: SubjectType[] = [
    'বাংলা ভাষা ও সাহিত্য',
    'English Language & Literature',
    'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    'বাংলাদেশ বিষয়াবলী',
    'আন্তর্জাতিক বিষয়াবলী',
    'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি',
  ];

  const toggleSubject = (sub: SubjectType) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleStartCustomQuiz = async () => {
    if (sourceType === 'ai') {
      setIsGeneratingAI(true);
      try {
        // Call backend AI custom-quiz endpoint
        const res = await fetch('/api/ai/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: selectedSubjects.join(', '),
            count: questionCount,
          }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          startTestWithQuestions(data.questions);
          return;
        }
      } catch (e) {
        console.error('AI quiz generation error, falling back to bank:', e);
      } finally {
        setIsGeneratingAI(false);
      }
    }

    // Filter from bank
    const matched = availableQuestions.filter((q) => selectedSubjects.includes(q.subject));
    const pool = matched.length >= questionCount ? matched : availableQuestions;
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, questionCount);
    startTestWithQuestions(shuffled);
  };

  const startTestWithQuestions = (qList: QuizQuestion[]) => {
    setActiveQuiz(qList);
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(timeMinutes * 60);
    setIsSubmitted(false);
    audioEngine.playTick();
  };

  // Timer Tick
  useEffect(() => {
    if (activeQuiz && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
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
  }, [activeQuiz, isSubmitted]);

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    audioEngine.playTick();
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIdx,
    }));
  };

  const handleComplete = () => {
    if (!activeQuiz) return;
    setIsSubmitted(true);
    audioEngine.playChime(true);

    let correct = 0;
    let wrong = 0;
    activeQuiz.forEach((q, idx) => {
      const userChoice = answers[idx];
      if (userChoice !== undefined) {
        if (userChoice === q.correctIndex) {
          correct += 1;
        } else {
          wrong += 1;
          onQuestionMissed(q, q.options[userChoice]);
        }
      }
    });

    const netScore = Math.max(0, correct * 1 - wrong * 0.5);
    onPointsEarned(Math.round(netScore * 10));
  };

  // Score metrics
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  if (activeQuiz) {
    activeQuiz.forEach((q, idx) => {
      const chosen = answers[idx];
      if (chosen === undefined) skippedCount++;
      else if (chosen === q.correctIndex) correctCount++;
      else wrongCount++;
    });
  }
  const netScore = (correctCount * 1.0 - wrongCount * 0.5).toFixed(2);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4" />
          <span>কাস্টম স্পিড টেস্ট জেনারেটর (Custom Speed Quiz)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Create Your Own Custom Quiz
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          আপনার দুর্বল বিষয়ের ওপর ভিত্তি করে প্রশ্ন সংখ্যা, সময় ও বিষয় নির্বাচন করে তাৎক্ষণিক কাস্টম পরীক্ষা দিন
        </p>
      </div>

      {!activeQuiz ? (
        /* Configuration Screen */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Step 1: Subject Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              ১. বিষয় নির্বাচন করুন (একাধিক সিলেক্ট করতে পারেন):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allSubjects.map((sub) => {
                const isChecked = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{sub}</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                      isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}>
                      {isChecked && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Question Count & Time Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                ২. প্রশ্নের সংখ্যা:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      questionCount === cnt
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cnt} টি
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                ৩. সময়সীমা:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 20].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTimeMinutes(m)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      timeMinutes === m
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m} মিনিট
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Source Selection */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              ৪. প্রশ্নের সোর্স:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('bank')}
                className={`p-4 rounded-2xl border text-left transition ${
                  sourceType === 'bank'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>প্রশ্ন ব্যাংক ও বিগত সালের সংগ্রহ</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  বিসিএস ও চাকরির বিগত পরীক্ষার প্রশ্ন থেকে স্বয়ংক্রিয়ভাবে বাছাই করা হবে।
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('ai')}
                className={`p-4 rounded-2xl border text-left transition ${
                  sourceType === 'ai'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>এআই জেনারেটেড নতুন প্রশ্ন</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  সিলেবাসের আলোকে এআই দ্বারা তাৎক্ষণিক সম্পূর্ণ নতুন ও আনকমন প্রশ্ন তৈরি।
                </p>
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={handleStartCustomQuiz}
              disabled={isGeneratingAI}
              className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform active:scale-95 flex items-center gap-2"
            >
              {isGeneratingAI ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>এআই প্রশ্ন তৈরি করছে...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>কাস্টম টেস্ট শুরু করুন 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : !isSubmitted ? (
        /* Exam In Progress */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">
              প্রশ্ন {currentIdx + 1} / {activeQuiz.length}
            </div>

            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              {activeQuiz[currentIdx].subject}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {activeQuiz[currentIdx].question}
            </h3>
          </div>

          {/* Options with English A, B, C, D */}
          <div className="space-y-3">
            {activeQuiz[currentIdx].options.map((opt, optIdx) => {
              const isSelected = answers[currentIdx] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl border text-left text-sm transition flex items-center gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl text-xs font-bold font-mono flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'
                  }`}>
                    {['A', 'B', 'C', 'D'][optIdx]}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              ← আগের প্রশ্ন
            </button>

            {currentIdx < activeQuiz.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((p) => Math.min(activeQuiz.length - 1, p + 1))}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                পরের প্রশ্ন →
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                পরীক্ষা সম্পন্ন করুন ✓
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results & Review */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-600 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              কাস্টম কুইজ ফলাফল
            </h3>
            <p className="text-3xl font-black text-indigo-600">
              প্রাপ্ত নেট নম্বর: {netScore} / {activeQuiz.length}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 font-bold">
              সঠিক: {correctCount} টি (+{correctCount})
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-800 font-bold">
              ভুল: {wrongCount} টি (-{(wrongCount * 0.5).toFixed(2)})
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-700 font-bold">
              উত্তরহীন: {skippedCount} টি
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>প্রশ্নের উত্তর ও সমাধান:</span>
            </h4>

            {activeQuiz.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correctIndex;
              return (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span>#{idx + 1} {q.question}</span>
                    <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                      {isCorrect ? 'সঠিক (+১)' : userAns !== undefined ? 'ভুল (-০.৫০)' : 'বাদ দেওয়া হয়েছে'}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    💡 সঠিক উত্তর: <b>Option {['A', 'B', 'C', 'D'][q.correctIndex]} ({q.options[q.correctIndex]})</b>
                  </div>
                  <p className="text-slate-500 text-[11px]">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => setActiveQuiz(null)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন কাস্টম টেস্ট তৈরি করুন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

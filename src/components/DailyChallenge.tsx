import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  HelpCircle,
  Flame
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { audioEngine } from '../utils/audio';

interface DailyChallengeProps {
  questions: QuizQuestion[];
  onPointsEarned: (pts: number) => void;
  onQuestionMissed: (q: QuizQuestion, selectedOption: string) => void;
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  questions,
  onPointsEarned,
  onQuestionMissed,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    audioEngine.playTick();

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 20);
      onPointsEarned(20);
      audioEngine.playChime(true);
    } else {
      audioEngine.playChime(false);
      onQuestionMissed(currentQ, currentQ.options[idx]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>ডেইলি নলেজ এরিনা</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Daily Challenge Arena
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              প্রতিদিন ৫টি করে বাছাইকৃত প্রশ্ন সমাধান করুন এবং আপনার স্টাডি স্ট্রিক ধরে রাখুন
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>পয়েন্ট: {score} pts</span>
          </div>
        </div>
      </div>

      {!completed ? (
        /* Quiz Question Card */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span>প্রশ্ন {currentIndex + 1} / {questions.length}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentQ.subject}</span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Options List */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQ.correctIndex;
              let btnClass = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-800/60';

              if (isAnswered) {
                if (isCorrectAnswer) {
                  btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-left text-sm transition flex items-center justify-between ${btnClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                      {['A', 'B', 'C', 'D'][idx]}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Answered */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                প্রশ্নের ব্যাখ্যা (Explanation):
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {currentQ.explanation}
              </p>
              {selectedOption !== currentQ.correctIndex && (
                <p className="text-[11px] text-rose-600 font-medium">
                  ⚠️ প্রশ্নটি স্বয়ংক্রিয়ভাবে আপনার "ভুল খাতা" (Error Log)-এ সংরক্ষিত হয়েছে।
                </p>
              )}
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
              >
                <span>{currentIndex < questions.length - 1 ? 'পরবর্তী প্রশ্ন' : 'ফলাফল দেখুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completion Summary Card */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-lg text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              অভিনন্দন! আজকের ডেইলি চ্যালেঞ্জ সম্পন্ন!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              আপনি অর্জন করেছেন <span className="font-bold text-amber-600">{score} পয়েন্ট</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm hover:bg-slate-200 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>আবার দিন</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

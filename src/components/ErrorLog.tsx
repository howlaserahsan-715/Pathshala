import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { ErrorQuestionItem } from '../types';

interface ErrorLogProps {
  errors: ErrorQuestionItem[];
  onRemoveError: (id: string) => void;
  onClearAll: () => void;
}

export const ErrorLog: React.FC<ErrorLogProps> = ({
  errors,
  onRemoveError,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredErrors = errors.filter((err) => {
    const matchesSub = selectedSubject === 'all' || err.subject === selectedSubject;
    const matchesQ = 
      err.question.toLowerCase().includes(search.toLowerCase()) ||
      err.explanation.toLowerCase().includes(search.toLowerCase());
    return matchesSub && matchesQ;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span>ক্যাডারদের সবচেয়ে কার্যকরী কৌশল</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ভুল খাতা (Error Notebook)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            মডেল টেস্ট ও কুইজে আপনার ভুল হওয়া প্রশ্নগুলো এখানে স্বয়ংক্রিয়ভাবে জমা হয় যাতে দ্বিতীয়বার ভুল না হয়।
          </p>
        </div>

        {errors.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 self-start sm:self-auto transition"
          >
            সব ভুল মুছে ফেলুন
          </button>
        )}
      </div>

      {/* Search & Filters */}
      {errors.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ভুল হওয়া প্রশ্ন দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>
        </div>
      )}

      {/* Errors Cards List */}
      {filteredErrors.length > 0 ? (
        <div className="space-y-4">
          {filteredErrors.map((err) => (
            <div
              key={err.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-950/80 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                  {err.subject}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{err.date}</span>
                  <button
                    onClick={() => onRemoveError(err.id)}
                    title="সমাধান হয়েছে (মুছে ফেলুন)"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">
                {err.question}
              </h4>

              {/* Answers Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-800 dark:text-rose-300">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <div>
                    <span className="font-bold">আপনার ভুল দাগানো উত্তর:</span>
                    <p className="mt-0.5">{err.userAnswer}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold">প্রকৃত সঠিক উত্তর:</span>
                    <p className="mt-0.5">{err.correctAnswer}</p>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                💡 <b>ব্যাখ্যা ও সমাধান:</b> {err.explanation}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            ভুল খাতা সম্পূর্ণ পরিষ্কার!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            মডেল টেস্ট বা ডেইলি চ্যালেঞ্জে কোনো ভুল হলে তা স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হবে।
          </p>
        </div>
      )}
    </div>
  );
};

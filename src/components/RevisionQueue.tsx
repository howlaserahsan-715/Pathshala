import React, { useState } from 'react';
import { 
  Repeat, 
  Calendar, 
  CheckCircle2, 
  RotateCw, 
  Plus, 
  Trash2, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { SpacedRevisionItem } from '../types';

interface RevisionQueueProps {
  items: SpacedRevisionItem[];
  onReviewItem: (id: string, performance: 'again' | 'hard' | 'good' | 'easy') => void;
  onRemoveItem: (id: string) => void;
  onOpenConcept: (subject: string, topic: string) => void;
}

export const RevisionQueue: React.FC<RevisionQueueProps> = ({
  items,
  onReviewItem,
  onRemoveItem,
  onOpenConcept,
}) => {
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const getIntervalText = (level: number) => {
    switch (level) {
      case 1: return '১ দিন পর';
      case 2: return '৩ দিন পর';
      case 3: return '৭ দিন পর';
      case 4: return '১৪ দিন পর';
      default: return '৩০ দিন পর';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Repeat className="w-4 h-4" />
          <span>বৈজ্ঞানিক স্পেসড রিপিটেশন পদ্ধতি (SM-2)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Spaced Revision Queue (স্মৃতিতে স্থায়ী করার শিডিউল)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          যেসব বিষয় ভুলে যাওয়ার সম্ভাবনা বেশি, সেগুলোকে নির্দিষ্ট বিরতিতে (১, ৩, ৭, ১৪ দিন) রিভিশন দিয়ে স্থায়ী স্মৃতিতে রূপান্তর করুন।
        </p>
      </div>

      {/* Revision List */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => {
            const isReviewing = activeReviewId === item.id;
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      {item.subject}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      ধাপ {item.level} ({getIntervalText(item.level)})
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {item.topic}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>শেষ রিভিশন: {item.lastReviewed}</span>
                    <span>•</span>
                    <span className="text-indigo-600 font-medium">পরবর্তী রিভিউ: {item.nextReviewDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onOpenConcept(item.subject, item.topic)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    💡 কনসেপ্ট দেখুন
                  </button>

                  {!isReviewing ? (
                    <button
                      onClick={() => setActiveReviewId(item.id)}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                    >
                      এখনই রিভিশন দিন
                    </button>
                  ) : (
                    /* Spaced Interval Buttons */
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => {
                          onReviewItem(item.id, 'again');
                          setActiveReviewId(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-500 text-white"
                        title="আবার পড়ুন (১ দিন)"
                      >
                        ভুলে গেছি
                      </button>
                      <button
                        onClick={() => {
                          onReviewItem(item.id, 'hard');
                          setActiveReviewId(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 text-white"
                        title="কঠিন ছিল (৩ দিন)"
                      >
                        কঠিন
                      </button>
                      <button
                        onClick={() => {
                          onReviewItem(item.id, 'good');
                          setActiveReviewId(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white"
                        title="ভালো (৭ দিন)"
                      >
                        মনে আছে
                      </button>
                      <button
                        onClick={() => {
                          onReviewItem(item.id, 'easy');
                          setActiveReviewId(null);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white"
                        title="সহজ (১৪+ দিন)"
                      >
                        পানির মতো সহজ
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition"
                    title="তালিকা থেকে সরান"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            বর্তমানে কোনো রিভিশন বাকি নেই!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            সিলেবাস ট্যাব থেকে যেকোনো কঠিন টপিকের পাশে "রিভিশন কিউ" আইকনে ক্লিক করে যুক্ত করতে পারেন।
          </p>
        </div>
      )}
    </div>
  );
};

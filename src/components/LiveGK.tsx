import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  RotateCw, 
  BookMarked, 
  Volume2, 
  VolumeX, 
  Layers, 
  TrendingUp,
  Tag,
  Loader2
} from 'lucide-react';
import { GKItem } from '../types';
import { audioEngine } from '../utils/audio';

interface LiveGKProps {
  initialItems: GKItem[];
}

export const LiveGK: React.FC<LiveGKProps> = ({ initialItems }) => {
  const [items, setItems] = useState<GKItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const categories = ['all', 'বাংলাদেশ', 'আন্তর্জাতিক', 'অর্থনীতি', 'বিজ্ঞান ও পরিবেশ', 'খেলাধুলা'];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.details.toLowerCase().includes(search.toLowerCase()) ||
      item.examTip.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleRefreshDigest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/gk-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory }),
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const mapped = data.items.map((it: any, idx: number) => ({
          id: `live-ai-${Date.now()}-${idx}`,
          title: it.title,
          category: it.category || 'বাংলাদেশ',
          date: it.date || 'আজকের আপডেট',
          details: it.details,
          examTip: it.examTip,
        }));
        setItems([...mapped, ...items]);
      }
    } catch (e) {
      console.warn('Digest refresh failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      audioEngine.stopSpeaking();
      setSpeakingId(null);
    } else {
      audioEngine.stopSpeaking();
      setSpeakingId(id);
      audioEngine.speakBangla(
        text,
        1.0,
        () => setSpeakingId(null),
        () => setSpeakingId(null)
      );
    }
  };

  const currentFlashcard = filteredItems[flashcardIndex];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-1">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span>রিয়েল-টাইম সাধারণ জ্ঞান ও কারেন্ট অ্যাফেয়ার্স</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              AI Live GK & Current Affairs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              বিসিএস প্রিলিমিনারি ও লিখিত পরীক্ষার জন্য প্রতিদিনের সর্বাধিক গুরুত্বপূর্ণ তথ্য ও পরীক্ষার টিপস
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Flashcard Toggle */}
            <button
              onClick={() => setIsFlashcardMode(!isFlashcardMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                isFlashcardMode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isFlashcardMode ? 'তালিকা দেখুন' : 'ফ্ল্যাশকার্ড মোড'}</span>
            </button>

            {/* AI Refresh Button */}
            <button
              onClick={handleRefreshDigest}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'সংগ্রহ হচ্ছে...' : 'এআই ডাইজেস্ট রিফ্রেশ'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="যেকোনো তথ্য, ব্যক্তি, চুক্তি বা সাম্প্রতিক ঘটনা দিয়ে সার্চ করুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'সব বিভাগ' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flashcard Interactive View */}
      {isFlashcardMode ? (
        <div className="max-w-2xl mx-auto space-y-4">
          {currentFlashcard ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[280px] p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-lg cursor-pointer flex flex-col justify-between text-center transition hover:shadow-xl select-none"
            >
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                  {currentFlashcard.category}
                </span>
                <span className="text-xs text-slate-400 block mt-2">{currentFlashcard.date}</span>
              </div>

              {!isFlipped ? (
                <div className="py-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {currentFlashcard.title}
                  </h3>
                  <p className="text-xs text-indigo-500 font-semibold mt-4">
                    👉 কার্ডটিতে ট্যাপ করে বিস্তারিত ও পরীক্ষার টিপস দেখুন
                  </p>
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {currentFlashcard.details}
                  </p>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-medium">
                    🎯 <b>বিসিএস টিপস:</b> {currentFlashcard.examTip}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400">
                কার্ড {flashcardIndex + 1} / {filteredItems.length}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              কোনো তথ্য পাওয়া যায়নি।
            </div>
          )}

          {/* Flashcard Navigation */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                ← আগের কার্ড
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white"
              >
                পরের কার্ড →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Regular List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.date}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {item.details}
                </p>
              </div>

              {/* Exam Tip Cardlet */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-900/60 flex-1 truncate">
                  🎯 <b>পরীক্ষার টিপস:</b> {item.examTip}
                </div>

                <button
                  onClick={() => handleSpeak(item.id, `${item.title}। ${item.details}`)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 shrink-0"
                  title="অডিও শুনুন"
                >
                  {speakingId === item.id ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

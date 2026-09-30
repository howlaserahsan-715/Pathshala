import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  BookmarkPlus, 
  Lightbulb, 
  Calculator, 
  BookOpen, 
  Globe, 
  Cpu,
  Layers
} from 'lucide-react';
import { CheatSheetItem } from '../types';
import { FORMULA_CHEAT_SHEET } from '../data/formulaData';
import { audioEngine } from '../utils/audio';

export const FormulaVault: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'সকল শর্টকাট' },
    { id: 'math', label: '📐 গণিত ও মানসিক দক্ষতা' },
    { id: 'bangla', label: '📖 বাংলা ব্যাকরণ ছন্দ' },
    { id: 'english', label: '🔤 ইংরেজি গ্রামার রুলস' },
    { id: 'bd', label: '🇧🇩 বাংলাদেশ ও সংবিধান' },
    { id: 'intl', label: '🌍 আন্তর্জাতিক ও প্রণালী' },
    { id: 'sci', label: '🔬 বিজ্ঞান ও আইসিটি' },
  ];

  const filteredItems = FORMULA_CHEAT_SHEET.filter((item) => {
    let matchCat = true;
    if (selectedCategory === 'math') matchCat = item.subject === 'গাণিতিক যুক্তি ও মানসিক দক্ষতা';
    else if (selectedCategory === 'bangla') matchCat = item.subject === 'বাংলা ভাষা ও সাহিত্য';
    else if (selectedCategory === 'english') matchCat = item.subject === 'English Language & Literature';
    else if (selectedCategory === 'bd') matchCat = item.subject === 'বাংলাদেশ বিষয়াবলী';
    else if (selectedCategory === 'intl') matchCat = item.subject === 'সাধারণ জ্ঞান ও ভূরাজনীতি';
    else if (selectedCategory === 'sci') matchCat = item.subject === 'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি';

    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ruleOrFormula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Lightbulb className="w-4 h-4" />
          <span>বিসিএস শর্টকাট সূত্র ও মেমোরি ভল্ট (Cheat-Sheet Vault)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Formula & Mnemonics Cheat-Sheet
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          গণিত, ব্যাকরণ, সংবিধান ও সাধারণ জ্ঞানের দ্রুত মনে রাখার ছন্দ, শর্টকাট সূত্র এবং ট্রিকস
        </p>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="যেকোনো সূত্র বা টেকনিক খুঁজুন (যেমন: পিথাগোরাস, সমাস, অনুচ্ছেদ, ঘড়ি, হরমুজ)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition ${
              selectedCategory === c.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Cheat-Sheet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isCopied = copiedId === item.id;
          const isSpeaking = speakingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSpeak(item.id, `${item.title}। নিয়ম: ${item.ruleOrFormula}। ব্যাখ্যা: ${item.explanation}`)}
                      title="অডিও শুনুন"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(item.id, `${item.title}\nসূত্র: ${item.ruleOrFormula}\nউদাহরণ: ${item.example}`)}
                      title="কপি করুন"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                {/* Highlighted Rule / Formula Box */}
                <div className="mt-2.5 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-xs sm:text-sm font-bold font-mono text-amber-950 dark:text-amber-200 leading-relaxed">
                  ⚡ {item.ruleOrFormula}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                  {item.explanation}
                </p>

                {item.example && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-700 dark:text-slate-300">
                    <b>বাস্তব উদাহরণ:</b> {item.example}
                  </div>
                )}
              </div>

              {/* Shortcut Exam Tip Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <span>🎯</span>
                <span><b>পরীক্ষার টিপস:</b> {item.shortcutTip}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

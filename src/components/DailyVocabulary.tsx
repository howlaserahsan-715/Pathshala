import React, { useState } from 'react';
import { 
  BookMarked, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { EditorialWord } from '../types';
import { DAILY_EDITORIAL_WORDS } from '../data/vocabularyData';
import { audioEngine } from '../utils/audio';

export const DailyVocabulary: React.FC = () => {
  const [viewMode, setViewMode] = useState<'cards' | 'flashcards' | 'quiz'>('cards');
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  // Flashcard State
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleSpeak = (text: string) => {
    if (speakingWord === text) {
      audioEngine.stopSpeaking();
      setSpeakingWord(null);
    } else {
      audioEngine.stopSpeaking();
      setSpeakingWord(text);
      audioEngine.speakBangla(
        text,
        0.9,
        () => setSpeakingWord(null),
        () => setSpeakingWord(null)
      );
    }
  };

  // Generate dynamic quiz from vocabulary
  const currentWord = DAILY_EDITORIAL_WORDS[quizIdx];
  const quizOptions = currentWord ? [
    currentWord.bengaliMeaning,
    'সম্পূর্ণ অবাস্তব বা অলীক কল্পনা করা',
    'কোনো কিছু দ্রুত বৃদ্ধি পাওয়া বা ছড়িয়ে পড়া',
    'গভীর নিদ্রায় আচ্ছন্ন হওয়া'
  ].sort(() => 0.5 - Math.random()) : [];

  const handleSelectQuizOption = (opt: string, idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    audioEngine.playTick();
    if (opt === currentWord.bengaliMeaning) {
      setQuizScore((s) => s + 10);
      audioEngine.playChime(false);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOpt(null);
    if (quizIdx < Math.min(5, DAILY_EDITORIAL_WORDS.length) - 1) {
      setQuizIdx((p) => p + 1);
    } else {
      setQuizCompleted(true);
      audioEngine.playChime(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200/60 dark:border-indigo-800">
            <BookMarked className="w-3.5 h-3.5" />
            <span>ইংরেজি সম্পাদকীয় ভোকাবুলারি ব্যাংক (Editorial Vocab)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Daily Editorial Vocabulary & Flashcards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            The Daily Star ও প্রখ্যাত পত্রিকার সাম্প্রতিক সম্পাদকীয় থেকে বাছাইকৃত বিসিএস ও ব্যাংক উপযোগী শব্দভাণ্ডার
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            📚 ভোকাবুলারি তালিকা
          </button>
          <button
            onClick={() => {
              setViewMode('flashcards');
              setIsFlipped(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'flashcards'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🔄 ফ্ল্যাশকার্ড মেমোরি
          </button>
          <button
            onClick={() => {
              setViewMode('quiz');
              setQuizIdx(0);
              setSelectedOpt(null);
              setQuizScore(0);
              setQuizCompleted(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'quiz'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ⚡ শব্দ কুইজ
          </button>
        </div>
      </div>

      {/* ----------------- MODE 1: WORD CARDS LIST ----------------- */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DAILY_EDITORIAL_WORDS.map((w) => (
            <div
              key={w.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {w.word}
                    </span>
                    <button
                      onClick={() => handleSpeak(`${w.word}. ${w.bengaliMeaning}`)}
                      title="উচ্চারণ শুনুন"
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition"
                    >
                      {speakingWord === `${w.word}. ${w.bengaliMeaning}` ? (
                        <VolumeX className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {w.partOfSpeech} | {w.pronunciation}
                  </span>
                </div>

                <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                  বাংলা অর্থ: {w.bengaliMeaning}
                </div>

                {/* Synonyms and Antonyms */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold block mb-1">Synonyms:</span>
                    <span>{w.synonyms.join(', ')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                    <span className="font-bold block mb-1">Antonyms:</span>
                    <span>{w.antonyms.join(', ')}</span>
                  </div>
                </div>

                {/* Example sentence from Newspaper */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs italic text-slate-700 dark:text-slate-300">
                  "{w.exampleSentence}"
                  <span className="block mt-1 text-[10px] font-semibold text-slate-400 not-italic">
                    — {w.newspaperSource}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                <span>💡</span>
                <span>{w.examTip}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- MODE 2: FLASHCARD VIEW ----------------- */}
      {viewMode === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-6 text-center">
          <div className="text-xs font-semibold text-slate-400">
            কার্ড {flashcardIdx + 1} / {DAILY_EDITORIAL_WORDS.length} (কার্ডে ক্লিক করে অর্থ দেখুন)
          </div>

          {/* Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[280px] bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-200 dark:border-slate-800 p-8 shadow-lg flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-[1.01] select-none"
          >
            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
                  {DAILY_EDITORIAL_WORDS[flashcardIdx].partOfSpeech}
                </span>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white">
                  {DAILY_EDITORIAL_WORDS[flashcardIdx].word}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {DAILY_EDITORIAL_WORDS[flashcardIdx].pronunciation}
                </p>
                <span className="inline-block mt-4 text-xs font-bold text-slate-400">
                  👆 বাংলা অর্থ ও সিনোনিম দেখতে ট্যাপ করুন
                </span>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in text-left">
                <div>
                  <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {DAILY_EDITORIAL_WORDS[flashcardIdx].bengaliMeaning}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    <b>Synonyms:</b> {DAILY_EDITORIAL_WORDS[flashcardIdx].synonyms.join(', ')}
                  </p>
                  <p className="text-xs text-slate-400">
                    <b>Antonyms:</b> {DAILY_EDITORIAL_WORDS[flashcardIdx].antonyms.join(', ')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs italic text-slate-600 dark:text-slate-300">
                  "{DAILY_EDITORIAL_WORDS[flashcardIdx].exampleSentence}"
                </div>
              </div>
            )}
          </div>

          {/* Flashcard Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIdx((p) => Math.max(0, p - 1));
              }}
              disabled={flashcardIdx === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              ← আগের শব্দ
            </button>

            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIdx((p) => Math.min(DAILY_EDITORIAL_WORDS.length - 1, p + 1));
              }}
              disabled={flashcardIdx === DAILY_EDITORIAL_WORDS.length - 1}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md disabled:opacity-40"
            >
              পরের শব্দ →
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MODE 3: VOCAB QUIZ ----------------- */}
      {viewMode === 'quiz' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {!quizCompleted ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
                <span>প্রশ্ন {quizIdx + 1} / 5</span>
                <span className="text-indigo-600">স্কোর: {quizScore} pts</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">শব্দের সঠিক অর্থ কী?</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  "{currentWord.word}"
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{currentWord.pronunciation}</p>
              </div>

              <div className="space-y-2.5">
                {quizOptions.map((opt, i) => {
                  const isSelected = selectedOpt === i;
                  const isCorrect = opt === currentWord.bengaliMeaning;

                  let style = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200';
                  if (selectedOpt !== null) {
                    if (isCorrect) {
                      style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (isSelected) {
                      style = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectQuizOption(opt, i)}
                      disabled={selectedOpt !== null}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                          {['A', 'B', 'C', 'D'][i]}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {selectedOpt !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {selectedOpt !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                    </button>
                  );
                })}
              </div>

              {selectedOpt !== null && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuiz}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <span>{quizIdx < 4 ? 'পরের প্রশ্ন' : 'ফলাফল দেখুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4 py-4">
              <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                ভোকাবুলারি কুইজ সম্পন্ন!
              </h3>
              <p className="text-2xl font-black text-indigo-600">
                আপনি পেয়েছেন {quizScore} / ৫০ পয়েন্ট
              </p>
              <button
                onClick={() => {
                  setQuizIdx(0);
                  setSelectedOpt(null);
                  setQuizScore(0);
                  setQuizCompleted(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                আবার কুইজ দিন
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

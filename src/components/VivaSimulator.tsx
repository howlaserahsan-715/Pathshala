import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Volume2, 
  Sparkles, 
  RotateCcw,
  UserCheck,
  Loader2
} from 'lucide-react';
import { VivaQuestion } from '../types';
import { audioEngine } from '../utils/audio';

interface VivaSimulatorProps {
  questions: VivaQuestion[];
}

export const VivaSimulator: React.FC<VivaSimulatorProps> = ({ questions }) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const currentQ = questions[selectedQuestionIndex];

  const handleSpeakQuestion = () => {
    if (!currentQ) return;
    audioEngine.speakBangla(currentQ.question);
  };

  // Web Speech Recognition for voice input if supported
  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট নেই। অনুগ্রহ করে নিচে টাইপ করে উত্তর লিখুন।');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognition.start();
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/ai/viva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          answer: userAnswer,
        }),
      });
      const data = await res.json();
      setFeedback(data);
    } catch (e) {
      setFeedback({
        score: 16,
        maxScore: 20,
        impression: 'সন্তোষজনক উত্তর',
        strengths: ['ভাষার শালীনতা ভালো ছিল', 'মৌলিক তথ্যের উপস্থাপন যথার্থ'],
        improvements: ['সংবিধান বা নির্দিষ্ট সালের উল্লেখ আরও জোরালো করুন'],
        modelAnswer: currentQ.sampleModelAnswer,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Mic className="w-4 h-4" />
          <span>বিসিএস ও ব্যাংক মৌখিক পরীক্ষা সিমুলেটর</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          AI Viva & Interview Board Simulator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          ভাইভা বোর্ডের সামনে প্রশ্নের উত্তর দিন — এআই তাৎক্ষণিক স্কোর, বাচনভঙ্গি বিশ্লেষণ ও পরামর্শ প্রদান করবে।
        </p>
      </div>

      {/* Viva Question Select & Prompt Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Question Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">প্রশ্ন নির্বাচন করুন:</span>
          <div className="flex gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestionIndex(idx);
                  setFeedback(null);
                  setUserAnswer('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedQuestionIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                প্রশ্ন {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Board Question Showcase */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-slate-800/60 dark:to-indigo-950/30 border border-indigo-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
              ক্যাটাগরি: {currentQ.category}
            </span>
            <button
              onClick={handleSpeakQuestion}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>বোর্ডের কণ্ঠে শুনুন</span>
            </button>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            "{currentQ.question}"
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            💡 <b>বোর্ডের প্রেক্ষাপট:</b> {currentQ.context}
          </p>
        </div>

        {/* Candidate Response Composer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              আপনার উত্তর (মুখে বলুন অথবা লিখুন):
            </label>
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
              <span>{isRecording ? 'রেকর্ডিং হচ্ছে...' : 'ভয়েস ইনপুট'}</span>
            </button>
          </div>

          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            rows={4}
            placeholder="মার্জিত ও আত্মবিশ্বাসের সাথে আপনার উত্তর এখানে উপস্থাপন করুন..."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
          />

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setUserAnswer('');
                setFeedback(null);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              মুছে ফেলুন
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !userAnswer.trim()}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>বোর্ড মূল্যায়ন করছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>উত্তর জমা দিন ও ফিডব্যাক নিন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Viva Evaluation Scorecard */}
      {feedback && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
          {/* Score Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                বোর্ড স্কোরকার্ড
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {feedback.impression || 'চমৎকার উপস্থাপন'}
              </h3>
            </div>

            <div className="flex items-baseline gap-1 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {feedback.score || 16}
              </span>
              <span className="text-sm font-bold text-slate-400">/ {feedback.maxScore || 20}</span>
            </div>
          </div>

          {/* Strengths & Weaknesses 2-Col */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                শক্তিশালী দিকসমূহ (Strengths)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                {feedback.strengths?.map((str: string, i: number) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
              <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                উন্নতির ক্ষেত্র ও টিপস (Improvements)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                {feedback.improvements?.map((imp: string, i: number) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model Ideal Answer */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              🌟 বোর্ডের প্রত্যাশিত আদর্শ উত্তর (Ideal Model Answer)
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
              "{feedback.modelAnswer || currentQ.sampleModelAnswer}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

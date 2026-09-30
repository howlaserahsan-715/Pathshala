import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Coffee, 
  Brain,
  Bell,
  Radio
} from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface PomodoroTimerProps {
  onStudyTimeEarned: (minutes: number) => void;
}

type Mode = 'study' | 'shortBreak' | 'longBreak';
type AmbientSound = 'none' | 'rain' | 'waves' | 'whitenoise' | 'forest';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onStudyTimeEarned }) => {
  const [mode, setMode] = useState<Mode>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('rain');
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modeConfigs = {
    study: { label: 'Focus Session', defaultMinutes: 25, icon: Brain, color: 'text-indigo-600', ringColor: '#4f46e5' },
    shortBreak: { label: 'Short Break', defaultMinutes: 5, icon: Coffee, color: 'text-emerald-600', ringColor: '#10b981' },
    longBreak: { label: 'Long Break', defaultMinutes: 15, icon: Sparkles, color: 'text-violet-600', ringColor: '#8b5cf6' },
  };

  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    const secs = modeConfigs[newMode].defaultMinutes * 60;
    setInitialTime(secs);
    setTimeLeft(secs);
    audioEngine.stopAmbient();
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
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
  }, [isRunning, mode]);

  // Ambient sound controller during session
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      audioEngine.startAmbient(ambientSound);
    } else if (!isPreviewing) {
      audioEngine.stopAmbient();
    }

    return () => {
      if (!isPreviewing) {
        audioEngine.stopAmbient();
      }
    };
  }, [isRunning, ambientSound]);

  const handleComplete = () => {
    setIsRunning(false);
    audioEngine.stopAmbient();
    audioEngine.playChime(true);

    if (mode === 'study') {
      const earned = Math.round(initialTime / 60);
      onStudyTimeEarned(earned);
      setCompletedSessions((c) => c + 1);
      switchMode('shortBreak');
    } else {
      switchMode('study');
    }
  };

  const togglePlay = () => {
    // Unlock AudioContext via user gesture
    audioEngine.getContext();
    audioEngine.playTick();
    setIsRunning(!isRunning);
    setIsPreviewing(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    audioEngine.stopAmbient();
    setIsPreviewing(null);
  };

  const adjustMinutes = (delta: number) => {
    if (isRunning) return;
    const newTotal = Math.max(60, timeLeft + delta * 60);
    setInitialTime(newTotal);
    setTimeLeft(newTotal);
  };

  // Sound Test & Preview Functionality
  const handleTestSound = (type: 'rain' | 'waves' | 'whitenoise' | 'forest' | 'bell' | 'chime') => {
    // Unlock AudioContext
    audioEngine.getContext();

    if (isPreviewing === type) {
      audioEngine.stopAmbient();
      setIsPreviewing(null);
      return;
    }

    setIsPreviewing(type);
    audioEngine.previewSound(type, 7, () => {
      setIsPreviewing((prev) => (prev === type ? null : prev));
    });
  };

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Ring calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressPct = ((initialTime - timeLeft) / initialTime) * 100;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const currentConfig = modeConfigs[mode];
  const ModeIcon = currentConfig.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>পোমোডোরো স্টাডি ও সাউন্ডস্কেপ টাইমার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Pomodoro Focus Timer & Ambience
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            সুশৃঙ্খল ফোকাসড অধ্যয়ন এবং লাইভ ব্যাকগ্রাউন্ড অ্যাম্বিয়েন্স সাউন্ড
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          {(['study', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                mode === m
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {modeConfigs[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-xs text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Circular Progress Display */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800/80"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={currentConfig.ringColor}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Time digits in center */}
          <div className="absolute flex flex-col items-center justify-center">
            <div className={`p-2.5 rounded-2xl mb-2 bg-slate-50 dark:bg-slate-800/80 ${currentConfig.color}`}>
              <ModeIcon className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {timeFormatted}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              {currentConfig.label}
            </div>
          </div>
        </div>

        {/* Time Adjustments Buttons */}
        {!isRunning && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => adjustMinutes(-5)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
            >
              -৫ মিনিট
            </button>
            <button
              onClick={() => adjustMinutes(5)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold cursor-pointer"
            >
              +৫ মিনিট
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            title="রিসেট"
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className={`px-10 py-4 rounded-2xl font-bold text-base text-white shadow-lg transition transform active:scale-95 flex items-center gap-2.5 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>পজ করুন</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>স্টাডি শুরু করুন</span>
              </>
            )}
          </button>

          <button
            onClick={handleComplete}
            title="স্কিপ বা সমাপ্তি"
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* 🎧 Interactive Focus Ambience & Sound Testing Suite */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                🎧 ব্যাকগ্রাউন্ড ফোকাস অ্যাম্বিয়েন্স সাউন্ড (Web Audio Synthesizer)
              </span>
              <p className="text-[11px] text-slate-400">
                পড়ার সময় একঘেয়েমি কাটাতে বাস্তবসম্মত সাউন্ড সিলেক্ট করুন অথবা টেস্ট বাটনে ক্লিক করে এখনই শুনুন
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestSound('bell')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  isPreviewing === 'bell'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md animate-pulse'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-100'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{isPreviewing === 'bell' ? '🔔 বেল বাজছে...' : 'তিব্বতি বেল টেস্ট 🔔'}</span>
              </button>
              <button
                onClick={() => handleTestSound('chime')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                  isPreviewing === 'chime'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-md animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isPreviewing === 'chime' ? '🎶 ঘণ্টা বাজছে...' : 'সমাপ্তি ঘণ্টা টেস্ট 🎶'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { id: 'none', label: '🔇 মিউট (নীরব)', desc: 'কোনো সাউন্ড থাকবে না' },
              { id: 'rain', label: '🌧️ স্নিগ্ধ বৃষ্টি (Rain)', desc: 'বৃষ্টির নরম ফোঁটার শব্দ' },
              { id: 'waves', label: '🌊 সমুদ্রের ঢেউ (Waves)', desc: 'শান্ত স্রোতের ছন্দ' },
              { id: 'whitenoise', label: '📻 পিংক নয়েজ (White)', desc: 'মনোযোগ ধরে রাখার সাউন্ড' },
              { id: 'forest', label: '🌿 অরণ্য ও বাতাস (Forest)', desc: 'শান্ত প্রকৃতি ও স্নিগ্ধ পরিবেশ' },
            ].map((amb) => {
              const isSelected = ambientSound === amb.id;
              const isCurrentlyPlayingPreview = isPreviewing === amb.id;

              return (
                <div
                  key={amb.id}
                  className={`p-3 rounded-2xl border transition flex flex-col justify-between text-left ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setAmbientSound(amb.id as AmbientSound);
                        if (amb.id !== 'none' && !isRunning) {
                          handleTestSound(amb.id as any);
                        }
                      }}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {amb.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {amb.desc}
                      </div>
                    </button>
                  </div>

                  {amb.id !== 'none' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleTestSound(amb.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                          isCurrentlyPlayingPreview
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-100'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isCurrentlyPlayingPreview ? 'বাজছে (স্টপ)' : 'সাউন্ড চেক'}</span>
                      </button>

                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {isRunning ? '▶ সক্রিয়' : 'সিলেক্টেড'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completed Session KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              আজ সম্পন্ন সেশন: {completedSessions} টি
            </div>
            <div className="text-xs text-slate-500 mt-0.5">প্রতি সেশনে ২৫ মিনিট নিবিড় পড়াশোনা</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              পোমোডোরো নিয়ম (Pomodoro Method)
            </div>
            <div className="text-xs text-slate-500 mt-0.5">৪টি সেশন পর একটি দীর্ঘ (১৫ মিনিট) বিরতি নিন</div>
          </div>
        </div>
      </div>
    </div>
  );
};

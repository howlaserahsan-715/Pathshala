import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Clock, 
  BookOpen,
  FastForward,
  Sparkles,
  Radio,
  CheckCircle2,
  SkipBack,
  SkipForward,
  Waves
} from 'lucide-react';
import { PodcastChapter } from '../types';
import { audioEngine } from '../utils/audio';

interface AudioPodcastProps {
  chapters: PodcastChapter[];
}

export const AudioPodcast: React.FC<AudioPodcastProps> = ({ chapters }) => {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<{
    chunkIndex: number;
    totalChunks: number;
    currentSentence: string;
  } | null>(null);

  const currentChapter = chapters[selectedChapterIndex] || chapters[0];

  // Clean up on component unmount only
  useEffect(() => {
    return () => {
      audioEngine.stopSpeaking();
    };
  }, []);

  // Main chapter player function: sets active chapter & begins speech immediately
  const playChapter = (index: number) => {
    const chapter = chapters[index];
    if (!chapter) return;

    audioEngine.stopSpeaking();
    setSelectedChapterIndex(index);
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentProgress(null);

    audioEngine.speakBangla(
      chapter.speechText,
      speed,
      // onEnd: automatically play next chapter if available
      () => {
        if (index + 1 < chapters.length) {
          setTimeout(() => {
            playChapter(index + 1);
          }, 600);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentProgress(null);
        }
      },
      // onError
      () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentProgress(null);
      },
      // onProgress
      (chunkIndex, totalChunks, sentence) => {
        setCurrentProgress({ chunkIndex, totalChunks, currentSentence: sentence });
      }
    );
  };

  // Toggle play/pause for the currently selected chapter
  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      audioEngine.pauseSpeaking();
      setIsPaused(true);
    } else if (isPlaying && isPaused) {
      audioEngine.resumeSpeaking();
      setIsPaused(false);
    } else {
      playChapter(selectedChapterIndex);
    }
  };

  // Click handler for any chapter in the playlist
  const handlePlaylistCardClick = (index: number) => {
    if (selectedChapterIndex === index && isPlaying) {
      if (isPaused) {
        audioEngine.resumeSpeaking();
        setIsPaused(false);
      } else {
        audioEngine.pauseSpeaking();
        setIsPaused(true);
      }
    } else {
      playChapter(index);
    }
  };

  const handleStop = () => {
    audioEngine.stopSpeaking();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentProgress(null);
  };

  const handleRestart = () => {
    playChapter(selectedChapterIndex);
  };

  const handlePrevChapter = () => {
    const prevIdx = (selectedChapterIndex - 1 + chapters.length) % chapters.length;
    playChapter(prevIdx);
  };

  const handleNextChapter = () => {
    const nextIdx = (selectedChapterIndex + 1) % chapters.length;
    playChapter(nextIdx);
  };

  const toggleSpeed = () => {
    const speeds = [0.8, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    audioEngine.setPlaybackRate(nextSpeed);
  };

  const handleQuickVoiceTest = () => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    audioEngine.stopSpeaking();
    audioEngine.playSingingBowl();

    setTimeout(() => {
      audioEngine.speakBangla(
        'পাঠশালা স্টাডি রুমে আপনাকে স্বাগতম। আপনার স্পিকার ও ভয়েস অডিও সিস্টেম সম্পূর্ণ সক্রিয় রয়েছে।',
        1.0,
        () => {
          audioEngine.playChime(true);
          setIsTestingVoice(false);
        },
        () => setIsTestingVoice(false)
      );
    }, 600);
  };

  const progressPercent = currentProgress 
    ? Math.round((currentProgress.chunkIndex / currentProgress.totalChunks) * 100) 
    : isPlaying ? 25 : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Headphones className="w-4 h-4" />
            <span>অডিও লার্নিং ও লাইভ ব্রডকাস্ট পডকাস্ট</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Study Podcast Audio Series
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            যাতায়াত বা বিশ্রামের সময়েও চোখ বন্ধ করে গুরুত্বপূর্ণ সরকারি চাকরি ও শিক্ষক নিয়োগের অডিও লেকচার শুনুন
          </p>
        </div>

        {/* Quick Voice Sound Checker */}
        <button
          onClick={handleQuickVoiceTest}
          disabled={isTestingVoice}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
            isTestingVoice
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-2 ring-amber-400 animate-pulse'
              : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
          }`}
          title="ভয়েস ও অডিও সিস্টেম চেক করুন"
        >
          <Volume2 className={`w-4 h-4 ${isTestingVoice ? 'animate-bounce' : ''}`} />
          <span>{isTestingVoice ? '🎙️ অডিও টেস্ট চলছে...' : '🎙️ ভয়েস সাউন্ড টেস্ট'}</span>
        </button>
      </div>

      {/* Main Podcast Player Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Animated Vinyl / Artwork */}
          <div className="w-44 h-44 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-1 shadow-2xl flex items-center justify-center shrink-0 relative group">
            <div className={`w-full h-full rounded-2xl bg-indigo-950/80 flex flex-col items-center justify-center text-center p-4 border border-white/10 ${
              isPlaying && !isPaused ? 'ring-2 ring-emerald-400 shadow-emerald-500/30 shadow-xl' : ''
            }`}>
              <Headphones className={`w-12 h-12 text-indigo-400 mb-2 ${isPlaying && !isPaused ? 'animate-bounce text-emerald-400' : ''}`} />
              <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-widest">
                পাঠশালা ব্রডকাস্ট
              </span>
              <span className="text-xs font-semibold text-white/80 mt-1 line-clamp-1">
                অধ্যায় {selectedChapterIndex + 1} / {chapters.length}
              </span>

              {/* Live Audio Equalizer Waveform */}
              {isPlaying && !isPaused ? (
                <div className="flex items-end justify-center gap-1 mt-3 h-5">
                  <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-5" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2" />
                  <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-4" />
                </div>
              ) : (
                <div className="text-[10px] text-indigo-300/60 mt-3 font-mono">
                  {isPaused ? '⏸️ পজ করা' : 'প্রস্তুত'}
                </div>
              )}
            </div>
          </div>

          {/* Chapter Details & Controls */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  অধ্যায় {selectedChapterIndex + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10">
                  {currentChapter.subject}
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {currentChapter.durationText}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black leading-snug">
                {currentChapter.title}
              </h3>
              <p className="text-xs text-indigo-200/90 mt-1 line-clamp-2">
                {currentChapter.summary}
              </p>
            </div>

            {/* Currently spoken sentence highlight */}
            {isPlaying && currentProgress && (
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-200 animate-fade-in text-left">
                <div className="flex items-center justify-between text-[10px] text-white/60 mb-1 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    🎙️ এখন ব্রডকাস্ট হচ্ছে:
                  </span>
                  <span>বাক্য {currentProgress.chunkIndex} / {currentProgress.totalChunks}</span>
                </div>
                <div className="font-semibold text-white leading-relaxed">
                  "{currentProgress.currentSentence}"
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-indigo-200/70 font-mono">
                <span>{isPlaying ? (isPaused ? '⏸️ পজ করা আছে' : '🎙️ ভয়েস সম্প্রচার চলছে...') : 'রেডি'}</span>
                <span>{progressPercent}%</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 pt-1 flex-wrap">
              {/* Previous Chapter */}
              <button
                onClick={handlePrevChapter}
                title="পূর্ববর্তী অধ্যায়"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer active:scale-95"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Main Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                title={isPlaying && !isPaused ? 'পজ করুন' : 'প্লে করুন'}
                className="w-14 h-14 rounded-2xl bg-white text-indigo-950 hover:bg-indigo-50 font-black shadow-lg shadow-white/10 flex items-center justify-center transition transform active:scale-95 cursor-pointer ring-4 ring-white/20"
              >
                {isPlaying && !isPaused ? (
                  <Pause className="w-6 h-6 fill-current text-indigo-950" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5 text-indigo-950" />
                )}
              </button>

              {/* Next Chapter */}
              <button
                onClick={handleNextChapter}
                title="পরবর্তী অধ্যায়"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer active:scale-95"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Restart */}
              <button
                onClick={handleRestart}
                title="শুরু থেকে আবার শুনুন"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Stop */}
              <button
                onClick={handleStop}
                title="স্টপ করুন"
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer active:scale-95"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>

              {/* Speed */}
              <button
                onClick={toggleSpeed}
                title="গতি পরিবর্তন করুন"
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{speed}x গতি</span>
              </button>

              {/* Toggle Script */}
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  showTranscript ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showTranscript ? 'স্ক্রিপ্ট লুকান' : 'স্ক্রিপ্ট'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Playlist Grid - 5 Chapters with direct Play/Pause controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600" />
            <span>পডকাস্ট প্লেলিস্ট অধ্যায়সমূহ ({chapters.length} টি)</span>
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            যেকোনো অধ্যায়ে ক্লিক করে সরাসরি ভয়েস লেকচার শুনুন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {chapters.map((chap, idx) => {
            const isThisSelected = selectedChapterIndex === idx;
            const isThisPlaying = isThisSelected && isPlaying && !isPaused;
            const isThisPaused = isThisSelected && isPlaying && isPaused;

            return (
              <div
                key={chap.id}
                onClick={() => handlePlaylistCardClick(idx)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between group hover:shadow-md relative overflow-hidden ${
                  isThisSelected
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                {/* Active indicator bar */}
                {isThisSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-400" />
                )}

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      অধ্যায় {idx + 1} • {chap.subject}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {chap.durationText}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {chap.title}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {chap.summary}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isThisPlaying ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>🎙️ সম্প্রচার চলছে</span>
                      </span>
                    ) : isThisPaused ? (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        ⏸️ পজ করা আছে
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {isThisSelected ? 'প্লে করতে চাপুন' : 'শুনুন'}
                      </span>
                    )}
                  </div>

                  {/* Dedicated Action Button on Card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaylistCardClick(idx);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition shadow-xs cursor-pointer ${
                      isThisPlaying
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                        : isThisSelected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white'
                    }`}
                    title={isThisPlaying ? 'পজ করুন' : 'প্লে করুন'}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transcript View */}
      {showTranscript && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>
                অধ্যায় {selectedChapterIndex + 1}-এর সম্পূর্ণ অডিও স্ক্রিপ্ট (Full Audio Script):
              </span>
            </h4>
            <button
              onClick={handlePlayPause}
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isPlaying && !isPaused ? 'পজ করুন' : 'অডিও শুনুন'}</span>
            </button>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 font-sans">
            {currentChapter.speechText}
          </div>
        </div>
      )}
    </div>
  );
};

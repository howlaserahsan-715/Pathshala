import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Video, 
  Lightbulb, 
  CheckCircle2, 
  Circle, 
  Repeat, 
  X, 
  ExternalLink,
  Clock,
  Filter,
  FileText,
  FileCheck2,
  Sparkles,
  Volume2,
  VolumeX,
  BookmarkPlus,
  Play,
  Award,
  Layers,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Building2,
  ChevronRight
} from 'lucide-react';
import { SyllabusItem, SubjectType, TopicStudyModule } from '../types';
import { CHAPTER_STUDY_MODULES } from '../data/chapterModulesData';
import { audioEngine } from '../utils/audio';

interface SyllabusLessonsProps {
  syllabus: SyllabusItem[];
  completedTopics: string[];
  onToggleComplete: (subject: string, topic: string) => void;
  onOpenConcept: (subject: string, topic: string) => void;
  onAddToRevision: (subject: string, topic: string) => void;
  selectedSubjectFilter?: string;
  onStartPomodoro?: () => void;
}

export const SyllabusLessons: React.FC<SyllabusLessonsProps> = ({
  syllabus,
  completedTopics,
  onToggleComplete,
  onOpenConcept,
  onAddToRevision,
  selectedSubjectFilter,
  onStartPomodoro,
}) => {
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState<string>(selectedSubjectFilter || 'all');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('all');
  
  // Selected Active Topic Module (Defaults to the first module)
  const [selectedModule, setSelectedModule] = useState<TopicStudyModule>(CHAPTER_STUDY_MODULES[0]);
  const [activeDetailTab, setActiveDetailTab] = useState<'mcq' | 'written' | 'reference' | 'video'>('mcq');

  // Interactive states for MCQ testing inside the module
  const [revealedMCQs, setRevealedMCQs] = useState<Record<number, number>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  const subjects = [
    'all',
    'বাংলা ভাষা ও সাহিত্য',
    'English Language & Literature',
    'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    'বাংলাদেশ বিষয়াবলী',
    'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি',
  ];

  const examCategories = [
    { id: 'all', label: 'সকল চাকরি পরীক্ষা' },
    { id: '১১-২০তম গ্রেড', label: '🏛️ ১১-২০তম গ্রেড সরকারি চাকরি' },
    { id: 'প্রাথমিক শিক্ষক', label: '🏫 প্রাথমিক শিক্ষক নিয়োগ (DPE)' },
    { id: 'NTRCA', label: '🎓 NTRCA শিক্ষক নিবন্ধন' },
    { id: 'বিসিএস', label: '📜 বিসিএস ও পিএসসি' },
  ];

  // Filter modules
  const filteredModules = CHAPTER_STUDY_MODULES.filter((m) => {
    const matchSubject = activeSubject === 'all' || m.subject === activeSubject;
    const matchExam = selectedExamFilter === 'all' || m.targetExams.some((e) => e.includes(selectedExamFilter));
    const matchQuery =
      m.topicTitle.toLowerCase().includes(search.toLowerCase()) ||
      m.chapter.toLowerCase().includes(search.toLowerCase()) ||
      m.referenceSource.summaryNotes.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchExam && matchQuery;
  });

  const handleSelectMCQ = (qIdx: number, optIdx: number) => {
    audioEngine.playTick();
    setRevealedMCQs((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSpeakNotes = (text: string) => {
    if (isSpeaking) {
      audioEngine.stopSpeaking();
      setIsSpeaking(false);
    } else {
      audioEngine.stopSpeaking();
      setIsSpeaking(true);
      audioEngine.speakBangla(
        text,
        1.0,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const isCompleted = completedTopics.includes(`${selectedModule.subject}|${selectedModule.topicTitle}`);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800">
              <BookOpen className="w-3.5 h-3.5" />
              <span>অধ্যায়ভিত্তিক সমন্বিত স্টাডি হাব (Chapter-wise Study Hub)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              ১১-২০তম গ্রেড, প্রাইমারি ও শিক্ষক নিবন্ধন চ্যাপ্টার স্টাডি রুম
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              যেকোনো অধ্যায় নির্বাচন করুন: একই সাথে পাবেন বিগত সালের <b>এমসিকিউ</b>, <b>লিখিত প্রশ্ন ও সমাধান</b>, <b>প্রামাণ্য রেফারেন্স নোট</b> এবং <b>ইউটিউব ক্লাস</b>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleComplete(selectedModule.subject, selectedModule.topicTitle)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span>{isCompleted ? 'টপিক সম্পন্ন ✓' : 'পড়া শেষ হলে সম্পন্ন মার্ক করুন'}</span>
            </button>

            {onStartPomodoro && (
              <button
                onClick={onStartPomodoro}
                title="পোমোডোরো শুরু করুন"
                className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>পোমোডোরো</span>
              </button>
            )}
          </div>
        </div>

        {/* Exam Target & Search Filter Row */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> পরীক্ষা অনুযায়ী:
            </span>
            {examCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedExamFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedExamFilter === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-4">
              <select
                value={activeSubject}
                onChange={(e) => setActiveSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="all">সকল বিষয় (All Subjects)</option>
                {subjects.filter(s => s !== 'all').map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="চ্যাপ্টার বা টপিক খুঁজুন (যেমন: সমাস, ঐকিক নিয়ম, লাভ-ক্ষতি, Preposition, সংবিধান, কম্পিউটার)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Left Chapter Selector | Right Detailed Study Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chapters / Topics List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            উপলব্ধ চ্যাপ্টার ও টপিক তালিকা ({filteredModules.length} টি)
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredModules.map((mod) => {
              const isSelected = selectedModule.id === mod.id;
              const isDone = completedTopics.includes(`${mod.subject}|${mod.topicTitle}`);

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedModule(mod);
                    setRevealedMCQs({});
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-left relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {mod.subject.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{mod.estimatedMinutes} মি.</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {mod.topicTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {mod.chapter}
                  </p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                    <span>{mod.pastMCQs.length}টি বিগত MCQ</span>
                    <span>•</span>
                    <span>{mod.pastWrittenQuestions.length}টি লিখিত প্রশ্ন</span>
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Chapter Study Center */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Active Module Header */}
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/60 dark:border-indigo-800">
                {selectedModule.subject}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {selectedModule.chapter}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {selectedModule.topicTitle}
            </h3>

            {/* Target Exam Tags */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400">প্রযোজ্য পরীক্ষা:</span>
              {selectedModule.targetExams.map((ex) => (
                <span key={ex} className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {ex}
                </span>
              ))}
            </div>
          </div>

          {/* Module 4 Tabs Switcher */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveDetailTab('mcq')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeDetailTab === 'mcq'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>বিগত MCQ ({selectedModule.pastMCQs.length})</span>
            </button>

            <button
              onClick={() => setActiveDetailTab('written')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeDetailTab === 'written'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>লিখিত প্রশ্ন ({selectedModule.pastWrittenQuestions.length})</span>
            </button>

            <button
              onClick={() => setActiveDetailTab('reference')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeDetailTab === 'reference'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>রেফারেন্স ও নোটস</span>
            </button>

            <button
              onClick={() => setActiveDetailTab('video')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeDetailTab === 'video'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>ইউটিউব ক্লাস</span>
            </button>
          </div>

          {/* ---------------- TAB 1: বিগত সালের এমসিকিউ (MCQs) ---------------- */}
          {activeDetailTab === 'mcq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>এই চ্যাপ্টারের বিগত চাকরির এমসিকিউ প্রশ্নসমূহ:</span>
                <span>সরাসরি অপশন সিলেক্ট করে প্র্যাকটিস করুন</span>
              </div>

              {selectedModule.pastMCQs.map((q, idx) => {
                const userAns = revealedMCQs[idx];
                const isAnswered = userAns !== undefined;
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-600 dark:text-indigo-400">{q.examName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]">
                        {q.grade}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </h4>

                    {/* Options with English Badges (A, B, C, D) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isThisSelected = userAns === optIdx;
                        const isThisCorrect = optIdx === q.correctIndex;

                        let style = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                        if (isAnswered) {
                          if (isThisCorrect) style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                          else if (isThisSelected) style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectMCQ(idx, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center bg-slate-100 dark:bg-slate-700 shrink-0">
                                {['A', 'B', 'C', 'D'][optIdx]}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isAnswered && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="mt-2 p-3 rounded-xl bg-indigo-50/60 dark:bg-slate-800/70 border border-indigo-100 dark:border-slate-700 text-xs space-y-1">
                        <div className="font-bold text-indigo-700 dark:text-indigo-300">
                          সঠিক উত্তর: Option {['A', 'B', 'C', 'D'][q.correctIndex]} ({q.options[q.correctIndex]})
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ---------------- TAB 2: বিগত সালের লিখিত প্রশ্ন ও সমাধান (Written Q&A) ---------------- */}
          {activeDetailTab === 'written' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>১১-২০তম গ্রেডের সরকারি চাকরির বিগত লিখিত প্রশ্ন ও আদর্শ সমাধান:</span>
                <span className="text-indigo-600">নম্বর বণ্টন ও পরীক্ষকের টিপস সহ</span>
              </div>

              {selectedModule.pastWrittenQuestions.map((wq) => (
                <div key={wq.id} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 bg-slate-50/30 dark:bg-slate-800/20">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200/60 dark:border-amber-900">
                      {wq.examTitle} ({wq.gradeLevel})
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                      পূর্ণমান: {wq.marks} নম্বর
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white leading-relaxed">
                    প্রশ্ন: {wq.question}
                  </h4>

                  {/* Model Answer Box */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      আদর্শ লিখিত সমাধান (Model Answer):
                    </span>
                    <pre className="font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {wq.modelAnswer}
                    </pre>
                  </div>

                  <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 pt-1">
                    <span>💡</span>
                    <span><b>পরীক্ষকের টিপস:</b> {wq.examTip}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------------- TAB 3: প্রামাণ্য রেফারেন্স ও স্টাডি নোট (Reference Notes) ---------------- */}
          {activeDetailTab === 'reference' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {selectedModule.referenceSource.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    উৎস: {selectedModule.referenceSource.authority}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeakNotes(selectedModule.referenceSource.summaryNotes)}
                    className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 hover:bg-indigo-100 transition"
                    title="বাংলায় অডিও শুনুন"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <a
                    href={selectedModule.referenceSource.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
                  >
                    <span>মূল রেফারেন্স সাইট</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Summary Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedModule.referenceSource.summaryNotes}
              </div>

              {/* Key Rules Breakdown */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  মনে রাখার মূল নিয়ম ও শর্টকাট সূত্র:
                </h5>
                <div className="space-y-2">
                  {selectedModule.referenceSource.keyRules.map((rule, rIdx) => (
                    <div key={rIdx} className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/50 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {rIdx + 1}
                      </span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spaced Revision Bookmark CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onAddToRevision(selectedModule.subject, selectedModule.topicTitle)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>টপিকটি স্পেসড রিভিশন কিউতে যোগ করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- TAB 4: ইউটিউব ক্লাস (Dedicated Video Class) ---------------- */}
          {activeDetailTab === 'video' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>{selectedModule.youtubeVideoTitle}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ১১-২০তম গ্রেড, প্রাথমিক শিক্ষক ও NTRCA প্রস্তুতির জন্য বাছাইকৃত সেরা ক্লাস
                  </p>
                </div>

                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedModule.topicTitle + ' ১১-২০ গ্রেড চাকরি ও প্রাথমিক শিক্ষক')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1 border border-rose-200 dark:border-rose-900"
                >
                  <span>ইউটিউবে আরও ক্লাস দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Embedded Player */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedModule.youtubeEmbedId}`}
                  title={selectedModule.youtubeVideoTitle}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

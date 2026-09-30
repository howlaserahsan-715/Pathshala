import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Target, 
  Flame, 
  Play, 
  Sparkles,
  Award,
  Timer
} from 'lucide-react';
import { DailyPlannerTask, TargetExamCountdown } from '../types';
import { audioEngine } from '../utils/audio';

interface ExamPlannerProps {
  onStartPomodoro?: () => void;
}

export const ExamPlanner: React.FC<ExamPlannerProps> = ({ onStartPomodoro }) => {
  // Preset Target Exams
  const [exams, setExams] = useState<TargetExamCountdown[]>(() => {
    const saved = localStorage.getItem('pathsala_target_exams');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'exam-primary',
        name: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ পরীক্ষা',
        targetDate: '2026-11-15',
        authority: 'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয় (DPE)',
        vacancyInfo: '১৩তম গ্রেড (১৩,৮৮১+ সহকারী শিক্ষক পদ)',
        color: 'from-emerald-600 to-teal-700',
      },
      {
        id: 'exam-ntrca-19',
        name: '১৯তম শিক্ষক নিবন্ধন প্রিলিমিনারি পরীক্ষা (NTRCA)',
        targetDate: '2026-12-20',
        authority: 'বেসরকারি শিক্ষক নিবন্ধন ও প্রত্যয়ন কর্তৃপক্ষ (NTRCA)',
        vacancyInfo: 'স্কুল, স্কুল-২ ও কলেজ পর্যায়ের এমপিওভুক্ত শিক্ষক পদ',
        color: 'from-violet-600 to-purple-700',
      },
      {
        id: 'exam-grade11-20',
        name: '১১-২০তম গ্রেড মেগা নিয়োগ (সিএজি অডিটর ও অফিস সহকারী)',
        targetDate: '2026-10-25',
        authority: 'হিসাব মহানিয়ন্ত্রক ও বিভিন্ন মন্ত্রণালয়/অধিদপ্তর',
        vacancyInfo: 'অডিটর (১১তম গ্রেড), সাঁট-মুদ্রাক্ষরিক ও অফিস সহকারী (১৬তম গ্রেড)',
        color: 'from-amber-600 to-orange-700',
      },
      {
        id: 'exam-banks',
        name: 'সমন্বিত ৮ ব্যাংক অফিসার ও ক্যাশ অফিসার নিয়োগ পরীক্ষা',
        targetDate: '2026-12-05',
        authority: 'ব্যাংকার্স সিলেকশন কমিটি (বাংলাদেশ ব্যাংক)',
        vacancyInfo: '১০ম গ্রেড অফিসার ও ক্যাশ পদ',
        color: 'from-blue-600 to-indigo-700',
      }
    ];
  });

  // Daily Tasks List
  const [tasks, setTasks] = useState<DailyPlannerTask[]>(() => {
    const saved = localStorage.getItem('pathsala_daily_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 't-1', title: 'প্রাথমিক শিক্ষক নিয়োগ: বিগত সালের ২০টি পাটিগণিত ও ঐকিক নিয়ম', category: 'গণিত', durationMinutes: 45, isCompleted: true, priority: 'High' },
      { id: 't-2', title: 'NTRCA প্রিলিমিনারি: সন্ধি, সমাস ও কারক বিভক্তি রিভিশন', category: 'বাংলা', durationMinutes: 40, isCompleted: false, priority: 'High' },
      { id: 't-3', title: '১১-২০তম গ্রেড: ইংরেজি Appropriate Preposition ও বানান শুদ্ধি', category: 'English', durationMinutes: 30, isCompleted: false, priority: 'Normal' },
      { id: 't-4', title: 'বাংলাদেশ ও আন্তর্জাতিক: সাম্প্রতিক ১০টি গুরুত্বপূর্ণ সাধারণ জ্ঞান নোট', category: 'জিকে', durationMinutes: 25, isCompleted: false, priority: 'Normal' }
    ];
  });

  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('সাধারণ');
  const [newTaskDuration, setNewTaskDuration] = useState(30);

  // New custom exam modal state
  const [showAddExam, setShowAddExam] = useState(false);
  const [customExamName, setCustomExamName] = useState('');
  const [customExamDate, setCustomExamDate] = useState('2026-12-31');
  const [customAuthority, setCustomAuthority] = useState('');

  // Save tasks and exams to localStorage
  useEffect(() => {
    localStorage.setItem('pathsala_daily_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pathsala_target_exams', JSON.stringify(exams));
  }, [exams]);

  // Real-time Countdown Calculator
  const getRemainingTime = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, isPassed: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, isPassed: false };
  };

  const handleToggleTask = (id: string) => {
    audioEngine.playTick();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: DailyPlannerTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      durationMinutes: newTaskDuration,
      isCompleted: false,
      priority: 'Normal',
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    audioEngine.playChime(false);
  };

  const handleAddCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExamName.trim() || !customExamDate) return;

    const newEx: TargetExamCountdown = {
      id: `ex-${Date.now()}`,
      name: customExamName.trim(),
      targetDate: customExamDate,
      authority: customAuthority.trim() || 'নিয়োগ কর্তৃপক্ষ',
      color: 'from-violet-600 to-purple-700',
    };

    setExams([...exams, newEx]);
    setCustomExamName('');
    setShowAddExam(false);
  };

  // Completion calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPlannedMinutes = tasks.reduce((acc, t) => acc + t.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200/60 dark:border-indigo-800">
            <Target className="w-3.5 h-3.5" />
            <span>পরীক্ষার কাউন্টডাউন ও দৈনিক স্টাডি প্ল্যানার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Exam Countdown & Daily Study Routine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            লক্ষ্য স্থির রাখুন, প্রতিটি দিনের পড়ার রুটিন পূরণ করুন এবং পরীক্ষার বাকি দিনগুলোর ট্র্যাক রাখুন
          </p>
        </div>

        <button
          onClick={() => setShowAddExam(!showAddExam)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-bold text-xs hover:bg-indigo-100 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পরীক্ষার কাউন্টডাউন যোগ করুন</span>
        </button>
      </div>

      {/* Add Custom Exam Form */}
      {showAddExam && (
        <form onSubmit={handleAddCustomExam} className="bg-indigo-50/50 dark:bg-slate-800/80 p-5 rounded-3xl border border-indigo-200 dark:border-slate-700 space-y-4 animate-fade-in">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            নতুন টার্গেট পরীক্ষার কাউন্টডাউন সেট করুন
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">পরীক্ষার নাম</label>
              <input
                type="text"
                required
                value={customExamName}
                onChange={(e) => setCustomExamName(e.target.value)}
                placeholder="যেমন: ৪৭তম বিসিএস বা ব্যাংক অফিসার"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">পরীক্ষার সম্ভাব্য তারিখ</label>
              <input
                type="date"
                required
                value={customExamDate}
                onChange={(e) => setCustomExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">কর্তৃপক্ষ / পদ বিবরণ</label>
              <input
                type="text"
                value={customAuthority}
                onChange={(e) => setCustomAuthority(e.target.value)}
                placeholder="যেমন: BPSC / বাংলাদেশ ব্যাংক"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddExam(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              সেভ করুন
            </button>
          </div>
        </form>
      )}

      {/* Countdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map((ex) => {
          const rem = getRemainingTime(ex.targetDate);
          return (
            <div
              key={ex.id}
              className={`rounded-3xl p-6 text-white bg-gradient-to-tr ${ex.color} shadow-lg relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                  {ex.authority}
                </span>
                <h3 className="font-black text-lg sm:text-xl leading-tight pt-1">
                  {ex.name}
                </h3>
                {ex.vacancyInfo && (
                  <p className="text-xs text-white/80">{ex.vacancyInfo}</p>
                )}
              </div>

              {/* Countdown Digits */}
              <div className="pt-6 relative z-10">
                <div className="text-[11px] font-bold text-white/80 mb-1">পরীক্ষার বাকি আর:</div>
                <div className="flex items-center gap-2 font-mono">
                  <div className="bg-black/25 backdrop-blur-md rounded-2xl px-3 py-2 text-center flex-1">
                    <div className="text-2xl sm:text-3xl font-black">{rem.days}</div>
                    <div className="text-[10px] uppercase font-bold text-white/70">দিন</div>
                  </div>
                  <div className="bg-black/25 backdrop-blur-md rounded-2xl px-3 py-2 text-center flex-1">
                    <div className="text-2xl sm:text-3xl font-black">{rem.hours}</div>
                    <div className="text-[10px] uppercase font-bold text-white/70">ঘণ্টা</div>
                  </div>
                  <div className="bg-black/25 backdrop-blur-md rounded-2xl px-3 py-2 text-center flex-1">
                    <div className="text-2xl sm:text-3xl font-black">{rem.minutes}</div>
                    <div className="text-[10px] uppercase font-bold text-white/70">মিনিট</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Routine Planner Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>আজকের পড়ার রুটিন ও ডেইলি টাস্ক প্ল্যানার</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              আজকের টার্গেট সম্পন্ন করুন এবং প্রতিটি পড়া শেষে পোমোডোরো শুরু করুন
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                অগ্রগতি: {completedTasks}/{totalTasks} টি
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold">{taskProgressPct}% সম্পন্ন</div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-100 dark:border-indigo-950 flex items-center justify-center font-bold text-xs text-indigo-600">
              {taskProgressPct}%
            </div>
          </div>
        </div>

        {/* Add New Task Form */}
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="আজকের নতুন পড়ার বিষয় লিখুন (যেমন: শতকরা ৫টি টাইপ, কারক ও বিভক্তি)..."
            className="flex-1 w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
          />

          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <option value="বাংলা">বাংলা</option>
            <option value="English">English</option>
            <option value="গণিত">গণিত</option>
            <option value="বাংলাদেশ">বাংলাদেশ</option>
            <option value="আন্তর্জাতিক">আন্তর্জাতিক</option>
            <option value="বিজ্ঞান">বিজ্ঞান</option>
          </select>

          <input
            type="number"
            min="10"
            max="180"
            value={newTaskDuration}
            onChange={(e) => setNewTaskDuration(parseInt(e.target.value) || 25)}
            className="w-20 px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-center"
            title="মিনিট"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 shrink-0 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>টাস্ক যোগ করুন</span>
          </button>
        </form>

        {/* Tasks List */}
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                task.isCompleted
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="text-slate-400 hover:text-emerald-600 shrink-0"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </button>

                <div className="min-w-0">
                  <span className={`text-xs sm:text-sm font-bold block truncate ${
                    task.isCompleted
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {task.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.durationMinutes} মিনিট
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onStartPomodoro && !task.isCompleted && (
                  <button
                    onClick={onStartPomodoro}
                    title="এই বিষয়ের জন্য পোমোডোরো শুরু করুন"
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition"
                  >
                    <Timer className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  title="টাস্ক মুছুন"
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

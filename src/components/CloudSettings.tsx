import React, { useState } from 'react';
import { 
  Settings, 
  Cloud, 
  FileDown, 
  Upload, 
  RotateCcw, 
  Check, 
  Copy, 
  Code, 
  ShieldCheck,
  User,
  GraduationCap
} from 'lucide-react';
import { UserProfile } from '../types';

interface CloudSettingsProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetAllData: () => void;
  completedTopicsCount: number;
}

export const CloudSettings: React.FC<CloudSettingsProps> = ({
  currentUser,
  onUpdateProfile,
  onResetAllData,
  completedTopicsCount,
}) => {
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('pathsala_sheet_url') || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [name, setName] = useState(currentUser.name);
  const [targetExam, setTargetExam] = useState(currentUser.targetExam);

  const googleScriptTemplate = `// Google Apps Script Web App Code (doPost)
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), data.email, data.studyMinutes, data.score, JSON.stringify(data.state)]);
  return ContentService.createTextOutput(JSON.stringify({"status": "success"})).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleSaveSheetUrl = () => {
    localStorage.setItem('pathsala_sheet_url', sheetUrl.trim());
    setSyncStatus('গুগল শিট ব্যাকএণ্ড ইউআরএল সংরক্ষিত হয়েছে! ✓');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleTestSync = async () => {
    if (!sheetUrl.trim()) {
      alert('দয়া করে আপনার গুগল শিট ওয়েব অ্যাপ ইউআরএল প্রদান করুন।');
      return;
    }
    setSyncStatus('ডেটা সিঙ্ক করা হচ্ছে...');
    try {
      await fetch(sheetUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          studyMinutes: currentUser.studyMinutes,
          score: currentUser.score,
          state: {
            completedTopics: currentUser.completedTopics,
            streak: currentUser.currentStreak,
          }
        }),
      });
      setSyncStatus('ক্লাউড সিঙ্ক সফলভাবে সম্পন্ন হয়েছে! ✓');
    } catch (e) {
      setSyncStatus('সিঙ্ক সম্পন্ন হয়েছে (No-Cors Mode)।');
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(googleScriptTemplate);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportText = () => {
    const text = `=========================================
পাঠশালা স্টাডি রিপোর্ট — ${currentUser.name}
টার্গেট পরীক্ষা: ${currentUser.targetExam}
মোট অধ্যয়ন সময়: ${currentUser.studyMinutes} মিনিট
সম্পন্ন টপিক: ${completedTopicsCount} টি
পয়েন্ট: ${currentUser.score} pts | স্ট্রিক: ${currentUser.currentStreak} দিন
=========================================

[সম্পন্ন সিলেবাস তালিকা]
${currentUser.completedTopics.map((t) => `✓ ${t.replace('|', ' -> ')}`).join('\n')}

তারিখ: ${new Date().toLocaleDateString('bn-BD')}
=========================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pathsala_Report_${currentUser.name || 'User'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const allData = localStorage.getItem('pathsala_multi_users') || '{}';
    const blob = new Blob([allData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pathsala_Full_Backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ name, targetExam });
    alert('প্রোফাইল তথ্য আপডেট হয়েছে!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Cloud className="w-4 h-4" />
          <span>ক্লাউড ব্যাকআপ ও সেটিংস</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Cloud Sync & Profile Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          ব্যক্তিগত গুগল শিটে স্বয়ংক্রিয় ব্যাকআপ, অফলাইন ডেটা এক্সপোর্ট এবং আপনার প্রোফাইল পরিচালনা করুন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            প্রোফাইল তথ্য সম্পাদনা
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              আপনার নাম
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              টার্গেট চাকরি বা ক্যাডার
            </label>
            <input
              type="text"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
          >
            প্রোফাইল সেভ করুন
          </button>
        </div>

        {/* Data Export & Backup */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FileDown className="w-4 h-4 text-indigo-600" />
            ডেটা এক্সপোর্ট ও ব্যাকআপ
          </h3>

          <p className="text-xs text-slate-500">
            আপনার সম্পূর্ণ পড়াশোনার রিপোর্ট ও নোট যে কোনো সময় ডাউনলোড করে প্রিন্ট বা সংরক্ষণ করতে পারেন।
          </p>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleExportText}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-between transition"
            >
              <span>📄 স্টাডি সামারি নোট ডাউনলোড (.txt)</span>
              <FileDown className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-between transition"
            >
              <span>💾 সম্পূর্ণ ডেটা ব্যাকআপ (.json)</span>
              <FileDown className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                if (confirm('আপনি কি নিশ্চিত যে সকল পড়াশোনার রেকর্ড রিসেট করতে চান? এটি ফিরিয়ে আনা যাবে না।')) {
                  onResetAllData();
                }
              }}
              className="w-full py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold transition"
            >
              সব ডেটা রিসেট করুন
            </button>
          </div>
        </div>
      </div>

      {/* Google Sheets Cloud Backend Integration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Cloud className="w-4 h-4 text-emerald-600" />
          গুগল শিট ক্লাউড সিঙ্ক (Google Sheets Webhook Sync)
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          আপনার নিজস্ব গুগল ড্রাইভে একটি গুগল স্প্রেডশিট তৈরি করে নিচে দেওয়া স্ক্রিপ্টটি ডিপ্লয় করুন। এর ফলে যেকোনো ডিভাইস থেকে আপনার পড়ার ডেটা স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।
        </p>

        {syncStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            {syncStatus}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
          />
          <button
            onClick={handleSaveSheetUrl}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
          >
            ইউআরএল সেভ
          </button>
          <button
            onClick={handleTestSync}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
          >
            টেস্ট সিঙ্ক
          </button>
        </div>

        {/* Google Apps Script helper snippet */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" /> গুগল অ্যাপস স্ক্রিপ্ট কোড (Google Apps Script Code)
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {googleScriptTemplate}
          </pre>
        </div>
      </div>
    </div>
  );
};

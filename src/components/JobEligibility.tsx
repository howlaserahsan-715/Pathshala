import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  GraduationCap, 
  Calendar, 
  Briefcase,
  ChevronRight
} from 'lucide-react';

export const JobEligibility: React.FC = () => {
  const [age, setAge] = useState<number>(25);
  const [degree, setDegree] = useState<'masters' | 'honours' | 'pass' | 'hsc'>('honours');
  const [cgpa, setCgpa] = useState<number>(3.2);
  const [quota, setQuota] = useState<'general' | 'ff' | 'tribal'>('general');
  const [discipline, setDiscipline] = useState<'general' | 'engineering' | 'medical' | 'agriculture'>('general');

  // Max age threshold based on quota
  const maxAgeBCS = quota === 'general' ? 30 : 32;
  const maxAgeBank = quota === 'general' ? 30 : 32;
  const maxAgePrimary = quota === 'general' ? 30 : 32;

  const jobChecklist = [
    {
      title: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ',
      org: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)',
      grade: '১৩তম গ্রেড (সহকারী শিক্ষক)',
      eligible: age <= maxAgePrimary && (degree === 'honours' || degree === 'pass' || degree === 'masters'),
      requirements: `বয়স সর্বোচ্চ ${maxAgePrimary} বছর, যে কোনো বিষয়ে ন্যূনতম ২য় বিভাগসহ স্নাতক বা সমমানের ডিগ্রি`,
      tips: 'নারী ও পুরুষ উভয় প্রার্থীদের জন্য স্নাতক আবশ্যক। ৮০ নম্বরের প্রিলিমিনারি ও ২০ নম্বরের ভাইভা।'
    },
    {
      title: 'এনটিআরসিএ (NTRCA) শিক্ষক নিবন্ধন পরীক্ষা',
      org: 'বেসরকারি শিক্ষক নিবন্ধন ও প্রত্যয়ন কর্তৃপক্ষ (NTRCA)',
      grade: 'স্কুল, স্কুল-২ ও কলেজ পর্যায় (এমপিওভুক্ত শিক্ষক)',
      eligible: age <= 35 && (degree === 'honours' || degree === 'pass' || degree === 'masters' || degree === 'hsc'),
      requirements: 'সর্বোচ্চ বয়স ৩৫ বছর। স্কুল পর্যায়ে স্নাতক/সমমান এবং স্কুল-২ বা জুনিয়র পদে এইচএসসি/ডিপ্লোমা গ্রহণযোগ্য',
      tips: '১০০ নম্বরের প্রিলিমিনারিতে ৪০ পেলে পাস। এরপর লিখিত ও মৌখিক পরীক্ষা অনুষ্ঠিত হয়।'
    },
    {
      title: 'সিএজি অডিটর ও জুনিয়র অডিটর নিয়োগ',
      org: 'হিসাব মহানিয়ন্ত্রকের কার্যালয় (CAG) ও প্রতিরক্ষা হিসাব',
      grade: '১১তম ও ১৪তম গ্রেড',
      eligible: age <= maxAgePrimary && (degree === 'honours' || degree === 'pass' || degree === 'masters' || (degree === 'hsc' && age <= maxAgePrimary)),
      requirements: `বয়স সর্বোচ্চ ${maxAgePrimary} বছর, স্নাতক/সমমান (অডিটর) অথবা এইচএসসি পাস (জুনিয়র অডিটর)`,
      tips: '৭০ বা ৮০ নম্বরের এমসিকিউ পরীক্ষায় পাটিগণিত ও ঐকিক নিয়ম এবং সাধারণ জ্ঞান গুরুত্বপূর্ণ।'
    },
    {
      title: 'অফিস সহকারী-কাম-কম্পিউটার মুদ্রাক্ষরিক / ডাটা এন্ট্রি',
      org: 'বিভিন্ন মন্ত্রণালয়, বিভাগ ও সরকারি অধিদপ্তর',
      grade: '১৬তম গ্রেড (নন-গেজেটেড সরকারি চাকরি)',
      eligible: age <= maxAgePrimary && (degree === 'hsc' || degree === 'pass' || degree === 'honours' || degree === 'masters'),
      requirements: `বয়স সর্বোচ্চ ${maxAgePrimary} বছর, উচ্চ মাধ্যমিক (HSC) বা সমমানের পরীক্ষায় উত্তীর্ণ`,
      tips: 'লিখিত/এমসিকিউ পরীক্ষার পর বাংলায় ২০ ও ইংরেজিতে ২০ শব্দ টাইপিং স্পিড টেস্ট হবে।'
    },
    {
      title: 'সমাজসেবা অধিদপ্তর ইউনিয়ন সমাজকর্মী ও পরিবার পরিকল্পনা সহকারী',
      org: 'সমাজসেবা অধিদপ্তর ও পরিবার পরিকল্পনা অধিদপ্তর (DGFP)',
      grade: '১৬তম ও ১৭তম গ্রেড',
      eligible: age <= maxAgePrimary && (degree === 'hsc' || degree === 'pass' || degree === 'honours' || degree === 'masters'),
      requirements: `বয়স সর্বোচ্চ ${maxAgePrimary} বছর, এইচএসসি (HSC) বা সমমানের পরীক্ষায় উত্তীর্ণ`,
      tips: 'বাংলা ব্যাকরণ, সাধারণ গণিত ও সাম্প্রতিক জিকে থেকে অধিকাংশ প্রশ্ন করা হয়।'
    },
    {
      title: 'সম্মিলিত ব্যাংক সিনিয়র অফিসার / অফিসার / ক্যাশ',
      org: 'ব্যাংকার্স সিলেকশন কমিটি (বাংলাদেশ ব্যাংক)',
      grade: '৯ম ও ১০ম গ্রেড',
      eligible: age <= maxAgeBank && (degree === 'honours' || degree === 'masters'),
      requirements: `বয়স সর্বোচ্চ ${maxAgeBank} বছর, স্নাতক বা স্নাতকোত্তর ডিগ্রি (ন্যূনতম একটি ১ম বিভাগ/সিজিপিএ)`,
      tips: 'সোনালী, জনতা, অগ্রণী, রূপালী ব্যাংকের জন্য উচ্চমানের ইংরেজি ও গণিত প্রস্তুতি দরকার।'
    },
    {
      title: 'বিসিএস ও বিপিএসসি নন-ক্যাডার পদসমূহ',
      org: 'বাংলাদেশ সরকারী কর্ম কমিশন (BPSC)',
      grade: '৯ম ও ১০ম গ্রেড',
      eligible: age <= maxAgeBCS && (degree === 'honours' || degree === 'masters') && cgpa >= 2.25,
      requirements: `বয়স সর্বোচ্চ ${maxAgeBCS} বছর, ৪ বছর মেয়াদী স্নাতক/মাস্টার্স ডিগ্রি`,
      tips: '২০০ নম্বরের প্রিলিমিনারি পরীক্ষা অনুষ্ঠিত হয়।'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Target className="w-4 h-4" />
          <span>স্মার্ট চাকরি যোগ্যতা ও সার্কুলার এলিজিবিলিটি</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Smart Job Eligibility Checker
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          আপনার বয়স, শিক্ষাগত ডিগ্রি ও কোটা ইনপুট দিন — নিমেষেই দেখুন কোন কোন সরকারি চাকরির জন্য আপনি শতভাগ যোগ্য
        </p>
      </div>

      {/* Inputs Configuration Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Age Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              আপনার বর্তমান বয়স (বছর)
            </label>
            <input
              type="number"
              min="18"
              max="45"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 18)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Highest Degree */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Highest Degree (সর্বোচ্চ শিক্ষাগত ডিগ্রি)
            </label>
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="masters">Masters / Post Graduation (স্নাতকোত্তর)</option>
              <option value="honours">Bachelor (Honours) / 4-Year Degree</option>
              <option value="pass">Degree Pass Course (3 Years)</option>
              <option value="hsc">HSC / Higher Secondary</option>
            </select>
          </div>

          {/* CGPA */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Graduation CGPA (Scale 4.00)
            </label>
            <input
              type="number"
              step="0.05"
              min="2.0"
              max="4.0"
              value={cgpa}
              onChange={(e) => setCgpa(parseFloat(e.target.value) || 2.0)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quota Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Quota Option (কোটা ক্যাটাগরি)
            </label>
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="general">General Candidate (Max Age: 30)</option>
              <option value="ff">Freedom Fighter Quota (Max Age: 32)</option>
              <option value="tribal">Tribal / Minority Quota (Max Age: 32)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Eligible Job Cards List */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          আপনার প্রোফাইল অনুযায়ী চাকরির সার্কুলার মূল্যায়ন
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {jobChecklist.map((job, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                job.eligible
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
                  : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {job.title}
                  </h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {job.grade}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{job.org}</p>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  📌 <b>শর্তাবলী:</b> {job.requirements}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400">
                  💡 {job.tips}
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                {job.eligible ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>আবেদনের যোগ্য ✓</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>বয়স বা ডিগ্রি শর্ত অপূর্ণ</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { SyllabusItem, GKItem, QuizQuestion, VivaQuestion, PodcastChapter, LearnerPeer } from '../types';

export const INITIAL_SYLLABUS: SyllabusItem[] = [
  // বাংলা ভাষা ও সাহিত্য
  {
    id: 'bn-1',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    category: 'বাংলা ব্যাকরণ',
    topic: 'সমাস নির্ণয় ও নিয়মাবলী',
    estimatedMinutes: 45,
    importance: 'Essential',
    youtubeQuery: 'সমাস শর্টকাট টেকনিক বিসিএস বাংলা ব্যাকরণ',
    keySummary: 'দ্বন্দ্ব, কর্মধারয়, তৎপুরুষ, বহুব্রীহি, দ্বিগু ও অব্যয়ীভাব সমাস চেনার শর্টকাট ছন্দ।'
  },
  {
    id: 'bn-2',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    category: 'বাংলা ব্যাকরণ',
    topic: 'কারক ও বিভক্তি',
    estimatedMinutes: 40,
    importance: 'High',
    youtubeQuery: 'কারক ও বিভক্তি চেনার সহজ উপায় bcs',
    keySummary: 'ক্রিয়াকে কে, কি, কিসের দ্বারা, কোথা হতে, কোথায় প্রশ্ন করে ৬টি কারক নির্ণয়।'
  },
  {
    id: 'bn-3',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    category: 'বাংলা ব্যাকরণ',
    topic: 'সন্ধি ও এর ব্যতিক্রমী সূত্র',
    estimatedMinutes: 35,
    importance: 'High',
    youtubeQuery: 'সন্ধি বিচ্ছেদ শর্টকাট bcs bangla',
    keySummary: 'স্বরসন্ধি, ব্যঞ্জনসন্ধি ও নিপাতনে সিদ্ধ সন্ধির বিশেষ তালিকা।'
  },
  {
    id: 'bn-4',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    category: 'বাংলা সাহিত্য',
    topic: 'চর্যাপদ ও মধ্যযুগীয় মঙ্গলকাব্য',
    estimatedMinutes: 50,
    importance: 'Essential',
    youtubeQuery: 'চর্যাপদ ও মধ্যযুগের সাহিত্য বিসিএস প্রস্তুতি',
    keySummary: 'হরপ্রসাদ শাস্ত্রী কর্তৃক ১৯০৭ সালে আবিষ্কার, পদকর্তা লুইপা, কাহ্নপা ও শ্রীকৃষ্ণকীর্তন কাব্য।'
  },
  {
    id: 'bn-5',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    category: 'বাংলা সাহিত্য',
    topic: 'রবীন্দ্রনাথ ঠাকুর ও কাজী নজরুল ইসলাম সমগ্র',
    estimatedMinutes: 60,
    importance: 'Essential',
    youtubeQuery: 'রবীন্দ্রনাথ ও নজরুল সাহিত্য বিসিএস প্রশ্ন',
    keySummary: 'নোবেল পুরস্কার, প্রধান কাব্যগ্রন্থ, নাটক, উপন্যাস, ছোটগল্প ও পত্রিকা সম্পাদনা।'
  },

  // English Language & Literature
  {
    id: 'en-1',
    subject: 'English Language & Literature',
    category: 'Grammar',
    topic: 'Subject-Verb Agreement Rules',
    estimatedMinutes: 45,
    importance: 'Essential',
    youtubeQuery: 'Subject Verb Agreement rules BCS bank job english',
    keySummary: 'Either/or, neither/nor, along with, collective nouns and intervening phrase rules.'
  },
  {
    id: 'en-2',
    subject: 'English Language & Literature',
    category: 'Grammar',
    topic: 'Appropriate Prepositions & Idioms',
    estimatedMinutes: 40,
    importance: 'Essential',
    youtubeQuery: 'Appropriate Preposition BCS previous questions',
    keySummary: 'High-frequency prepositions: adhere to, abstain from, conducive to, devoid of.'
  },
  {
    id: 'en-3',
    subject: 'English Language & Literature',
    category: 'Grammar',
    topic: 'Voice Change & Narration Rules',
    estimatedMinutes: 40,
    importance: 'High',
    youtubeQuery: 'Voice change shortcut rules for job exam',
    keySummary: 'Active to passive voice with interrogative, imperative and quasi-passive verbs.'
  },
  {
    id: 'en-4',
    subject: 'English Language & Literature',
    category: 'Literature',
    topic: 'Shakespeare & Elizabethan Era Works',
    estimatedMinutes: 50,
    importance: 'Essential',
    youtubeQuery: 'William Shakespeare famous plays quotes BCS english literature',
    keySummary: 'Famous tragedies (Hamlet, Macbeth, Othello, King Lear) and iconic quotes.'
  },
  {
    id: 'en-5',
    subject: 'English Language & Literature',
    category: 'Literature',
    topic: 'Romantic & Victorian Era Poets',
    estimatedMinutes: 45,
    importance: 'High',
    youtubeQuery: 'Romantic poets Wordsworth Keats Shelley BCS english',
    keySummary: 'Wordsworth, Coleridge, Keats, Shelley, Lord Byron and Victorian giants Dickens & Tennyson.'
  },

  // গাণিতিক যুক্তি ও মানসিক দক্ষতা
  {
    id: 'math-1',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    category: 'পাটিগণিত',
    topic: 'শতকরা ও লাভ-ক্ষতি সংক্রান্ত সমস্যা',
    estimatedMinutes: 45,
    importance: 'Essential',
    youtubeQuery: 'শতকরা ও লাভ ক্ষতি শর্টকাট টেকনিক bcs math',
    keySummary: 'ক্রয়মূল্য, বিক্রয়মূল্য, ধার্যমূল্য ও ডিসকাউন্ট সংক্রান্ত দ্রুত সমীকরণ কৌশল।'
  },
  {
    id: 'math-2',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    category: 'পাটিগণিত',
    topic: 'সরল ও যৌগিক সুদকষা',
    estimatedMinutes: 40,
    importance: 'High',
    youtubeQuery: 'সুদকষা অংক শর্টকাট bcs math',
    keySummary: 'I = Pnr সূত্র এবং চক্রবৃদ্ধি মুনাফা C = P(1+r)^n এর সহজ ট্রিকস।'
  },
  {
    id: 'math-3',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    category: 'বীজগণিত',
    topic: 'বীজগাণিতিক সূত্রাবলী ও মান নির্ণয়',
    estimatedMinutes: 40,
    importance: 'Essential',
    youtubeQuery: 'বীজগণিত মান নির্ণয় শর্টকাট bcs math',
    keySummary: 'a² + b², (a+b)³, x + 1/x = k হলে x² + 1/x² ও x³ + 1/x³ এর শর্টকাট মান।'
  },
  {
    id: 'math-4',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    category: 'জ্যামিতি',
    topic: 'ত্রিভুজ, বৃত্ত ও পিথাগোরাসের উপপাদ্য',
    estimatedMinutes: 45,
    importance: 'High',
    youtubeQuery: 'জ্যামিতি ত্রিভুজ ও বৃত্ত বিসিএস ম্যাথ',
    keySummary: 'পিথাগোরাস ট্রিপলেট (৩,৪,৫; ৫,১২,১৩; ৮,১৫,১৭) এবং অন্তস্থ ও কেন্দ্রস্থ কোণের সম্পর্ক।'
  },
  {
    id: 'math-5',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    category: 'মানসিক দক্ষতা',
    topic: 'সংখ্যার ধারা, চিত্রভিত্তিক যুক্তি ও ঘড়ি-ক্যালেন্ডার',
    estimatedMinutes: 35,
    importance: 'High',
    youtubeQuery: 'মানসিক দক্ষতা ঘড়ি ও ক্যালেন্ডার সংক্রান্ত অংক bcs',
    keySummary: 'ঘড়ির কাঁটার কোণ নির্ণয়: |(60H - 11M) / 2| এবং বারের ক্যালেন্ডার হিসাব।'
  },

  // বাংলাদেশ বিষয়াবলী
  {
    id: 'bd-1',
    subject: 'বাংলাদেশ বিষয়াবলী',
    category: 'ইতিহাস ও মুক্তিযুদ্ধ',
    topic: '১৯৪৭ থেকে ১৯৭১: মুক্তিযুদ্ধ ও মুজিবনগর সরকার',
    estimatedMinutes: 60,
    importance: 'Essential',
    youtubeQuery: 'মুক্তিযুদ্ধ ও মুজিবনগর সরকার বিসিএস প্রিলিমিনারি',
    keySummary: '১০ এপ্রিল ও ১৭ এপ্রিল ১৯৭১, মন্ত্রীপরিষদ সদস্যবৃন্দ, ১১টি সেক্টর ও সেক্টর কমান্ডারগণ।'
  },
  {
    id: 'bd-2',
    subject: 'বাংলাদেশ বিষয়াবলী',
    category: 'সংবিধান ও শাসনব্যবস্থা',
    topic: 'বাংলাদেশের সংবিধান: মূল অনুচ্ছেদ ও সংশোধনী',
    estimatedMinutes: 60,
    importance: 'Essential',
    youtubeQuery: 'বাংলাদেশের সংবিধান গুরুত্বপূর্ণ অনুচ্ছেদ মনে রাখার উপায় bcs',
    keySummary: '১৫৩টি অনুচ্ছেদ, ৭টি তফসিল, গুরুত্বপূর্ণ অনুচ্ছেদ: ৭, ১১, ২৭, ২৮, ২৯, ৪৭, ৭০, ৭৭।'
  },
  {
    id: 'bd-3',
    subject: 'বাংলাদেশ বিষয়াবলী',
    category: 'অর্থনীতি ও বাজেট',
    topic: 'অর্থনৈতিক সমীক্ষা, মেগা প্রকল্প ও পঞ্চবার্ষিক পরিকল্পনা',
    estimatedMinutes: 45,
    importance: 'High',
    youtubeQuery: 'অর্থনৈতিক সমীক্ষা ও সাম্প্রতিক বাজেট bcs gk',
    keySummary: 'জিডিপি প্রবৃদ্ধি, মাথাপিছু আয়, পদ্মা সেতু, কর্ণফুলী টানেল ও রূপপুর পারমাণবিক প্রকল্প।'
  },

  // আন্তর্জাতিক বিষয়াবলী
  {
    id: 'intl-1',
    subject: 'আন্তর্জাতিক বিষয়াবলী',
    category: 'আন্তর্জাতিক সংস্থা',
    topic: 'জাতিসংঘ, বিশ্বব্যাংক ও আন্তর্জাতিক আর্থিক সংস্থাসমূহ',
    estimatedMinutes: 50,
    importance: 'Essential',
    youtubeQuery: 'জাতিসংঘ ও আন্তর্জাতিক সংস্থা সদর দপ্তর বিসিএস',
    keySummary: 'জাতিসংঘের ৬টি অঙ্গসংস্থা, নিরাপত্তা পরিষদ, IMF, World Bank, WTO, ADB।'
  },
  {
    id: 'intl-2',
    subject: 'আন্তর্জাতিক বিষয়াবলী',
    category: 'ভূরাজনীতি ও ভূগোল',
    topic: 'বিশ্বের গুরুত্বপূর্ণ প্রণালী, দ্বীপ ও আন্তর্জাতিক সীমারেখা',
    estimatedMinutes: 45,
    importance: 'High',
    youtubeQuery: 'আন্তর্জাতিক গুরুত্বপূর্ণ প্রণালী ও সীমারেখা bcs',
    keySummary: 'মালাক্কা, হরমুজ, বাবেল মান্দেব, জিব্রাল্টার প্রণালী ও ডুরান্ড, ম্যাকমোহন লাইন।'
  },

  // সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি
  {
    id: 'sci-1',
    subject: 'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি',
    category: 'কম্পিউটার ও আইসিটি',
    topic: 'কম্পিউটার সংগঠন, মেমোরি ও অপারেটিং সিস্টেম',
    estimatedMinutes: 40,
    importance: 'Essential',
    youtubeQuery: 'কম্পিউটার মেমোরি RAM ROM বিসিএস আইসিটি',
    keySummary: 'RAM, ROM, Cache, Virtual Memory, CPU আর্কিটেকচার ও ক্লাউড স্টোরেজ।'
  },
  {
    id: 'sci-2',
    subject: 'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি',
    category: 'বিজ্ঞান',
    topic: 'মানবদেহ, রক্তসংবহন ও সাধারণ রোগবালাই',
    estimatedMinutes: 40,
    importance: 'High',
    youtubeQuery: 'রক্তের গ্রুপ ও মানবদেহ বিসিএস সাধারণ বিজ্ঞান',
    keySummary: 'RBC, WBC, Platelet, রক্তের গ্রুপ (AB সার্বজনীন গ্রহীতা, O সার্বজনীন দাতা) ও ভিটামিন।'
  }
];

export const INITIAL_GK_ITEMS: GKItem[] = [
  {
    id: 'gk-1',
    title: 'বাংলাদেশ অর্থনৈতিক সমীক্ষা: মাথাপিছু আয় ও রিজার্ভ পরিস্থিতি',
    category: 'বাংলাদেশ',
    date: 'আজকের তাজা আপডেট',
    details: 'বাংলাদেশ ব্যাংকের সর্বশেষ হিসাব অনুযায়ী বৈদেশিক মুদ্রার রিজার্ভে ইতিবাচক বৃদ্ধি দেখা গেছে এবং প্রবাসী আয়ে স্মরণকালের রেকর্ড অর্জন হয়েছে।',
    examTip: 'বিসিএস প্রিলিতে অর্থনৈতিক সমীক্ষার জিডিপি প্রবৃদ্ধির হার ও খাতের শতাংশ সরাসরি আসে।'
  },
  {
    id: 'gk-2',
    title: 'জাতিসংঘ সাধারণ পরিষদের সাম্প্রতিক গুরুত্বপূর্ণ প্রস্তাবনা',
    category: 'আন্তর্জাতিক',
    date: 'আন্তর্জাতিক ডেস্ক',
    details: 'জাতিসংঘ সদর দপ্তরে বিশ্বশান্তি ও টেকসই উন্নয়ন লক্ষ্যমাত্রা (SDG) ২০৩০ বাস্তবায়নে বিশেষ রেজুলেশন পাস হয়েছে।',
    examTip: 'জাতিসংঘ সাধারণ পরিষদের বর্তমান সভাপতি এবং অধিবেশন নম্বর নোট করে রাখুন।'
  },
  {
    id: 'gk-3',
    title: 'ডেল্টা প্ল্যান ২১০০ (Delta Plan 2100) এর অগ্রগতি',
    category: 'বাংলাদেশ',
    date: 'জাতীয় উন্নয়ন',
    details: 'ডেল্টা প্ল্যান ২১০০ বাস্তবায়নে দেশের ৬টি প্রধান হটস্পট এলাকায় পানি সম্পদ ব্যবস্থাপনা ও জলবায়ু সহনশীল অবকাঠামো নির্মাণ প্রকল্প চলমান রয়েছে।',
    examTip: 'ভাইভাতে ডেল্টা প্ল্যানের ৬টি হটস্পটের নাম প্রায়ই জানতে চাওয়া হয়।'
  },
  {
    id: 'gk-4',
    title: 'বৈশ্বিক ক্লাউড কম্পিউটিং ও কৃত্রিম বুদ্ধিমত্তা ফ্রেমওয়ার্ক',
    category: 'বিজ্ঞান ও পরিবেশ',
    date: 'প্রযুক্তি সংবাদ',
    details: 'গুগল ডিপমাইন্ড ও আন্তর্জাতিক গবেষক দল নবায়নযোগ্য শক্তি উদ্ভাবনে নতুন নিউরাল নেটওয়ার্ক মডেল উন্মোচন করেছে।',
    examTip: 'আইসিটি সেকশনে ক্লাউড সার্ভিসের ৩টি মডেল: IaaS, PaaS, SaaS সম্পর্কে সুস্পষ্ট ধারণা রাখুন।'
  },
  {
    id: 'gk-5',
    title: 'আইসিসি বিশ্বকাপ ও চ্যাম্পিয়ন্স ট্রফি আপডেট',
    category: 'খেলাধুলা',
    date: 'ক্রীড়াঙ্গন',
    details: 'আন্তর্জাতিক ক্রিকেট কাউন্সিল (ICC) আসন্ন আন্তর্জাতিক টুর্নামেন্টের ভেন্যু ও দলগুলোর তালিকা চূড়ান্ত করেছে।',
    examTip: 'টুর্নামেন্টের চ্যাম্পিয়ন, রানার্সআপ এবং প্লেয়ার অব দ্য টুর্নামেন্টের নাম মনে রাখবেন।'
  }
];

export const MOCK_EXAM_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    subject: 'বাংলাদেশ বিষয়াবলী',
    question: 'বাংলাদেশের প্রথম অস্থায়ী সরকার (মুজিবনগর সরকার) আনুষ্ঠানিকভাবে শপথ গ্রহণ করে কবে?',
    options: ['১০ এপ্রিল ১৯৭১', '১৭ এপ্রিল ১৯৭১', '২৬ মার্চ ১৯৭১', '১৬ ডিসেম্বর ১৯৭১'],
    correctIndex: 1,
    explanation: '১০ এপ্রিল ১৯৭১ সালে মুজিবনগর সরকার গঠিত হয় এবং ১৭ এপ্রিল ১৯৭১ মেহেরপুরের বৈদ্যনাথতলায় (মুজিবনগর) শপথ গ্রহণ করে।'
  },
  {
    id: 'q-2',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    question: '"হাতাহাতি" কোন সমাসের উদাহরণ?',
    options: ['প্রাদি সমাস', 'ব্যতিহার বহুব্রীহি', 'নঞ তৎপুরুষ', 'দ্বিগু সমাস'],
    correctIndex: 1,
    explanation: 'হাতে হাতে যে যুদ্ধ = হাতাহাতি। একই শব্দ পরপর বসে পারস্পরিক ক্রিয়া বোঝালে তাকে ব্যতিহার বহুব্রীহি সমাস বলে।'
  },
  {
    id: 'q-3',
    subject: 'English Language & Literature',
    question: 'Choose the correct preposition: "He is devoid _____ common sense."',
    options: ['of', 'from', 'in', 'with'],
    correctIndex: 0,
    explanation: 'Appropriate preposition: "devoid of" অর্থ কোনো কিছু বর্জিত বা শূন্য।'
  },
  {
    id: 'q-4',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    question: 'কোনো সংখ্যার ৬০% থেকে ৬০ বিয়োগ করলে বিয়োগফল ৬০ হয়। সংখ্যাটি কত?',
    options: ['১০০', '১৫০', '২০০', '২৫০'],
    correctIndex: 2,
    explanation: 'ধরি সংখ্যাটি x। প্রশ্নমতে, ০.৬x - ৬০ = ৬০ => ০.৬x = ১২০ => x = ১২০ / ০.৬ = ২০০।'
  },
  {
    id: 'q-5',
    subject: 'বাংলাদেশ বিষয়াবলী',
    question: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানে মৌলিক অধিকার সম্পর্কিত কয়টি অনুচ্ছেদ রয়েছে?',
    options: ['১২টি', '১৮টি', '২৪টি', '১৮টি (অনুচ্ছেদ ২৭ থেকে ৪৪)'],
    correctIndex: 3,
    explanation: 'সংবিধানের ৩য় ভাগে মৌলিক অধিকার বিষয়ে মোট ১৮টি অনুচ্ছেদ (অনুচ্ছেদ ২৭ থেকে ৪৪ পর্যন্ত) বর্ণিত রয়েছে।'
  },
  {
    id: 'q-6',
    subject: 'English Language & Literature',
    question: 'Who wrote the famous line: "To be, or not to be, that is the question"?',
    options: ['John Milton', 'William Shakespeare', 'John Keats', 'P.B. Shelley'],
    correctIndex: 1,
    explanation: 'This famous soliloquy is from William Shakespeare\'s timeless tragedy "Hamlet" (Act III, Scene 1).'
  },
  {
    id: 'q-7',
    subject: 'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি',
    question: 'কম্পিউটারের কোন মেমোরিটি সবচেয়ে দ্রুতগতির (Fastest)?',
    options: ['RAM', 'ROM', 'Hard Disk', 'Register / Cache Memory'],
    correctIndex: 3,
    explanation: 'CPU-এর ভেতরে অবস্থিত Register এবং Cache Memory কম্পিউটারের অন্যান্য সকল মেমোরির চেয়ে বহুগুণ দ্রুত কাজ করে।'
  },
  {
    id: 'q-8',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    question: 'চর্যাপদের সবচেয়ে বেশি পদ রচনা করেছেন কে?',
    options: ['লুইপা', 'ভুসুকুপা', 'কাহ্নপা', 'শবরপা'],
    correctIndex: 2,
    explanation: 'কাহ্নপা চর্যাপদের সর্বোচ্চ ১৩টি পদ রচনা করেন। ভুসুকুপা রচনা করেন ৮টি পদ।'
  },
  {
    id: 'q-9',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    question: 'ঘড়িতে যখন ৪টা বাজে, তখন ঘণ্টা ও মিনিটের কাঁটার মধ্যবর্তী কোণ কত ডিগ্রি?',
    options: ['৯০°', '১০০°', '১২০°', '১৩৫°'],
    correctIndex: 2,
    explanation: 'সূত্র: |(৬০ × ৪ - ১১ × ০) / ২| = |২৪০ / ২| = ১২০ ডিগ্রি।'
  },
  {
    id: 'q-10',
    subject: 'আন্তর্জাতিক বিষয়াবলী',
    question: 'পারস্য উপসাগর ও ওমান উপসাগরকে সংযুক্ত করেছে কোন প্রণালী?',
    options: ['মালাক্কা প্রণালী', 'জিব্রাল্টার প্রণালী', 'হরমুজ প্রণালী', 'বসফরাস প্রণালী'],
    correctIndex: 2,
    explanation: 'হরমুজ প্রণালী কৌশলগতভাবে পারস্য উপসাগর এবং ওমান উপসাগরকে সংযুক্ত করেছে।'
  }
];

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 'viva-1',
    category: 'নিজ জেলা ও মুক্তিযুদ্ধ',
    question: 'আপনার নিজের জেলা সম্পর্কে বলুন এবং মহান মুক্তিযুদ্ধে এই জেলার বিশেষ অবদান কী ছিল?',
    context: 'ভাইভা বোর্ডে প্রার্থীর ব্যাকগ্রাউন্ড ও জাতীয় চেতনার গভীরতা যাচাই করার জন্য অত্যন্ত কমন একটি প্রশ্ন।',
    expectedKeywords: ['ভৌগোলিক সীমানা', 'মুক্তিযুদ্ধের সেক্টর', 'সেক্টর কমান্ডার', 'বীরশ্রেষ্ঠ বা খেতাবপ্রাপ্ত মুক্তিযোদ্ধা', 'প্রধান নদী ও ফসল'],
    sampleModelAnswer: 'আমার জেলা [...]। ১৯৭১ সালের মহান মুক্তিযুদ্ধে এ জেলা [...] নম্বর সেক্টরের অধীনে ছিল। আমাদের জেলার কৃতী সন্তান [...] বীরত্বপূর্ণ অবদান রাখেন। ভৌগোলিকভাবে এ জেলা কৃষিনির্ভর এবং [...] নদীর অববাহিকায় অবস্থিত।'
  },
  {
    id: 'viva-2',
    category: 'সংবিধান ও গণতন্ত্র',
    question: 'সংবিধানের ৭০ নম্বর অনুচ্ছেদ সম্পর্কে আপনার মূল্যায়ন কী? এটি কি দলীয় শৃঙ্খলা নাকি সংসদীয় স্বাধীনতার পক্ষে?',
    context: 'প্রার্থীর নিরপেক্ষতা ও সাংবিধানিক জ্ঞানের গভীরতা পরিমাপ করার উচ্চস্তরের প্রশ্ন।',
    expectedKeywords: ['ফ্লোর ক্রসিং', 'সংসদীয় স্থিতিশীলতা', 'দলীয় শৃঙ্খলা', 'যুক্তরাজ্যের হুইপ সিস্টেম', 'ভারসাম্য'],
    sampleModelAnswer: 'সংবিধানের ৭০ নম্বর অনুচ্ছেদ সংসদ সদস্যদের নিজ দলের বিরুদ্ধে ভোট দেওয়া থেকে বিরত রেখে রাজনৈতিক স্থিতিশীলতা নিশ্চিত করে। তবে সংসদের উন্মুক্ত বিতর্কে দলের নীতির সাথে জাতীয় স্বার্থের সামঞ্জস্য বজায় রাখাই এর মূল উদ্দেশ্য।'
  },
  {
    id: 'viva-3',
    category: 'ক্যাডার পছন্দ ও প্রশাসন',
    question: 'আপনি প্রশাসন বা পুলিশ ক্যাডারকে কেন প্রথম পছন্দ হিসেবে বেছে নিয়েছেন?',
    context: 'প্রার্থীর মোটিভেশন, নেতৃত্বগুণ ও মাঠ পর্যায়ের চ্যালেঞ্জ গ্রহণের মানসিকতা যাচাই।',
    expectedKeywords: ['জনসেবা', 'মাঠ প্রশাসন', 'আইনশৃঙ্খলা ও নিরাপত্তা', 'নীতি বাস্তবায়ন', 'নাগরিক সেবা সহজীকরণ'],
    sampleModelAnswer: 'মাঠ পর্যায়ে সরাসরি প্রান্তিক জনগণের কাছাকাছি গিয়ে সরকারি উন্নয়ন প্রকল্প বাস্তবায়ন এবং দ্রুত নাগরিক সেবা পৌঁছে দেওয়ার অনন্য সুযোগ প্রশাসন/পুলিশ ক্যাডারে পাওয়া যায়।'
  }
];

export const PODCAST_CHAPTERS: PodcastChapter[] = [
  {
    id: 'pod-1',
    title: 'বাংলাদেশের সংবিধানের মূল বৈশিষ্ট্য ও গুরুত্বপূর্ণ সংশোধনী',
    subject: 'বাংলাদেশ বিষয়াবলী',
    durationText: '৫ মিনিট',
    summary: '১৯৭২ সালের ৪ নভেম্বর গণপরিষদে গৃহীত এবং ১৬ ডিসেম্বর কার্যকর হওয়া বাংলাদেশের সংবিধানের ১১টি ভাগ, ১৫৩টি অনুচ্ছেদ এবং গুরুত্বপূর্ণ সংশোধনীর পর্যালোচনা।',
    speechText: 'পাঠশালা অডিও পডকাস্টে স্বাগতম। আজকের বিষয়: বাংলাদেশের সংবিধান। ১৯৭২ সালের ৪ নভেম্বর সংবিধান গৃহীত হয় এবং ১৬ ডিসেম্বর কার্যকর হয়। সংবিধানে ১৫৩টি অনুচ্ছেদ এবং ৭টি তফসিল রয়েছে। চারটি মূলনীতি হলো জাতীয়তাবাদ, সমাজতন্ত্র, গণতন্ত্র ও ধর্মনিরপেক্ষতা।'
  },
  {
    id: 'pod-2',
    title: 'ভাষা আন্দোলন ১৯৫২ থেকে মুক্তিযুদ্ধ ১৯৭১',
    subject: 'ইতিহাস ও মুক্তিযুদ্ধ',
    durationText: '৬ মিনিট',
    summary: '১৯৪৮-এর সূচনা, ১৯৫২ সালের ২১ ফেব্রুয়ারির আত্মদান, ১৯৫৪-র যুক্তফ্রন্ট নির্বাচন, ১৯৬৬-র ৬ দফা এবং ১৯৭১ সালের ১৭ এপ্রিল গঠিত মুজিবনগর সরকার।',
    speechText: 'পাঠশালা অডিও সিরিজ। বায়ান্নর ভাষা আন্দোলন থেকে একাত্তরের মুক্তিযুদ্ধ। সালাম, বরকত, রফিক, জব্বারের আত্মত্যাগে বাংলা ভাষার স্বীকৃতি লাভ। ১৯৬৬ সালে বঙ্গবন্ধুর ঐতিহাসিক ৬ দফা পেশ যা বাঙালি জাতির মুক্তির সনদ নামে খ্যাত। ১৯৭১ সালের ২৬ মার্চ প্রথম প্রহরে স্বাধীনতা ঘোষণা এবং ১০ এপ্রিল মুজিবনগর সরকার গঠন।'
  },
  {
    id: 'pod-3',
    title: 'গণিতের দ্রুত শর্টকাট টেকনিক ও অপশন এলিমিনেশন',
    subject: 'গণিত ও মানসিক দক্ষতা',
    durationText: '৪ মিনিট',
    summary: 'শতকরা, লাভ-ক্ষতি ও সুদকষার অংকে কলম না ছুঁয়ে অপশন এলিমিনেশন করে ১০ সেকেন্ডে উত্তর বের করার ম্যাজিক ট্রিকস।',
    speechText: 'পাঠশালা ম্যাথ ট্রিকস। চাকরির পরীক্ষায় সময় বাঁচানোই আসল কৌশল। শতকরা হিসাব করার সময় ১০ শতাংশ এবং ১ শতাংশের টেকনিক মনে রাখুন। যেমন ৪৫০ এর ২০ শতাংশ হবে ৪৫ গুণ দুই সমান ৯০। ঘড়ির কাঁটার কোণ নির্ণয়ে মডুলাস ৬০ এইচ মাইনাস ১১ এম বাই টু ফর্মুলা সবসময় নিখুঁত ফলাফল দেয়।'
  },
  {
    id: 'pod-4',
    title: 'প্রাথমিক সহকারী শিক্ষক ও এনটিআরসিএ শিক্ষক নিবন্ধন স্পেশাল',
    subject: 'প্রাইমারি ও NTRCA',
    durationText: '৫ মিনিট',
    summary: 'বাংলা ব্যাকরণ, ধ্বনি পরিবর্তন, সমাস, কারক এবং পাটিগণিতের পুনরাবৃত্তি কৌশল।',
    speechText: 'পাঠশালা স্পেশাল ব্রডকাস্ট। প্রাথমিক সহকারী শিক্ষক নিয়োগ ও এনটিআরসিএ শিক্ষক নিবন্ধন পরীক্ষায় বাংলা সাহিত্য ও ব্যাকরণ এবং মৌলিক পাটিগণিত থেকে অধিকাংশ প্রশ্ন আসে। বিশেষ করে চর্যাপদ, মধ্যযুগ, রবীন্দ্রনাথ ও কাজী নজরুল ইসলাম এবং লসাগু-গসাগু ও শতকরা নিয়মিত রিভিশন দিন।'
  },
  {
    id: 'pod-5',
    title: '১১-২০তম গ্রেড সরকারি চাকরি মেগা প্রস্তুতি গাইডলাইন',
    subject: '১১-২০তম গ্রেড সরকারি চাকরি',
    durationText: '৪ মিনিট',
    summary: 'হিসাব নিরীক্ষক, অডিটর, অফিস সহকারী ও কম্পিউটার অপারেটর পদের বিগত প্রশ্ন বিশ্লেষণের সারাংশ।',
    speechText: '১১ থেকে ২০তম গ্রেডের সরকারি চাকরির নিয়োগ পরীক্ষায় পদভেদে লিখিত ও এমসিকিউ উভয় পদ্ধতি অনুসরণ করা হয়। অডিটর, অফিস সহকারী ও কম্পিউটার অপারেটর পদের জন্য শুদ্ধ বানান, বাগধারা, এককথায় প্রকাশ, কম্পিউটার শর্টকাট কি এবং সাম্প্রতিক তথ্যপ্রযুক্তি সবচেয়ে বেশি গুরুত্বপূর্ণ।'
  }
];

export const MOCK_PEERS: LearnerPeer[] = [
  {
    id: 'p-1',
    name: 'তানভীর আহমেদ',
    target: '৪৭তম বিসিএস (প্রশাসন)',
    avatar: '👨‍💼',
    currentTopic: 'বাংলা ব্যাকরণ - সমাস ও কারক',
    minutesToday: 135,
    status: 'studying'
  },
  {
    id: 'p-2',
    name: 'নুসরাত জাহান',
    target: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD)',
    avatar: '👩‍💼',
    currentTopic: 'Math - Simple & Compound Interest',
    minutesToday: 180,
    status: 'studying'
  },
  {
    id: 'p-3',
    name: 'মেহেদী হাসান',
    target: '৪৭তম বিসিএস (পুলিশ ক্যাডার)',
    avatar: '👮‍♂️',
    currentTopic: 'সংবিধান ও মেগা প্রজেক্ট',
    minutesToday: 95,
    status: 'break'
  },
  {
    id: 'p-4',
    name: 'সাবরিনা আক্তার',
    target: 'সম্মিলিত ব্যাংক সিনিয়র অফিসার',
    avatar: '👩‍🏫',
    currentTopic: 'English Literature - Romantic Period',
    minutesToday: 210,
    status: 'mock-exam'
  },
  {
    id: 'p-5',
    name: 'ফারহান চৌধুরী',
    target: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ',
    avatar: '👨‍🏫',
    currentTopic: 'দৈনন্দিন বিজ্ঞান ও কম্পিউটার',
    minutesToday: 80,
    status: 'studying'
  }
];

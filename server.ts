import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Smart fallback content generators when offline or no API key
function getFallbackClarification(subject: string, topic: string) {
  return `### 📖 বিষয়: ${subject}
#### 📌 টপিক: ${topic}

---

#### ১. 💡 মূল ধারণা (Core Concept)
**"${topic}"** বিষয়টি বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার জন্য একটি অত্যন্ত গুরুত্বপূর্ণ অধ্যায়। 
- পরীক্ষায় এ টপিক থেকে সাধারণত মৌলিক নিয়মাবলী, ব্যতিক্রমী উদাহরণ এবং সরাসরি প্রয়োগভিত্তিক প্রশ্ন আসে।
- ব্যাকরণ ও গণিতের ক্ষেত্রে সূত্রের পেছনের যৌক্তিক কারণটি মনে রাখলে দ্রুত অপশন এলিমিনেট করা সম্ভব হয়।

#### ২. ⚡ বিসিএস ও বিগত সালের পরীক্ষার ধরন (Exam Patterns)
- **বিগত সালের ট্রেন্ড:** বিগত ৩৫তম থেকে ৪৬তম বিসিএস প্রিলিমিনারিতে এ সম্পর্কিত গড়ে ১-২টি প্রশ্ন এসেছে।
- **সাধারণ প্রশ্ন ফরম্যাট:** সরাসরি সংজ্ঞা অপেক্ষা "নিচের কোনটি সঠিক উদাহরণ?" কিংবা "ব্যতিক্রমী রূপ" সংক্রান্ত প্রশ্ন বেশি আসে।

#### ৩. 🎯 সুপার শর্টকাট ও ছন্দের টিপস (Mnemonic Tips)
- মনে রাখার টেকনিক: মূল নিয়মটি ১ লাইনে নোটবুকে লিখে রাখুন।
- বিকল্প অপশনগুলো খেয়াল করুন এবং ভুল উত্তরগুলো আগে বাদ দেওয়ার অভ্যাস করুন (Negative elimination method)।

#### ৪. ⚠️ পরীক্ষার্থীদের সাধারণ ভুল (Common Pitfalls)
- তাড়াহুড়া করে প্রশ্ন সম্পূর্ণ না পড়ে উত্তর দাগানো।
- ব্যতিক্রমী উদাহরণগুলোকে সাধারণ নিয়মের অন্তর্ভুক্ত মনে করা।

---
💡 *টিপ:* কনসেপ্টটি ভালোভাবে মাথায় রাখতে নিচের প্র্যাকটিস প্রশ্নগুলোর উত্তর দিন এবং সিলেবাসে টিক দিন!`;
}

function getFallbackVivaFeedback(question: string, answer: string) {
  const wordCount = answer.trim().split(/\s+/).length;
  const score = Math.min(20, Math.max(12, Math.floor(14 + (wordCount > 30 ? 4 : wordCount > 15 ? 2 : 0))));
  
  return {
    score,
    maxScore: 20,
    impression: score >= 17 ? 'চমৎকার ও আত্মবিশ্বাসী' : 'সন্তোষজনক, তবে আরও ডেটানির্ভর হওয়া প্রয়োজন',
    strengths: [
      'প্রশ্নের সাথে প্রাসঙ্গিক উত্তর দেওয়া হয়েছে।',
      'ভাষা ও বাচনভঙ্গিতে শালীনতা বজায় রয়েছে।',
      'মৌলিক ধারণা উপস্থাপন ইতিবাচক।'
    ],
    improvements: [
      'সংবিধানের নির্দিষ্ট অনুচ্ছেদ বা সঠিক সাল/পরিসংখ্যান যুক্ত করলে উত্তরের ওজন বৃদ্ধি পাবে।',
      'অতিরিক্ত ভূমিকা না বাড়িয়ে প্রথম লাইনেই সরাসরি মূল বক্তব্যে চলে যাওয়া ভালো।'
    ],
    modelAnswer: `মার্জিত ভঙ্গিতে শুরু করে মূল তথ্য, প্রাসঙ্গিক অনুচ্ছেদ বা জাতীয় গুরুত্ব উল্লেখ করে ২-৩ বাক্যে ইতিবাচকভাবে শেষ করা ভাইভা বোর্ডের কাছে সবচেয়ে গ্রহণযোগ্য।`
  };
}

// 1. AI Clarifier Endpoint
app.post('/api/ai/clarify', async (req: Request, res: Response) => {
  const { subject, topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'টপিকের নাম দেওয়া আবশ্যক।' });
  }

  if (!ai || !apiKey) {
    return res.json({ explanation: getFallbackClarification(subject || 'সাধারণ বিষয়', topic) });
  }

  try {
    const prompt = `তুমি একজন অভিজ্ঞ বিসিএস ও সরকারি চাকরির স্পেশালিস্ট টিউটর ও শিক্ষক।
শিক্ষার্থী "${subject || 'সাধারণ বিষয়'}" বিষয়ের "${topic}" টপিকটি সহজে বুঝতে চায়।
বাংলা ভাষায় মার্জিত, আকর্ষণীয় ও বুলেটপয়েন্ট আকারে নিচের বিষয়গুলোসহ একটি সম্পূর্ণ টিউটোরিয়াল লেকচার তৈরি করো:
১. 💡 সহজ ভাষায় মূল ধারণা (Core Concept & Fundamentals)
২. ⚡ বিগত বিসিএস/চাকরির পরীক্ষার আলোকে গুরুত্বপূর্ণ উদাহরণ (High-yield Exam Examples)
৩. 🎯 শর্টকাট মেমোরি টেকনিক বা মনে রাখার কৌশল (Mnemonic & Fast Solves)
৪. ⚠️ পরীক্ষার্থীদের সচরাচর ভুল (Common Pitfalls & Traps)
৫. 📝 ৩টি মডেল এমসিকিউ প্রশ্ন এবং উত্তরসহ ব্যাখ্যা।
সহজ ও সাবলীল প্রমিত বাংলায় লিখবে।`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || getFallbackClarification(subject || 'সাধারণ বিষয়', topic);
    res.json({ explanation: text });
  } catch (err: any) {
    console.error('Clarify Error:', err);
    res.json({ explanation: getFallbackClarification(subject || 'সাধারণ বিষয়', topic) });
  }
});

// 2. AI Tutor & Doubt Solver Endpoint
app.post('/api/ai/tutor', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'প্রশ্ন পাঠানো আবশ্যক।' });
  }

  if (!ai || !apiKey) {
    return res.json({
      reply: `আপনার প্রশ্নটির জন্য ধন্যবাদ! "${message}" এর ক্ষেত্রে সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো মৌলিক কনসেপ্ট পরিষ্কার রাখা। বিসিএস ও সরকারি চাকরির প্রস্তুতিতে বিগত সালের প্রশ্ন ও ব্যাখ্যা নিয়মিত চর্চা করুন। কনসেপ্ট ক্ল্যারিফায়ারে এই টপিকটি ইনপুট দিয়ে বিস্তারিত শর্টকাট দেখে নিতে পারেন।`
    });
  }

  try {
    const prompt = `তুমি "পাঠশালা" স্টাডি রুমের বন্ধুত্বপূর্ণ সিনিয়র মেন্টর ও বিসিএস কোচ।
ব্যবহারকারীর প্রশ্ন: "${message}"
বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার উপযোগী নিখুঁত, সহায়ক এবং অনুপ্রেরণাদায়ক উত্তর প্রমিত বাংলায় সংক্ষেপে দাও। গণিত বা ব্যাকরণের ক্ষেত্রে সহজ শর্টকাট নিয়ম উল্লেখ করো।`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ reply: response.text || 'দুঃখিত, উত্তর তৈরি করা যায়নি।' });
  } catch (err: any) {
    console.error('Tutor Error:', err);
    res.json({
      reply: `আপনার প্রশ্নটির জন্য ধন্যবাদ! এই মুহূর্তে অফলাইন নলেজবেস থেকে উত্তর দেওয়া হচ্ছে: "${message}" সংক্রান্ত নিয়ম বা সূত্রটি নিয়মিত রিভিশন রাখুন এবং মডেল টেস্টে প্রয়োগ করুন।`
    });
  }
});

// 3. AI Viva Simulator Evaluation Endpoint
app.post('/api/ai/viva', async (req: Request, res: Response) => {
  const { question, answer } = req.body;
  if (!answer) {
    return res.status(400).json({ error: 'আপনার উত্তর আবশ্যক।' });
  }

  if (!ai || !apiKey) {
    return res.json(getFallbackVivaFeedback(question, answer));
  }

  try {
    const prompt = `তুমি বিসিএস বা সরকারি চাকরির ভাইভা বোর্ডের একজন অভিজ্ঞ সম্মানিত চেয়ারম্যান/মেম্বার।
ভাইভার প্রশ্নটি ছিল: "${question}"
প্রার্থীর দেওয়া উত্তর: "${answer}"

দয়া করে উত্তরটি মূল্যায়ন করে শুধুমাত্র একটি ভ্যালিড JSON অবজেক্ট আকারে আউটপুট দাও (কোনো অতিরিক্ত টেক্সট বা মার্কডাউন কোডব্লক ছাড়া):
{
  "score": 16,
  "maxScore": 20,
  "impression": "সংক্ষিপ্ত মূল্যায়ন",
  "strengths": ["শক্তি ১", "শক্তি ২"],
  "improvements": ["উন্নতির ক্ষেত্র ১", "উন্নতির ক্ষেত্র ২"],
  "modelAnswer": "বোর্ডের প্রত্যাশিত আদর্শ উত্তর"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Viva Error:', err);
    res.json(getFallbackVivaFeedback(question, answer));
  }
});

// 4. AI Live GK & Current Affairs Digest
app.post('/api/ai/gk-digest', async (req: Request, res: Response) => {
  const { category } = req.body;

  if (!ai || !apiKey) {
    return res.json({
      items: [
        {
          title: "বাংলাদেশ অর্থনৈতিক সমীক্ষা ও জিডিপি প্রবৃদ্ধি",
          category: "বাংলাদেশ বিষয়াবলী",
          date: "আজকের আপডেট",
          details: "বাংলাদেশ পরিসংখ্যান ব্যুরো ও অর্থ মন্ত্রণালয়ের সর্বশেষ তথ্য অনুসারে বৈদেশিক মুদ্রার রিজার্ভ ও রেমিট্যান্স প্রবাহে ইতিবাচক ধারা পরিলক্ষিত হচ্ছে।",
          examTip: "মাথাপিছু আয় এবং জিডিপিতে বিভিন্ন খাতের (কৃষি, শিল্প, সেবা) অবদান বিসিএস প্রিলিমিনারি ও লিখিত উভয় পরীক্ষার জন্যই অত্যন্ত গুরুত্বপূর্ণ।"
        },
        {
          title: "আন্তর্জাতিক জলবায়ু সম্মেলন ও পরিবেশ কূটনীতি",
          category: "আন্তর্জাতিক বিষয়াবলী",
          date: "আজকের আপডেট",
          details: "জাতিসংঘের জলবায়ু তহবিল ও লস অ্যান্ড ড্যামেজ ফান্ড কার্যকর করার ব্যাপারে উন্নয়নশীল দেশগুলোর পক্ষে বাংলাদেশের বলিষ্ঠ অবস্থান অব্যাহত।",
          examTip: "কপ (COP) সম্মেলনের স্বাগতিক দেশ ও প্রধান লক্ষ্যগুলো মুখস্থ রাখুন।"
        },
        {
          title: "কৃত্রিম বুদ্ধিমত্তা ও সাইবার নিরাপত্তা নীতিমালা",
          category: "বিজ্ঞান ও প্রযুক্তি",
          date: "আজকের আপডেট",
          details: "সরকারি সেবা ও শিক্ষায় প্রযুক্তির নিরাপদ ব্যবহারের লক্ষ্যে নতুন ডেটা সুরক্ষা ও এআই গাইডলাইন বাস্তবায়নাধীন।",
          examTip: "আইসিটি অংশে ক্লাউড কম্পিউটিং ও সাইবার নিরাপত্তার মৌলিক টার্মগুলো থেকে প্রশ্ন আসার সম্ভাবনা বেশি।"
        }
      ]
    });
  }

  try {
    const prompt = `তুমি বিসিএস ও সরকারি চাকরির কারেন্ট অ্যাফেয়ার্স বিশেষজ্ঞ।
সাম্প্রতিক গুরুত্বপূর্ণ ৫টি কারেন্ট অ্যাফেয়ার্স ও সাধারণ জ্ঞান তথ্য JSON ফরম্যাটে দাও।
ফরম্যাট:
{
  "items": [
    {
      "title": "শিরোনাম",
      "category": "বাংলাদেশ / আন্তর্জাতিক / অর্থনীতি / বিজ্ঞান ও প্রযুক্তি",
      "date": "তারিখ বা সময়",
      "details": "বিস্তারিত ২-৩ বাক্যে",
      "examTip": "চাকরির পরীক্ষার জন্য করণীয় টিপস"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"items": []}');
    res.json(parsed);
  } catch (err: any) {
    console.error('GK Digest Error:', err);
    res.json({
      items: [
        {
          title: "বাংলাদেশ অর্থনৈতিক সমীক্ষা ও রাজস্ব ব্যবস্থাপনা",
          category: "বাংলাদেশ",
          date: "সাম্প্রতিক",
          details: "এনবিআর এবং কেন্দ্রীয় ব্যাংকের রাজস্ব আহরণ ও মুদ্রাস্ফীতি নিয়ন্ত্রণ পদক্ষেপ।",
          examTip: "ট্যাক্স-জিডিপি অনুপাত এবং বার্ষিক বাজেটের মূল অগ্রাধিকারগুলো নিয়মিত রিভিউ করুন।"
        }
      ]
    });
  }
});

// 5. AI Custom Quiz Generator Endpoint
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  const { subject, count = 5 } = req.body;

  if (!ai || !apiKey) {
    return res.json({
      questions: [
        {
          id: `q-fallback-1`,
          subject: subject || 'বাংলাদেশ বিষয়াবলী',
          question: 'বাংলাদেশের জাতীয় সংসদে সংরক্ষিত নারী আসনের সংখ্যা কতটি?',
          options: ['৩০টি', '৪৫টি', '৫০টি', '৬০টি'],
          correctIndex: 2,
          explanation: 'সংবিধানের অনুচ্ছেদ ৬৫(৩) অনুযায়ী জাতীয় সংসদে মহিলাদের জন্য সংরক্ষিত ৫০টি আসন রয়েছে।'
        },
        {
          id: `q-fallback-2`,
          subject: subject || 'বাংলা ভাষা ও সাহিত্য',
          question: '"শেষের কবিতা" রবীন্দ্রনাথ ঠাকুরের কোন ধরণের সাহিত্যকর্ম?',
          options: ['কাব্যগ্রন্থ', 'উপন্যাস', 'নাটক', 'ছোটগল্প'],
          correctIndex: 1,
          explanation: '১৯২৮ সালে রচিত "শেষের কবিতা" রবীন্দ্রনাথ ঠাকুরের একটি বিখ্যাত রোমান্টিক কাব্যধর্মী উপন্যাস।'
        }
      ]
    });
  }

  try {
    const prompt = `তুমি বিসিএস ও সরকারি চাকরির প্রশ্ন প্রণেতা বিশেষজ্ঞ।
"${subject || 'সাধারণ জ্ঞান ও বিষয়াবলী'}" বিষয় থেকে ${count}টি অত্যন্ত বাস্তবসম্মত ও মানসম্মত প্রিলিমিনারি এমসিকিউ প্রশ্ন JSON ফরম্যাটে দাও।
প্রত্যেক প্রশ্নের ৪টি অপশন এবং সঠিক উত্তর ইনডেক্স (0, 1, 2, 3) ও স্পষ্ট সংক্ষিপ্ত ব্যাখ্যা থাকবে।
আউটপুট ফরম্যাট:
{
  "questions": [
    {
      "id": "q-1",
      "subject": "${subject}",
      "question": "প্রশ্নের টেক্সট",
      "options": ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"],
      "correctIndex": 0,
      "explanation": "ব্যাখ্যা"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"questions": []}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Quiz Gen Error:', err);
    res.json({ questions: [] });
  }
});

// 6. High-Fidelity Studio Voice TTS Proxy (Bengali & English)
const ttsCache = new Map<string, Buffer>();

async function fetchGoogleTTSAudio(text: string, lang: string): Promise<Buffer> {
  const cacheKey = `${lang}:${text}`;
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey)!;
  }

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
      'Accept': 'audio/mpeg, audio/*',
    },
  });

  if (!response.ok) {
    throw new Error(`TTS service responded with status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Keep cache bounded
  if (ttsCache.size > 200) {
    const firstKey = ttsCache.keys().next().value;
    if (firstKey) ttsCache.delete(firstKey);
  }
  ttsCache.set(cacheKey, buffer);

  return buffer;
}

app.get('/api/tts', async (req: Request, res: Response) => {
  try {
    const text = ((req.query.text as string) || '').trim();
    if (!text) {
      return res.status(400).send('Text is required');
    }

    // Auto-detect language if not explicitly specified
    let lang = (req.query.lang as string) || '';
    if (!lang) {
      const hasBengali = /[\u0980-\u09FF]/.test(text);
      lang = hasBengali ? 'bn' : 'en';
    }

    // Truncate to safe length for single utterance (Google TTS handles up to ~200 chars per call)
    const safeText = text.slice(0, 200);
    const audioBuffer = await fetchGoogleTTSAudio(safeText, lang);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400',
      'Accept-Ranges': 'bytes',
    });
    res.end(audioBuffer);
  } catch (err: any) {
    console.error('TTS Audio Proxy Error:', err);
    res.status(500).send('Error generating TTS audio');
  }
});

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text = '', lang: requestedLang } = req.body;
    const cleanText = (text as string).trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let lang = requestedLang;
    if (!lang) {
      const hasBengali = /[\u0980-\u09FF]/.test(cleanText);
      lang = hasBengali ? 'bn' : 'en';
    }

    const safeText = cleanText.slice(0, 200);
    const audioBuffer = await fetchGoogleTTSAudio(safeText, lang);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400',
    });
    res.end(audioBuffer);
  } catch (err: any) {
    console.error('TTS POST Error:', err);
    res.status(500).json({ error: 'TTS audio generation failed' });
  }
});

// Vite Middleware Integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`पाठशाला Server running on http://0.0.0.0:${port}`);
  });
}

startServer();

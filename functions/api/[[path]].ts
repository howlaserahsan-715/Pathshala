/**
 * Pathshala API — Cloudflare Pages Functions
 * Routes under /api/*
 *
 * Auth: email + password (PBKDF2-SHA256, 120k iterations), HttpOnly session cookie.
 * Data: Cloudflare D1 (users, sessions, user_data, questions, announcements, attempts).
 * AI:   Gemini REST API when GEMINI_API_KEY is configured, otherwise Bengali fallback content.
 */

type Env = {
  DB: any;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  SUPERADMIN_EMAILS?: string;
};

const SESSION_COOKIE = 'ps_session';
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 120000;
const DATA_KINDS = new Set(['errors', 'revisions', 'planner', 'settings']);

const enc = new TextEncoder();

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function randomHex(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function hashPassword(password: string, saltHex: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function sessionCookie(token: string, maxAgeSeconds: number, secure: boolean) {
  const bits = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) bits.push('Secure');
  return bits.join('; ');
}

function publicUser(row: any) {
  if (!row) return null;
  let completedTopics: string[] = [];
  let bookmarkedTopics: string[] = [];
  try {
    completedTopics = JSON.parse(row.completed_topics || '[]');
  } catch {
    completedTopics = [];
  }
  try {
    bookmarkedTopics = JSON.parse(row.bookmarked_topics || '[]');
  } catch {
    bookmarkedTopics = [];
  }
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    targetExam: row.target_exam || '',
    studyMinutes: Number(row.study_minutes || 0),
    currentStreak: Number(row.current_streak || 0),
    score: Number(row.score || 0),
    lastActiveDate: row.last_active_date || '',
    completedTopics,
    bookmarkedTopics,
    registeredDate: row.registered_date || '',
    status: row.status || 'active',
  };
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function currentUser(request: Request, env: Env) {
  const token = parseCookies(request.headers.get('Cookie'))[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?',
  )
    .bind(tokenHash, Date.now())
    .first();
  if (!row) return null;
  if (row.status === 'blocked') return null;
  return row;
}

async function requireUser(request: Request, env: Env) {
  const user = await currentUser(request, env);
  if (!user) return { user: null, response: json({ error: 'লগইন প্রয়োজন।' }, 401) };
  return { user, response: null };
}

async function requireAdmin(request: Request, env: Env) {
  const result = await requireUser(request, env);
  if (result.response) return result;
  if (result.user.role !== 'superadmin') {
    return { user: result.user, response: json({ error: 'শুধু সুপার এডমিন এই কাজ করতে পারেন।' }, 403) };
  }
  return result;
}

function todayIso() {
  return new Date().toISOString();
}

/* ------------------------------------------------------------------ */
/* AI fallbacks (used when GEMINI_API_KEY is absent)                   */
/* ------------------------------------------------------------------ */

function fallbackClarification(subject: string, topic: string) {
  return `### 📖 বিষয়: ${subject}
#### 📌 টপিক: ${topic}

---

#### ১. 💡 মূল ধারণা (Core Concept)
**"${topic}"** বিষয়টি বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার জন্য একটি অত্যন্ত গুরুত্বপূর্ণ অধ্যায়।
- পরীক্ষায় এ টপিক থেকে সাধারণত মৌলিক নিয়মাবলী, ব্যতিক্রমী উদাহরণ এবং সরাসরি প্রয়োগভিত্তিক প্রশ্ন আসে।
- ব্যাকরণ ও গণিতের ক্ষেত্রে সূত্রের পেছনের যৌক্তিক কারণটি মনে রাখলে দ্রুত অপশন এলিমিনেট করা সম্ভব হয়।

#### ২. ⚡ বিসিএস ও বিগত সালের পরীক্ষার ধরন (Exam Patterns)
- **বিগত সালের ট্রেন্ড:** বিগত ৩৫তম থেকে ৪৬তম বিসিএস প্রিলিমিনারিতে এ সম্পর্কিত গড়ে ১-২টি প্রশ্ন এসেছে।
- **সাধারণ প্রশ্ন ফরম্যাট:** সরাসরি সংজ্ঞা অপেক্ষা "নিচের কোনটি সঠিক উদাহরণ?" কিংবা "ব্যতিক্রমী রূপ" সংক্রান্ত প্রশ্ন বেশি আসে।

#### ৩. 🎯 সুপার শর্টকাট ও ছন্দের টিপস (Mnemonic Tips)
- মনে রাখার টেকনিক: মূল নিয়মটি ১ লাইনে নোটবুকে লিখে রাখুন।
- বিকল্প অপশনগুলো খেয়াল করুন এবং ভুল উত্তরগুলো আগে বাদ দেওয়ার অভ্যাস করুন (Negative elimination method)।

#### ৪. ⚠️ পরীক্ষার্থীদের সাধারণ ভুল (Common Pitfalls)
- তাড়াহুড়া করে প্রশ্ন সম্পূর্ণ না পড়ে উত্তর দাগানো।
- ব্যতিক্রমী উদাহরণগুলোকে সাধারণ নিয়মের অন্তর্ভুক্ত মনে করা।

---

💡 *টিপ:* কনসেপ্টটি ভালোভাবে মাথায় রাখতে নিচের প্র্যাকটিস প্রশ্নগুলোর উত্তর দিন এবং সিলেবাসে টিক দিন!`;
}

function fallbackVivaFeedback(answer: string) {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.min(20, Math.max(12, Math.floor(14 + (wordCount > 30 ? 4 : wordCount > 15 ? 2 : 0))));
  return {
    score,
    maxScore: 20,
    impression: score >= 17 ? 'চমৎকার ও আত্মবিশ্বাসী' : 'সন্তোষজনক, তবে আরও ডেটানির্ভর হওয়া প্রয়োজন',
    strengths: [
      'প্রশ্নের সাথে প্রাসঙ্গিক উত্তর দেওয়া হয়েছে।',
      'ভাষা ও বাচনভঙ্গিতে শালীনতা বজায় রয়েছে।',
      'মৌলিক ধারণা উপস্থাপন ইতিবাচক।',
    ],
    improvements: [
      'সংবিধানের নির্দিষ্ট অনুচ্ছেদ বা সঠিক সাল/পরিসংখ্যান যুক্ত করলে উত্তরের ওজন বৃদ্ধি পাবে।',
      'অতিরিক্ত ভূমিকা না বাড়িয়ে প্রথম লাইনেই সরাসরি মূল বক্তব্যে চলে যাওয়া ভালো।',
    ],
    modelAnswer:
      'মার্জিত ভঙ্গিতে শুরু করে মূল তথ্য, প্রাসঙ্গিক অনুচ্ছেদ বা জাতীয় গুরুত্ব উল্লেখ করে ২-৩ বাক্যে ইতিবাচকভাবে শেষ করা ভাইভা বোর্ডের কাছে সবচেয়ে গ্রহণযোগ্য।',
  };
}

const FALLBACK_GK = {
  items: [
    {
      title: 'বাংলাদেশ অর্থনৈতিক সমীক্ষা ও জিডিপি প্রবৃদ্ধি',
      category: 'বাংলাদেশ বিষয়াবলী',
      date: 'আজকের আপডেট',
      details:
        'বাংলাদেশ পরিসংখ্যান ব্যুরো ও অর্থ মন্ত্রণালয়ের সর্বশেষ তথ্য অনুসারে বৈদেশিক মুদ্রার রিজার্ভ ও রেমিট্যান্স প্রবাহে ইতিবাচক ধারা পরিলক্ষিত হচ্ছে।',
      examTip:
        'মাথাপিছু আয় এবং জিডিপিতে বিভিন্ন খাতের (কৃষি, শিল্প, সেবা) অবদান বিসিএস প্রিলিমিনারি ও লিখিত উভয় পরীক্ষার জন্যই অত্যন্ত গুরুত্বপূর্ণ।',
    },
    {
      title: 'আন্তর্জাতিক জলবায়ু সম্মেলন ও পরিবেশ কূটনীতি',
      category: 'আন্তর্জাতিক বিষয়াবলী',
      date: 'আজকের আপডেট',
      details:
        'জাতিসংঘের জলবায়ু তহবিল ও লস অ্যান্ড ড্যামেজ ফান্ড কার্যকর করার ব্যাপারে উন্নয়নশীল দেশগুলোর পক্ষে বাংলাদেশের বলিষ্ঠ অবস্থান অব্যাহত।',
      examTip: 'কপ (COP) সম্মেলনের স্বাগতিক দেশ ও প্রধান লক্ষ্যগুলো মুখস্থ রাখুন।',
    },
    {
      title: 'কৃত্রিম বুদ্ধিমত্তা ও সাইবার নিরাপত্তা নীতিমালা',
      category: 'বিজ্ঞান ও প্রযুক্তি',
      date: 'আজকের আপডেট',
      details:
        'সরকারি সেবা ও শিক্ষায় প্রযুক্তির নিরাপদ ব্যবহারের লক্ষ্যে নতুন ডেটা সুরক্ষা ও এআই গাইডলাইন বাস্তবায়নাধীন।',
      examTip:
        'আইসিটি অংশে ক্লাউড কম্পিউটিং ও সাইবার নিরাপত্তার মৌলিক টার্মগুলো থেকে প্রশ্ন আসার সম্ভাবনা বেশি।',
    },
  ],
};

const FALLBACK_QUIZ = {
  questions: [
    {
      id: 'q-fallback-1',
      subject: 'বাংলাদেশ বিষয়াবলী',
      question: 'বাংলাদেশের জাতীয় সংসদে সংরক্ষিত নারী আসনের সংখ্যা কতটি?',
      options: ['৩০টি', '৪৫টি', '৫০টি', '৬০টি'],
      correctIndex: 2,
      explanation:
        'সংবিধানের অনুচ্ছেদ ৬৫(৩) অনুযায়ী জাতীয় সংসদে মহিলাদের জন্য সংরক্ষিত ৫০টি আসন রয়েছে।',
    },
    {
      id: 'q-fallback-2',
      subject: 'বাংলা ভাষা ও সাহিত্য',
      question: '"শেষের কবিতা" রবীন্দ্রনাথ ঠাকুরের কোন ধরনের সাহিত্যকর্ম?',
      options: ['কাব্যগ্রন্থ', 'উপন্যাস', 'নাটক', 'ছোটগল্প'],
      correctIndex: 1,
      explanation:
        '১৯২৮ সালে রচিত "শেষের কবিতা" রবীন্দ্রনাথ ঠাকুরের একটি বিখ্যাত রোমান্টিক কাব্যধর্মী উপন্যাস।',
    },
  ],
};

async function gemini(env: Env, prompt: string, jsonMode = false): Promise<string | null> {
  if (!env.GEMINI_API_KEY) return null;
  try {
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          ...(jsonMode ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
        }),
      },
    );
    if (!response.ok) return null;
    const data: any = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return null;
    const text = parts.map((p: any) => p?.text || '').join('').trim();
    return text || null;
  } catch {
    return null;
  }
}

function parseJsonLoose(text: string | null, fallback: any) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}

/* ------------------------------------------------------------------ */
/* TTS proxy                                                           */
/* ------------------------------------------------------------------ */

const ttsCache = new Map<string, ArrayBuffer>();

async function googleTts(text: string, lang: string) {
  const key = `${lang}:${text}`;
  const cached = ttsCache.get(key);
  if (cached) return cached;

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://translate.google.com/',
      Accept: 'audio/mpeg, audio/*',
    },
  });
  if (!response.ok) throw new Error(`TTS ${response.status}`);
  const buffer = await response.arrayBuffer();
  if (ttsCache.size > 100) {
    const first = ttsCache.keys().next().value;
    if (first) ttsCache.delete(first);
  }
  ttsCache.set(key, buffer);
  return buffer;
}

function ttsLang(text: string, requested?: string) {
  if (requested) return requested;
  return /[\u0980-\u09FF]/.test(text) ? 'bn' : 'en';
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

export const onRequest: any = async (context: any) => {
  const { request, env } = context as { request: Request; env: Env };
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '/').replace(/\/+$/, '') || '/';
  const method = request.method.toUpperCase();
  const secure = url.protocol === 'https:';

  try {
    /* ---------------- health ---------------- */
    if (path === '/health' && method === 'GET') {
      return json({ status: 'ok', timestamp: todayIso() });
    }

    /* ---------------- auth ---------------- */
    if (path === '/auth/register' && method === 'POST') {
      const body = await readJson(request);
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim();
      const password = String(body.password || '');
      const targetExam = String(body.targetExam || '').trim();

      if (!validEmail(email)) return json({ error: 'সঠিক ইমেইল ঠিকানা দিন।' }, 400);
      if (!name) return json({ error: 'আপনার নাম দিন।' }, 400);
      if (password.length < 8) return json({ error: 'পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।' }, 400);

      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (existing) return json({ error: 'এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। লগইন করুন।' }, 409);

      const total = await env.DB.prepare('SELECT COUNT(*) AS count FROM users').first();
      const superEmails = (env.SUPERADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const isFirstUser = Number(total?.count || 0) === 0;
      const role = isFirstUser || superEmails.includes(email) ? 'superadmin' : 'student';

      const id = crypto.randomUUID();
      const salt = randomHex(16);
      const passwordHash = await hashPassword(password, salt);
      const now = todayIso();
      const registeredDate = new Date().toLocaleDateString('bn-BD');

      await env.DB.prepare(
        `INSERT INTO users
         (id, email, name, password_hash, password_salt, role, target_exam, status,
          study_minutes, current_streak, score, last_active_date, completed_topics,
          bookmarked_topics, registered_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0, 1, 100, ?, '[]', '[]', ?, ?)`,
      )
        .bind(id, email, name, passwordHash, salt, role, targetExam, now, registeredDate, now)
        .run();

      const token = randomHex(32);
      const tokenHash = await sha256Hex(token);
      const expiresAt = Date.now() + SESSION_DAYS * 86400000;
      await env.DB.prepare(
        'INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      )
        .bind(tokenHash, id, expiresAt, Date.now())
        .run();

      const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      return json(
        { user: publicUser(row), firstUser: isFirstUser },
        201,
        { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400, secure) },
      );
    }

    if (path === '/auth/login' && method === 'POST') {
      const body = await readJson(request);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!email || !password) return json({ error: 'ইমেইল ও পাসওয়ার্ড দিন।' }, 400);

      const row = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
      if (!row) return json({ error: 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' }, 401);
      if (row.status === 'blocked') {
        return json({ error: 'আপনার অ্যাকাউন্ট ব্লক করা হয়েছে। সুপার এডমিনের সাথে যোগাযোগ করুন।' }, 403);
      }

      const hash = await hashPassword(password, row.password_salt);
      if (!safeEqual(hash, row.password_hash)) {
        return json({ error: 'পাসওয়ার্ড সঠিক নয়।' }, 401);
      }

      const token = randomHex(32);
      const tokenHash = await sha256Hex(token);
      const expiresAt = Date.now() + SESSION_DAYS * 86400000;
      await env.DB.prepare(
        'INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      )
        .bind(tokenHash, row.id, expiresAt, Date.now())
        .run();
      await env.DB.prepare('UPDATE users SET last_active_date = ? WHERE id = ?')
        .bind(todayIso(), row.id)
        .run();

      return json(
        { user: publicUser(row) },
        200,
        { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400, secure) },
      );
    }

    if (path === '/auth/logout' && method === 'POST') {
      const token = parseCookies(request.headers.get('Cookie'))[SESSION_COOKIE];
      if (token) {
        const tokenHash = await sha256Hex(token);
        await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
      }
      return json({ ok: true }, 200, {
        'Set-Cookie': sessionCookie('', 0, secure),
      });
    }

    if (path === '/auth/me' && method === 'GET') {
      const user = await currentUser(request, env);
      if (!user) return json({ user: null }, 200);
      return json({ user: publicUser(user) });
    }

    if (path === '/auth/change-password' && method === 'POST') {
      const auth = await requireUser(request, env);
      if (auth.response) return auth.response;
      const body = await readJson(request);
      const current = String(body.currentPassword || '');
      const next = String(body.newPassword || '');
      if (next.length < 8) return json({ error: 'নতুন পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।' }, 400);
      const hash = await hashPassword(current, auth.user.password_salt);
      if (!safeEqual(hash, auth.user.password_hash)) {
        return json({ error: 'বর্তমান পাসওয়ার্ড সঠিক নয়।' }, 401);
      }
      const salt = randomHex(16);
      const nextHash = await hashPassword(next, salt);
      await env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?')
        .bind(nextHash, salt, auth.user.id)
        .run();
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?')
        .bind(auth.user.id, await sha256Hex(parseCookies(request.headers.get('Cookie'))[SESSION_COOKIE] || ''))
        .run();
      return json({ ok: true });
    }

    if (path === '/auth/reset-request' && method === 'POST') {
      const body = await readJson(request);
      const email = String(body.email || '').trim().toLowerCase();
      if (!validEmail(email)) return json({ error: 'সঠিক ইমেইল দিন।' }, 400);
      const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?').bind(email).first();
      // Do not reveal whether an account exists.
      if (user) {
        const pending = await env.DB.prepare(
          "SELECT id FROM password_resets WHERE user_id = ? AND status = 'pending'",
        )
          .bind(user.id)
          .first();
        if (!pending) {
          await env.DB.prepare(
            'INSERT INTO password_resets (id, user_id, email, status, requested_at) VALUES (?, ?, ?, ?, ?)',
          )
            .bind(crypto.randomUUID(), user.id, user.email, 'pending', todayIso())
            .run();
        }
      }
      return json({
        ok: true,
        message: 'রিসেট রিকোয়েস্ট গ্রহণ করা হয়েছে। সুপার এডমিন পাসওয়ার্ড রিসেট করে দেবেন।',
      });
    }

    /* ---------------- profile ---------------- */
    if (path === '/me' && method === 'GET') {
      const auth = await requireUser(request, env);
      if (auth.response) return auth.response;
      return json({ user: publicUser(auth.user) });
    }

    if (path === '/me' && (method === 'PATCH' || method === 'PUT')) {
      const auth = await requireUser(request, env);
      if (auth.response) return auth.response;
      const body = await readJson(request);
      const fields: string[] = [];
      const values: unknown[] = [];

      if (typeof body.name === 'string' && body.name.trim()) {
        fields.push('name = ?');
        values.push(body.name.trim());
      }
      if (typeof body.targetExam === 'string') {
        fields.push('target_exam = ?');
        values.push(body.targetExam.trim());
      }
      if (Number.isFinite(Number(body.studyMinutes))) {
        fields.push('study_minutes = ?');
        values.push(Math.max(0, Math.round(Number(body.studyMinutes))));
      }
      if (Number.isFinite(Number(body.currentStreak))) {
        fields.push('current_streak = ?');
        values.push(Math.max(0, Math.round(Number(body.currentStreak))));
      }
      if (Number.isFinite(Number(body.score))) {
        fields.push('score = ?');
        values.push(Math.max(0, Math.round(Number(body.score))));
      }
      if (Array.isArray(body.completedTopics)) {
        fields.push('completed_topics = ?');
        values.push(JSON.stringify(body.completedTopics.slice(0, 2000)));
      }
      if (Array.isArray(body.bookmarkedTopics)) {
        fields.push('bookmarked_topics = ?');
        values.push(JSON.stringify(body.bookmarkedTopics.slice(0, 500)));
      }

      if (fields.length) {
        fields.push('last_active_date = ?');
        values.push(todayIso());
        values.push(auth.user.id);
        await env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
          .bind(...values)
          .run();
      }
      const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(auth.user.id).first();
      return json({ user: publicUser(row) });
    }

    /* ---------------- per-user data blobs ---------------- */
    const dataMatch = path.match(/^\/me\/data\/([a-z-]+)$/);
    if (dataMatch) {
      const kind = dataMatch[1];
      if (!DATA_KINDS.has(kind)) return json({ error: 'Unknown data kind.' }, 400);
      const auth = await requireUser(request, env);
      if (auth.response) return auth.response;

      if (method === 'GET') {
        const row = await env.DB.prepare(
          'SELECT payload, updated_at FROM user_data WHERE user_id = ? AND kind = ?',
        )
          .bind(auth.user.id, kind)
          .first();
        let data: unknown = null;
        if (row) {
          try {
            data = JSON.parse(row.payload);
          } catch {
            data = null;
          }
        }
        return json({ kind, data, updatedAt: row?.updated_at || null });
      }

      if (method === 'PUT') {
        const body = await readJson(request);
        const payload = JSON.stringify(body.data ?? null);
        if (payload.length > 512000) return json({ error: 'ডেটা অনেক বড়।' }, 413);
        await env.DB.prepare(
          `INSERT INTO user_data (user_id, kind, payload, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id, kind) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
        )
          .bind(auth.user.id, kind, payload, Date.now())
          .run();
        return json({ ok: true });
      }
    }

    /* ---------------- public content ---------------- */
    if (path === '/questions' && method === 'GET') {
      const rows = await env.DB.prepare('SELECT * FROM questions ORDER BY created_at DESC LIMIT 500').all();
      const questions = (rows.results || []).map((r: any) => {
        let options: string[] = [];
        try {
          options = JSON.parse(r.options);
        } catch {
          options = [];
        }
        return {
          id: r.id,
          subject: r.subject,
          question: r.question,
          options,
          correctIndex: Number(r.correct_index),
          explanation: r.explanation,
          difficulty: r.difficulty,
        };
      });
      return json({ questions });
    }

    if (path === '/announcements' && method === 'GET') {
      const rows = await env.DB.prepare(
        'SELECT * FROM announcements ORDER BY is_important DESC, created_at DESC LIMIT 100',
      ).all();
      const announcements = (rows.results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        date: r.date,
        author: r.author,
        isImportant: Boolean(r.is_important),
      }));
      return json({ announcements });
    }

    if (path === '/leaderboard' && method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT email, name, target_exam, score, study_minutes, current_streak, completed_topics
         FROM users WHERE status = 'active' ORDER BY score DESC LIMIT 50`,
      ).all();
      const users = (rows.results || []).map((r: any) => {
        let completed: string[] = [];
        try {
          completed = JSON.parse(r.completed_topics || '[]');
        } catch {
          completed = [];
        }
        return {
          id: r.email,
          email: r.email,
          name: r.name,
          role: 'student',
          targetExam: r.target_exam || '',
          studyMinutes: Number(r.study_minutes || 0),
          currentStreak: Number(r.current_streak || 0),
          lastActiveDate: '',
          score: Number(r.score || 0),
          completedTopics: completed,
          bookmarkedTopics: [],
          status: 'active',
        };
      });
      return json({ users });
    }

    if (path === '/attempts' && method === 'POST') {
      const auth = await requireUser(request, env);
      if (auth.response) return auth.response;
      const body = await readJson(request);
      const total = Math.max(0, Math.round(Number(body.total) || 0));
      const correct = Math.max(0, Math.round(Number(body.correct) || 0));
      const score = Number(body.score) || 0;
      await env.DB.prepare(
        'INSERT INTO attempts (id, user_id, subject, total, correct, score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
        .bind(
          crypto.randomUUID(),
          auth.user.id,
          String(body.subject || ''),
          total,
          correct,
          score,
          todayIso(),
        )
        .run();
      return json({ ok: true }, 201);
    }

    /* ---------------- admin ---------------- */
    if (path === '/admin/users' && method === 'GET') {
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;
      const rows = await env.DB.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
      const users: Record<string, any> = {};
      for (const row of rows.results || []) {
        const user = publicUser(row);
        if (user) users[user.email] = user;
      }
      return json({ users });
    }

    const adminUserMatch = path.match(/^\/admin\/users\/([^/]+)$/);
    if (adminUserMatch) {
      const email = decodeURIComponent(adminUserMatch[1]).toLowerCase();
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;

      if (method === 'PATCH') {
        const body = await readJson(request);
        if (email === auth.user.email && body.role && body.role !== 'superadmin') {
          return json({ error: 'নিজের এডমিন রোল সরানো যাবে না।' }, 400);
        }
        const fields: string[] = [];
        const values: unknown[] = [];
        if (body.role === 'student' || body.role === 'superadmin') {
          fields.push('role = ?');
          values.push(body.role);
        }
        if (body.status === 'active' || body.status === 'blocked') {
          if (email === auth.user.email && body.status === 'blocked') {
            return json({ error: 'নিজের অ্যাকাউন্ট ব্লক করা যাবে না।' }, 400);
          }
          fields.push('status = ?');
          values.push(body.status);
          if (body.status === 'blocked') {
            const target = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
            if (target) {
              await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(target.id).run();
            }
          }
        }
        if (!fields.length) return json({ error: 'কোনো পরিবর্তন দেওয়া হয়নি।' }, 400);
        values.push(email);
        await env.DB.prepare(`UPDATE users SET ${fields.join(', ')} WHERE email = ?`)
          .bind(...values)
          .run();
        return json({ ok: true });
      }

      if (method === 'DELETE') {
        if (email === auth.user.email) return json({ error: 'নিজের অ্যাকাউন্ট মুছে ফেলা যাবে না।' }, 400);
        const target = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (!target) return json({ error: 'ইউজার পাওয়া যায়নি।' }, 404);
        await env.DB.batch([
          env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(target.id),
          env.DB.prepare('DELETE FROM user_data WHERE user_id = ?').bind(target.id),
          env.DB.prepare('DELETE FROM password_resets WHERE user_id = ?').bind(target.id),
          env.DB.prepare('DELETE FROM attempts WHERE user_id = ?').bind(target.id),
          env.DB.prepare('DELETE FROM users WHERE id = ?').bind(target.id),
        ]);
        return json({ ok: true });
      }
    }

    const adminPasswordMatch = path.match(/^\/admin\/users\/([^/]+)\/password$/);
    if (adminPasswordMatch && method === 'POST') {
      const email = decodeURIComponent(adminPasswordMatch[1]).toLowerCase();
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;
      const body = await readJson(request);
      const password = String(body.password || '');
      if (password.length < 8) return json({ error: 'পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।' }, 400);
      const salt = randomHex(16);
      const hash = await hashPassword(password, salt);
      const target = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
      if (!target) return json({ error: 'ইউজার পাওয়া যায়নি।' }, 404);
      await env.DB.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?')
        .bind(hash, salt, target.id)
        .run();
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(target.id).run();
      await env.DB.prepare(
        "UPDATE password_resets SET status = 'done', handled_at = ? WHERE user_id = ? AND status = 'pending'",
      )
        .bind(todayIso(), target.id)
        .run();
      return json({ ok: true });
    }

    if (path === '/admin/reset-requests' && method === 'GET') {
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;
      const rows = await env.DB.prepare(
        "SELECT * FROM password_resets WHERE status = 'pending' ORDER BY requested_at DESC LIMIT 100",
      ).all();
      return json({ requests: rows.results || [] });
    }

    if (path === '/admin/questions' && method === 'POST') {
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;
      const body = await readJson(request);
      const options = Array.isArray(body.options) ? body.options.map(String).slice(0, 6) : [];
      if (!String(body.question || '').trim() || options.length < 2) {
        return json({ error: 'প্রশ্ন ও অন্তত ২টি অপশন দিন।' }, 400);
      }
      const id = String(body.id || `q-${crypto.randomUUID()}`);
      await env.DB.prepare(
        `INSERT OR REPLACE INTO questions
         (id, subject, question, options, correct_index, explanation, difficulty, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          String(body.subject || 'সাধারণ জ্ঞান'),
          String(body.question).trim(),
          JSON.stringify(options),
          Math.max(0, Math.round(Number(body.correctIndex) || 0)),
          String(body.explanation || ''),
          String(body.difficulty || 'Medium'),
          todayIso(),
        )
        .run();
      return json({ ok: true, id }, 201);
    }

    const adminQuestionMatch = path.match(/^\/admin\/questions\/([^/]+)$/);
    if (adminQuestionMatch && method === 'DELETE') {
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;
      await env.DB.prepare('DELETE FROM questions WHERE id = ?')
        .bind(decodeURIComponent(adminQuestionMatch[1]))
        .run();
      return json({ ok: true });
    }

    if (path === '/admin/announcements' && method === 'POST') {
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;
      const body = await readJson(request);
      if (!String(body.title || '').trim() || !String(body.message || '').trim()) {
        return json({ error: 'শিরোনাম ও বার্তা দিন।' }, 400);
      }
      const id = String(body.id || `ann-${crypto.randomUUID()}`);
      await env.DB.prepare(
        `INSERT OR REPLACE INTO announcements
         (id, title, message, date, author, is_important, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          String(body.title).trim(),
          String(body.message).trim(),
          String(body.date || new Date().toLocaleDateString('bn-BD')),
          String(body.author || auth.user.name),
          body.isImportant ? 1 : 0,
          todayIso(),
        )
        .run();
      return json({ ok: true, id }, 201);
    }

    const adminAnnouncementMatch = path.match(/^\/admin\/announcements\/([^/]+)$/);
    if (adminAnnouncementMatch && method === 'DELETE') {
      const auth = await requireAdmin(request, env);
      if (auth.response) return auth.response;
      await env.DB.prepare('DELETE FROM announcements WHERE id = ?')
        .bind(decodeURIComponent(adminAnnouncementMatch[1]))
        .run();
      return json({ ok: true });
    }

    /* ---------------- AI ---------------- */
    if (path === '/ai/clarify' && method === 'POST') {
      const body = await readJson(request);
      const subject = String(body.subject || 'সাধারণ বিষয়');
      const topic = String(body.topic || '').trim();
      if (!topic) return json({ error: 'টপিকের নাম দেওয়া আবশ্যক।' }, 400);
      const prompt = `তুমি একজন অভিজ্ঞ বিসিএস ও সরকারি চাকরির স্পেশালিস্ট টিউটর ও শিক্ষক।
শিক্ষার্থী "${subject}" বিষয়ের "${topic}" টপিকটি সহজে বুঝতে চায়।
বাংলা ভাষায় মার্জিত, আকর্ষণীয় ও বুলেটপয়েন্ট আকারে নিচের বিষয়গুলোসহ একটি সম্পূর্ণ টিউটোরিয়াল লেকচার তৈরি করো:
১. 💡 সহজ ভাষায় মূল ধারণা (Core Concept & Fundamentals)
২. ⚡ বিগত বিসিএস/চাকরির পরীক্ষার আলোকে গুরুত্বপূর্ণ উদাহরণ (High-yield Exam Examples)
৩. 🎯 শর্টকাট মেমোরি টেকনিক বা মনে রাখার কৌশল (Mnemonic & Fast Solves)
৪. ⚠️ পরীক্ষার্থীদের সচরাচর ভুল (Common Pitfalls & Traps)
৫. 📝 ৩টি মডেল এমসিকিউ প্রশ্ন এবং উত্তরসহ ব্যাখ্যা।
সহজ ও সাবলীল প্রমিত বাংলায় লিখবে।`;
      const text = (await gemini(env, prompt)) || fallbackClarification(subject, topic);
      return json({ explanation: text });
    }

    if (path === '/ai/tutor' && method === 'POST') {
      const body = await readJson(request);
      const message = String(body.message || '').trim();
      if (!message) return json({ error: 'প্রশ্ন পাঠানো আবশ্যক।' }, 400);
      const prompt = `তুমি "পাঠশালা" স্টাডি রুমের বন্ধুত্বপূর্ণ সিনিয়র মেন্টর ও বিসিএস কোচ।
ব্যবহারকারীর প্রশ্ন: "${message}"
বিসিএস, ব্যাংক ও সরকারি চাকরি পরীক্ষার উপযোগী নিখুঁত, সহায়ক এবং অনুপ্রেরণাদায়ক উত্তর প্রমিত বাংলায় সংক্ষেপে দাও। গণিত বা ব্যাকরণের ক্ষেত্রে সহজ শর্টকাট নিয়ম উল্লেখ করো।`;
      const reply =
        (await gemini(env, prompt)) ||
        `আপনার প্রশ্নটির জন্য ধন্যবাদ! "${message}" এর ক্ষেত্রে সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো মৌলিক কনসেপ্ট পরিষ্কার রাখা। বিসিএস ও সরকারি চাকরির প্রস্তুতিতে বিগত সালের প্রশ্ন ও ব্যাখ্যা নিয়মিত চর্চা করুন। কনসেপ্ট ক্ল্যারিফায়ারে এই টপিকটি ইনপুট দিয়ে বিস্তারিত শর্টকাট দেখে নিতে পারেন।`;
      return json({ reply });
    }

    if (path === '/ai/viva' && method === 'POST') {
      const body = await readJson(request);
      const answer = String(body.answer || '').trim();
      if (!answer) return json({ error: 'আপনার উত্তর আবশ্যক।' }, 400);
      const prompt = `তুমি বিসিএস বা সরকারি চাকরির ভাইভা বোর্ডের একজন অভিজ্ঞ সম্মানিত চেয়ারম্যান/মেম্বার।
ভাইভার প্রশ্নটি ছিল: "${String(body.question || '')}"
প্রার্থীর দেওয়া উত্তর: "${answer}"

দয়া করে উত্তরটি মূল্যায়ন করে শুধুমাত্র একটি ভ্যালিড JSON অবজেক্ট আকারে আউটপুট দাও (কোনো অতিরিক্ত টেক্সট বা মার্কডাউন কোডব্লক ছাড়া):
{
  "score": 16,
  "maxScore": 20,
  "impression": "সংক্ষিপ্ত মূল্যায়ন",
  "strengths": ["শক্তি ১", "শক্তি ২"],
  "improvements": ["উন্নতির ক্ষেত্র ১", "উন্নতির ক্ষেত্র ২"],
  "modelAnswer": "বোর্ডের প্রত্যাশিত আদর্শ উত্তর"
}`;
      const text = await gemini(env, prompt, true);
      return json(parseJsonLoose(text, fallbackVivaFeedback(answer)));
    }

    if (path === '/ai/gk-digest' && method === 'POST') {
      const prompt = `তুমি বিসিএস ও সরকারি চাকরির কারেন্ট অ্যাফেয়ার্স বিশেষজ্ঞ।
সাম্প্রতিক গুরুত্বপূর্ণ ৫টি কারেন্ট অ্যাফেয়ার্স ও সাধারণ জ্ঞান তথ্য JSON ফরম্যাটে দাও।
ফরম্যাট:
{
  "items": [
    {
      "title": "শিরোনাম",
      "category": "বাংলাদেশ / আন্তর্জাতিক / অর্থনীতি / বিজ্ঞান ও প্রযুক্তি",
      "date": "তারিখ বা সময়",
      "details": "বিস্তারিত ২-৩ বাক্যে",
      "examTip": "চাকরির পরীক্ষার জন্য করণীয় টিপস"
    }
  ]
}`;
      const text = await gemini(env, prompt, true);
      const parsed = parseJsonLoose(text, null);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length) return json(parsed);
      return json(FALLBACK_GK);
    }

    if (path === '/ai/quiz' && method === 'POST') {
      const body = await readJson(request);
      const subject = String(body.subject || 'সাধারণ জ্ঞান ও বিষয়াবলী');
      const count = Math.min(20, Math.max(1, Math.round(Number(body.count) || 5)));
      const prompt = `তুমি বিসিএস ও সরকারি চাকরির প্রশ্ন প্রণেতা বিশেষজ্ঞ।
"${subject}" বিষয় থেকে ${count}টি অত্যন্ত বাস্তবসম্মত ও মানসম্মত প্রিলিমিনারি এমসিকিউ প্রশ্ন JSON ফরম্যাটে দাও।
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
      const text = await gemini(env, prompt, true);
      const parsed = parseJsonLoose(text, null);
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length) return json(parsed);
      return json(FALLBACK_QUIZ);
    }

    /* ---------------- TTS ---------------- */
    if (path === '/tts' && (method === 'GET' || method === 'POST')) {
      try {
        let text = '';
        let requested = '';
        if (method === 'GET') {
          text = String(url.searchParams.get('text') || '').trim();
          requested = String(url.searchParams.get('lang') || '');
        } else {
          const body = await readJson(request);
          text = String(body.text || '').trim();
          requested = String(body.lang || '');
        }
        if (!text) return json({ error: 'Text is required' }, 400);
        const audio = await googleTts(text.slice(0, 200), ttsLang(text, requested));
        return new Response(audio, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400',
            'Accept-Ranges': 'bytes',
          },
        });
      } catch {
        return json({ error: 'TTS audio generation failed' }, 502);
      }
    }

    return json({ error: 'Not found', path }, 404);
  } catch (error: any) {
    console.error('API error', path, error?.message || error);
    return json({ error: 'সার্ভারে একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' }, 500);
  }
};

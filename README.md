# পাঠশালা — Pathsala AI Study Room

বিসিএস, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও NTRCA প্রস্তুতির সম্পূর্ণ এআই স্টাডি রুম।
React + Vite ফ্রন্টএন্ড, **Cloudflare Pages Functions** API এবং **Cloudflare D1** ডেটাবেস।

## যা যা আছে

- 🔐 আসল ইমেইল/পাসওয়ার্ড অ্যাকাউন্ট — PBKDF2-SHA256 হ্যাশ, HttpOnly সেশন কুকি
- ☁️ ক্লাউড সিঙ্ক — প্রোফাইল, স্টাডি টাইম, ভুল খাতা, রিভিশন কিউ D1-এ সংরক্ষিত
- 👑 সুপার এডমিন প্যানেল — ইউজার/রোল/ব্লক, প্রশ্ন ব্যাংক, নোটিশ, পাসওয়ার্ড রিসেট
- 📱 ইনস্টলযোগ্য PWA — অফলাইন শেল ক্যাশিং, হোম স্ক্রিনে যোগ করা যায়
- 🤖 AI টিউটর, কনসেপ্ট ক্ল্যারিফায়ার, ভাইভা সিমুলেটর, কুইজ ও GK ডাইজেস্ট
  (Gemini key না থাকলেও বিল্ট-ইন বাংলা ফলব্যাক কাজ করে)
- 📝 OMR মক টেস্ট, ভুল খাতা, স্পেসড রিভিশন, লিডারবোর্ড, পডকাস্ট ও ফোকাস রুম
- 🔎 SEO: meta/OG/Twitter কার্ড, JSON-LD, sitemap, robots, security headers

## লোকাল ডেভেলপমেন্ট

```powershell
npm install
npm run build
npm run preview      # wrangler pages dev + local D1
```

HMR সহ ডেভেলপ করতে দুটি টার্মিনাল:

```powershell
npm run dev:api      # API + local D1 on :8788
npm run dev          # Vite on :5173 (proxies /api → :8788)
```

প্রথমবার লোকাল D1 তৈরি করুন:

```powershell
npx wrangler d1 execute pathshala-db --local --file=./schema.sql
```

> Windows-এ wrangler চালাতে **Visual C++ Redistributable (x64)** লাগে
> (<https://aka.ms/vs/17/release/vc_redist.x64.exe>)।

## Cloudflare-এ ডিপ্লয়

### ১. D1 ডেটাবেস তৈরি

```powershell
npx wrangler login
npx wrangler d1 create pathshala-db
```

আউটপুটে পাওয়া `database_id` কপি করে `wrangler.toml`-এ বসান।

### ২. স্কিমা প্রয়োগ

```powershell
npm run db:init
```

### ৩. ডিপ্লয় (দুইভাবে)

**ক) সরাসরি আপলোড:**

```powershell
npm run deploy
```

**খ) GitHub → Cloudflare Pages (auto deploy):**

1. এই রিপো `main` ব্রাঞ্চে পুশ করুন।
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**।
3. Build command: `npm run build`, Output directory: `dist`।
4. Settings → Functions → **D1 database bindings** → Variable name: `DB`,
   Database: `pathshala-db`।
5. (ঐচ্ছিক) Settings → Environment variables → `GEMINI_API_KEY`।

### ৪. প্রথম অ্যাকাউন্ট

সাইটে প্রথম রেজিস্ট্রেশন করা অ্যাকাউন্টটি স্বয়ংক্রিয়ভাবে **সুপার এডমিন** হয়।
`creativeteamoperation@gmail.com` সবসময় সুপার এডমিন হিসেবে রেজিস্টার হবে
(`SUPERADMIN_EMAILS`)।

## API রুট

| Method | Path | কাজ |
| --- | --- | --- |
| POST | `/api/auth/register` | রেজিস্ট্রেশন + সেশন |
| POST | `/api/auth/login` | লগইন |
| POST | `/api/auth/logout` | লগআউট |
| GET | `/api/auth/me` | বর্তমান ইউজার |
| POST | `/api/auth/change-password` | পাসওয়ার্ড পরিবর্তন |
| POST | `/api/auth/reset-request` | পাসওয়ার্ড রিসেট রিকোয়েস্ট |
| PATCH | `/api/me` | প্রোফাইল আপডেট |
| GET/PUT | `/api/me/data/:kind` | errors / revisions / planner / settings |
| GET | `/api/questions`, `/api/announcements`, `/api/leaderboard` | পাবলিক কনটেন্ট |
| GET | `/api/admin/users` | ইউজার তালিকা (এডমিন) |
| PATCH/DELETE | `/api/admin/users/:email` | রোল/স্ট্যাটাস/ডিলিট |
| POST | `/api/admin/users/:email/password` | পাসওয়ার্ড রিসেট |
| GET | `/api/admin/reset-requests` | রিসেট রিকোয়েস্ট |
| POST/DELETE | `/api/admin/questions`, `/api/admin/announcements` | কনটেন্ট |
| POST | `/api/ai/*` | clarify / tutor / viva / gk-digest / quiz |
| GET/POST | `/api/tts` | বাংলা/ইংরেজি TTS প্রক্সি |

## টেক স্ট্যাক

React 19 · Vite 8 · Tailwind CSS 4 · lucide-react · Cloudflare Pages Functions · D1 · Web Crypto (PBKDF2)

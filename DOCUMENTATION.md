# 🏫 প্রশ্নপত্র জেনারেটর (Question Paper Generator)

## 📋 প্রকল্প পরিচিতি

এটি একটি ওয়েব-ভিত্তিক অ্যাপ্লিকেশন যা শিক্ষকদের জন্য স্কুল পরীক্ষার প্রশ্নপত্র তৈরি করতে সাহায্য করে। এই সিস্টেমে শিক্ষকরা বিভিন্ন ধরনের প্রশ্ন তৈরি করতে পারেন এবং সেগুলো থেকে প্রিন্ট-যোগ্য PDF তৈরি করতে পারেন।

### মূল বৈশিষ্ট্যসমূহ:
- ✅ বিভিন্ন ধরনের প্রশ্ন তৈরি করা যায় (MCQ, সৃজনশীল, সংক্ষিপ্ত, ইত্যাদি)
- ✅ গাণিতিক সূত্র ও ফর্মুলা সাপোর্ট (LaTeX/KaTeX)
- ✅ ছবি ও ডায়াগ্রাম যোগ করার সুবিধা
- ✅ স্বয়ংক্রিয়ভাবে PDF জেনারেট করা
- ✅ প্রিন্ট প্রিভিউ দেখার সুবিধা
- ✅ ড্যাশবোর্ডে সংরক্ষিত প্রশ্নপত্র দেখা ও পরিচালনা
- ✅ অনলাইন সংরক্ষণ (Supabase)

---

## 🛠️ প্রযুক্তি স্ট্যাক

| অংশ | প্রযুক্তি | ব্যবহার |
|------|----------|---------|
| ফ্রন্টএন্ড | React + TypeScript | ইউজার ইন্টারফেস তৈরি |
| স্টাইলিং | Tailwind CSS + shadcn/ui | ডিজাইন ও কম্পোনেন্ট |
| ব্যাকএন্ড | Supabase | ডাটাবেস ও অথেনটিকেশন |
| হোস্টিং | Vercel | লাইভ সার্ভার |
| PDF জেনারেশন | @react-pdf/renderer | PDF তৈরি |
| ম্যাথ রেন্ডারিং | KaTeX | গাণিতিক সূত্র প্রদর্শন |
| রাউটিং | React Router | পেজ নেভিগেশন |

---

## 📁 প্রকল্পের কাঠামো (Folder Structure)

```
qgen/
├── src/
│   ├── app/
│   │   ├── components/          # রিইউজেবল কম্পোনেন্ট
│   │   │   ├── BlockEditor.tsx        # প্রশ্নের ব্লক এডিটর
│   │   │   ├── QuestionRenderer.tsx   # প্রশ্ন রেন্ডারার
│   │   │   ├── PDFDownloadButton.tsx  # PDF ডাউনলোড বাটন
│   │   │   ├── GeneratePdfButton.tsx  # PDF জেনারেট বাটন
│   │   │   ├── PrintPreviewPage.tsx    # প্রিন্ট প্রিভিউ
│   │   │   ├── MathSymbolHelper.tsx    # গাণিতিক চিহ্ন সাহায্যকারী
│   │   │   ├── HelpDialog.tsx          # হেল্প ডায়ালগ
│   │   │   ├── ui/                     # shadcn/ui কম্পোনেন্ট
│   │   │   └── mobile/                 # মোবাইল ভিউ কম্পোনেন্ট
│   │   ├── pages/              # মূল পেজগুলো
│   │   │   ├── Dashboard.tsx           # হোম পেজ - সব প্রশ্নপত্র দেখা
│   │   │   ├── QuestionBuilder.tsx     # প্রশ্ন তৈরির পেজ
│   │   │   ├── PaperSetup.tsx           # প্রশ্নপত্র সেটআপ
│   │   │   ├── A4Preview.tsx             # A4 প্রিভিউ
│   │   │   ├── Login.tsx                # লগইন পেজ
│   │   │   ├── Settings.tsx             # সেটিংস পেজ
│   │   │   └── Subscription.tsx         # সাবস্ক্রিপশন পেজ
│   │   ├── context/             # React Context
│   │   │   └── SubscriptionContext.tsx  # সাবস্ক্রিপশন ম্যানেজমেন্ট
│   │   ├── hooks/               # কাস্টম হুকস
│   │   │   ├── usePaper.ts              # প্রশ্নপত্র হুক
│   │   │   └── useIsMobile.ts           # মোবাইল ডিটেকশন
│   │   ├── utils/               # ইউটিলিটি ফাংশন
│   │   │   ├── supabaseClient.ts        # Supabase ক্লায়েন্ট
│   │   │   ├── storage.ts               # স্টোরেজ ম্যানেজমেন্ট
│   │   │   ├── pdfService.ts            # PDF জেনারেশন সার্ভিস
│   │   │   ├── helpers.ts                # হেল্পার ফাংশন
│   │   │   └── fontLoader.ts            # ফন্ট লোডার
│   │   ├── types.ts             # TypeScript টাইপ ডেফিনিশন
│   │   ├── routes.tsx           # রাউট কনফিগারেশন
│   │   └── App.tsx              # মূল অ্যাপ কম্পোনেন্ট
│   ├── styles/                  # গ্লোবাল স্টাইল
│   ├── components/             # পুরনো কম্পোনেন্ট (লেগ্যাসি)
│   ├── config/                  # কনফিগারেশন
│   └── main.tsx                 # অ্যাপ এন্ট্রি পয়েন্ট
├── supabase/
│   └── migrations/              # ডাটাবেস মাইগ্রেশন
├── public/                      # স্ট্যাটিক ফাইল
├── package.json                 # নোড প্যাকেজ কনফিগ
├── vite.config.ts               # Vite কনফিগারেশন
└── index.html                   # HTML এন্ট্রি পয়েন্ট
```

---

## 🚀 প্রকল্প চালানোর নিয়ম

### ধাপ ১: প্রজেক্ট ক্লোন করা
```bash
git clone <your-repo-url>
cd qgen
```

### ধাপ ২: নোড মডিউল ইনস্টল করা
```bash
npm install
# অথবা pnpm ব্যবহার করলে
pnpm install
```

### ধাপ ৩: এনভায়রনমেন্ট ভেরিয়েবল সেটআপ
`.env` ফাইল তৈরি করুন এবং নিচের ভেরিয়েবলগুলো যোগ করুন:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### ধাপ ৪: ডেভেলপমেন্ট সার্ভার চালানো
```bash
npm run dev
```

এখন ব্রাউজারে `http://localhost:5173` ওপেন করলে অ্যাপটি দেখা যাবে।

---

## 🗄️ ডাটাবেস স্ট্রাকচার (Supabase)

### টেবিল: `papers`
প্রশ্নপত্র সংরক্ষণের জন্য ব্যবহৃত হয়।

| কলাম | টাইপ | বর্ণনা |
|------|------|--------|
| id | uuid | অনন্য আইডি |
| setup | jsonb | প্রশ্নপত্র সেটআপ (ক্লাস, সাবজেক্ট, ইত্যাদি) |
| questions | jsonb | সব প্রশ্নের তালিকা |
| created_by_email | text | কে তৈরি করেছে |
| created_at | timestamp | তৈরির সময় |
| updated_at | timestamp | আপডেটের সময় |

### টেবিল: `questions`
একক প্রশ্ন সংরক্ষণের জন্য।

### টেবিল: `paper_versions`
প্রশ্নপত্রের পূর্ববর্তী ভার্সন সংরক্ষণ।

---

## 🔧 নতুন ফিচার যোগ করার নিয়ম

### ১. নতুন প্রশ্নের ধরন যোগ করা

[`src/app/types.ts`](src/app/types.ts:1) ফাইলে `QuestionType` টাইপে নতুন টাইপ যোগ করুন:

```typescript
export type QuestionType =
  | 'mcq'
  | 'fill-in-blanks'
  | 'true-false'
  // নতুন টাইপ যোগ করুন
  | 'new-question-type';
```

এরপর [`src/app/pages/QuestionBuilder.tsx`](src/app/pages/QuestionBuilder.tsx:35) ফাইলে `QUESTION_TYPES` অ্যারেতে নতুন প্রশ্নের ধরন যোগ করুন:

```typescript
const QUESTION_TYPES = [
  // ... বিদ্যমান টাইপগুলো
  { 
    value: 'new-question-type', 
    label: 'নতুন প্রশ্ন', 
    labelEn: 'New Question Type' 
  },
];
```

### ২. নতুন UI কম্পোনেন্ট যোগ করা

shadcn/ui ব্যবহার করে নতুন কম্পোনেন্ট যোগ করা যায়:

```bash
npx shadcn@latest add button
# অথবা
npx shadcn@latest add card
```

এটি স্বয়ংক্রিয়ভাবে `src/app/components/ui/` ফোল্ডারে কম্পোনেন্ট তৈরি করবে।

### ৩. নতুন পেজ যোগ করা

1. নতুন পেজ ফাইল তৈরি করুন: `src/app/pages/NewPage.tsx`
2. [`src/app/routes.tsx`](src/app/routes.tsx:1) ফাইলে রাউট যোগ করুন:

```typescript
import NewPage from './pages/NewPage';

const routes = [
  // ... বিদ্যমান রাউটগুলো
  {
    path: '/new-page',
    element: <NewPage />,
  },
];
```

### ৪. প্রশ্ন রেন্ডারিং কাস্টমাইজ করা

[`src/app/components/QuestionRenderer.tsx`](src/app/components/QuestionRenderer.tsx:1) ফাইলে প্রশ্ন রেন্ডারিং লজিক পরিবর্তন করুন। এখানে বিভিন্ন প্রশ্নের ধরন কীভাবে প্রদর্শিত হবে তা নিয়ন্ত্রণ করা হয়।

### ৫. PDF আউটপুট কাস্টমাইজ করা

[`src/app/utils/pdfService.ts`](src/app/utils/pdfService.ts:1) ফাইলে PDF জেনারেশন লজিক আছে। এখানে:
- পেজ লেআউট পরিবর্তন করা যায়
- হেডার/ফুটার কাস্টমাইজ করা যায়
- ফন্ট সাইজ পরিবর্তন করা যায়

---

## 🎨 ডিজাইন কাস্টমাইজেশন

### থিম পরিবর্তন
[`src/styles/theme.css`](src/styles/theme.css:1) ফাইলে CSS ভেরিয়েবল পরিবর্তন করুন:

```css
:root {
  --primary: #your-primary-color;
  --secondary: #your-secondary-color;
  --background: #your-background-color;
}
```

### ফন্ট পরিবর্তন
[`src/app/utils/fontLoader.ts`](src/app/utils/fontLoader.ts:1) ফাইলে নতুন ফন্ট যোগ করুন এবং বাংলা সাপোর্ট নিশ্চিত করুন।

---

## 📱 মোবাইল রেসপন্সিভ

প্রকল্পটি মোবাইল-ফ্রেন্ডলি। মোবাইল ভিউ:
- [`src/app/components/mobile/`](src/app/components/mobile/) ফোল্ডারে মোবাইল-স্পেসific কম্পোনেন্ট আছে
- [`src/app/hooks/useIsMobile.ts`](src/app/hooks/useIsMobile.ts:1) হুক দিয়ে মোবাইল ডিভাইস ডিটেক্ট করা হয়

---

## 🔐 অথেনটিকেশন

Supabase Auth ব্যবহার করা হয়েছে। লগইন সিস্টেম:
- [`src/app/pages/Login.tsx`](src/app/pages/Login.tsx:1) - লগইন পেজ
- [`src/app/components/RequireAuth.tsx`](src/app/components/RequireAuth.tsx:1) - প্রোটেক্টেড রাউট

---

## 🐛 সমস্যা সমাধান

### সাধারণ সমস্যা:

1. **PDF জেনারেট হচ্ছে না**
   - চেক করুন `pdfService.ts` সঠিকভাবে কাজ করছে কিনা
   - ব্রাউজার কনসোলে এরর মেসেজ দেখুন

2. **গাণিতিক ফর্মুলা দেখা যাচ্ছে না**
   - KaTeX লাইব্রেরি সঠিকভাবে লোড হয়েছে কিনা দেখুন
   - `MathSymbolHelper.tsx` কম্পোনেন্ট চেক করুন

3. **Supabase কানেক্ট হচ্ছে না**
   - `.env` ফাইলে URL ও Key সঠিক কিনা যাচাই করুন
   - Supabase প্রজেক্ট চালু আছে কিনা দেখুন

---

## 📝 গুরুত্বপূর্ণ ফাইল রেফারেন্স

| ফাইল | কাজ |
|------|-----|
| [`types.ts`](src/app/types.ts:1) | সব ডাটা টাইপ ডেফিনিশন |
| [`storage.ts`](src/app/utils/storage.ts:1) | ডাটা সংরক্ষণ লজিক |
| [`QuestionBuilder.tsx`](src/app/pages/QuestionBuilder.tsx:1) | প্রশ্ন তৈরির মূল পেজ |
| [`BlockEditor.tsx`](src/app/components/BlockEditor.tsx:1) | প্রশ্নের কন্টেন্ট এডিটর |
| [`pdfService.ts`](src/app/utils/pdfService.ts:1) | PDF তৈরির সার্ভিস |
| [`routes.tsx`](src/app/routes.tsx:1) | অ্যাপ্লিকেশন রাউটিং |

---

## 📚 অতিরিক্ত রিসোর্স

- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Supabase**: https://supabase.com/
- **KaTeX**: https://katex.org/
- **React PDF**: https://react-pdf.org/

---

## 📞 সাপোর্ট

কোনো প্রশ্ন থাকলে প্রজেক্টের GitHub repository-তে ইস্যু করুন।

---

## 🔐 সিঙ্গেল ডিভাইস লগইন (Single Device Login)

এই ফিচারটি নিশ্চিত করে যে একই ইমেইল দিয়ে একসাথে শুধুমাত্র একটি ডিভাইসে লগইন থাকা যাবে। অন্য কোনো ডিভাইস থেকে লগইন করলে পুরনো ডিভাইস থেকে স্বয়ংক্রিয়ভাবে লগআউট হয়ে যাবে।

### কীভাবে কাজ করে:

1. যখন কোনো ইউজার লগইন করে, একটি ইউনিক সেশন টোকেন জেনারেট হয়
2. এই টোকেন Supabase ডাটাবেসে সংরক্ষিত হয়
3. যদি কেউ অন্য ডিভাইস থেকে একই ইমেইল দিয়ে লগইন করতে চায়, আগের সেশন অক্ষিয় হয়ে যায়
4. আগের ডিভাইসে অ্যাকসেস করার চেষ্টা করলে "অন্য ডিভাইসে লগইন করেছেন" মেসেজ দেখাবে

### ডাটাবেস টেবিল:

`user_sessions` টেবিলে সব অ্যাক্টিভ সেশন ট্র্যাক করা হয়।

### ফাইল পরিবর্তন:

- [`supabase/migrations/003_single_device_login.sql`](supabase/migrations/003_single_device_login.sql) - ডাটাবেস মাইগ্রেশন
- [`src/app/pages/Login.tsx`](src/app/pages/Login.tsx) - লগইন লজিক আপডেট
- [`src/app/components/RequireAuth.tsx`](src/app/components/RequireAuth.tsx) - সেশন ভ্যালিডেশন
- [`src/app/pages/Dashboard.tsx`](src/app/pages/Dashboard.tsx) - লগআউট ফাংশন আপডেট

### ব্যবহার:

১. প্রথমে Supabase SQL এডিটরে মাইগেশন ফাইল রান করুন:
```sql
-- supabase/migrations/003_single_device_login.sql ফাইলের কন্টেন্ট কপি করে পেস্ট করুন
```

২. অ্যাপ্লিকেশন রিস্টার্ট করুন

৩. লগইন করুন - এখন সিঙ্গেল ডিভাইস লগইন সক্রিয়

---

*এই ডকুমেন্টেশন QGen প্রশ্নপত্র জেনারেটর প্রকল্পের জন্য তৈরি।*

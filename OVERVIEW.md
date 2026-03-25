# QGen - Question Paper Generator

## Project Overview

QGen is a web-based application designed to help teachers create school exam question papers. The application allows teachers to create various types of questions and generate print-ready PDF documents.

### Key Features

- **Multiple Question Types**: Create MCQ, fill-in-blanks, true-false, short questions, creative questions, problem-solving, and more
- **Mathematical Formula Support**: LaTeX/KaTeX integration for rendering mathematical equations
- **Image & Diagram Support**: Add images, tables, and diagrams to questions
- **PDF Generation**: Generate print-ready PDF documents with customizable layouts
- **Print Preview**: Preview questions in A4 format before printing
- **Dashboard**: View and manage saved question papers
- **Cloud Storage**: Save papers online with Supabase backend
- **Single Device Login**: Prevent concurrent logins from multiple devices

---

## How the Application Works

### Application Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│ Dashboard   │────▶│ Paper Setup │────▶│  Question   │
│   Page      │     │   (Home)    │     │   (Config)  │     │   Builder   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │   A4        │
                                                            │   Preview   │
                                                            └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │   PDF       │
                                                            │   Download  │
                                                            └─────────────┘
```

### User Journey

1. **Authentication**: User logs in with email (Supabase Auth)
2. **Dashboard**: View all saved question papers
3. **Create New Paper**: Set up paper configuration (class, subject, exam type)
4. **Build Questions**: Add questions with various types and content blocks
5. **Preview**: View the paper in A4 format
6. **Export**: Download as PDF for printing

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + TypeScript | User interface |
| Styling | Tailwind CSS + shadcn/ui | Design system |
| Backend | Supabase | Database & authentication |
| PDF Generation | @react-pdf/renderer + Puppeteer | PDF creation |
| Math Rendering | KaTeX | Mathematical formulas |
| Routing | React Router | Page navigation |
| Build Tool | Vite | Development & build |

---

## Project Structure

```
qgen/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── BlockEditor.tsx      # Question content editor
│   │   │   ├── QuestionRenderer.tsx # Question display
│   │   │   ├── PDFDownloadButton.tsx
│   │   │   ├── GeneratePdfButton.tsx
│   │   │   ├── MathSymbolHelper.tsx # Math formula helper
│   │   │   ├── HelpDialog.tsx
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── mobile/         # Mobile-specific components
│   │   ├── pages/             # Main application pages
│   │   │   ├── Dashboard.tsx  # Home - list all papers
│   │   │   ├── QuestionBuilder.tsx # Create/edit questions
│   │   │   ├── PaperSetup.tsx # Paper configuration
│   │   │   ├── A4Preview.tsx  # A4 print preview
│   │   │   ├── Login.tsx      # Authentication
│   │   │   ├── Settings.tsx   # User settings
│   │   │   └── Subscription.tsx
│   │   ├── context/           # React Context
│   │   │   └── SubscriptionContext.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── usePaper.ts
│   │   │   └── useIsMobile.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── supabaseClient.ts
│   │   │   ├── storage.ts
│   │   │   ├── pdfService.ts
│   │   │   ├── helpers.ts
│   │   │   └── fontLoader.ts
│   │   ├── types.ts           # TypeScript definitions
│   │   ├── routes.tsx         # Route configuration
│   │   └── App.tsx
│   ├── styles/                # Global styles
│   ├── config/                # Configuration
│   └── main.tsx               # Entry point
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── package.json
├── vite.config.ts
└── index.html
```

---

## Core Concepts

### Question Types

The application supports 16 different question types:

- `mcq` - Multiple Choice Questions
- `fill-in-blanks` - Fill in the blanks
- `true-false` - True/False questions
- `matching` - Match the following
- `short-question` - Short answer questions
- `explain` - Explanation questions
- `creative` - Creative/descriptive questions
- `problem-solving` - Math problem questions
- `conversion` - Unit conversion questions
- `pattern` - Pattern questions
- `diagram` - Diagram-based questions
- `construction` - Construction questions
- `table-based` - Table analysis questions
- `graph-based` - Graph analysis questions
- `proof` - Proof questions

### Content Blocks

Each question consists of **blocks** that can contain:

- `text` - Plain text content
- `formula` - LaTeX mathematical formulas
- `image` - Images and diagrams
- `table` - Tables
- `diagram` - Diagrams
- `graph` - Graphs
- `blank` - Blank spaces for filling
- `list` - Bullet/numbered lists

### Paper Setup

Each question paper has a configuration:

- **Class**: Grade level (1-12)
- **Subject**: Subject name
- **Exam Type**: Class test, Half-yearly, Annual, Model test
- **Time**: Exam duration
- **Total Marks**: Total marks for the paper
- **Layout**: 1, 2, or 3 column layout

---

## Key Components

### Dashboard (`/`)
- Displays all saved question papers
- Create new paper button
- Edit, duplicate, delete existing papers
- Search and filter papers

### Paper Setup (`/setup/:paperId?`)
- Configure paper details (class, subject, exam type)
- Set time and marks
- Choose layout format
- Save and proceed to question builder

### Question Builder (`/builder/:paperId`)
- Add questions with different types
- Edit question content using block editor
- Add mathematical formulas with KaTeX
- Add images and diagrams
- Set marks for each question
- Reorder questions via drag-and-drop

### A4 Preview (`/preview/:paperId`)
- Real-time preview of the question paper
- Shows how it will look when printed
- Page-by-page navigation
- Download as PDF button

---

## Data Storage

### Supabase Database

**Tables:**
- `papers` - Stores question papers (JSONB for questions array)
- `questions` - Individual questions
- `paper_versions` - Version history
- `user_sessions` - Single device login tracking

### Local Storage Fallback

The app also uses localStorage for:
- Offline paper caching
- Draft saving
- User preferences

---

## Authentication

The app uses Supabase Auth with:
- Email/password login
- Single device login enforcement
- Session management
- Protected routes

---

## Running the Project

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Or with pnpm
pnpm install
```

### Environment Setup

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PDF_API_URL=your_pdf_api_url (optional)
```

### Development

```bash
# Start development server
npm run dev

# Access at http://localhost:5000
```

### Production Build

```bash
# Build for production
npm run build

# The output will be in the dist folder
```

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/app/types.ts` | All TypeScript type definitions |
| `src/app/utils/storage.ts` | Data persistence logic |
| `src/app/pages/QuestionBuilder.tsx` | Main question creation page |
| `src/app/components/BlockEditor.tsx` | Block content editor |
| `src/app/utils/pdfService.ts` | PDF generation service |
| `src/app/routes.tsx` | Application routing |
| `src/app/utils/supabaseClient.ts` | Supabase client configuration |

---

## Additional Features

### Mathematical Formula Support
- KaTeX integration for rendering LaTeX
- Math symbol helper toolbar
- Common formula templates

### Mobile Support
- Responsive design
- Mobile-specific components
- Touch-friendly interface

### Print Optimization
- A4 page format
- Configurable margins
- Background graphics option
- Proper page breaks

---

## Support

For questions or issues, please refer to the project repository or contact the development team.

# A4 Dynamic Page Pagination - User Guide

## Overview

The `PaginatedPagePreview` component automatically distributes content across A4 pages. When content fills one page, it automatically creates a new page and continues flowing content into it. This is perfect for generating printable question papers, exam sheets, and other paginated documents.

## Features

✅ **Automatic Page Creation** - New pages are created as content fills them  
✅ **A4 Compliance** - Pages follow A4 size (210mm × 297mm) specifications  
✅ **Print to PDF** - One-click PDF download using browser print dialog  
✅ **Responsive Preview** - Scales properly on smaller screens  
✅ **Bangla Font Support** - Built-in support for "Noto Sans Bengali" font  
✅ **Page Headers** - Optional header content on first page only  
✅ **Smart Question Breaks** - Questions don't split across page breaks  

## Basic Usage

### 1. Simple Example

```tsx
import { PaginatedPagePreview } from '../components/PaginatedPagePreview';

export default function MyPage() {
  const header = (
    <div>
      <h1>শ্রেণি: অষ্টম</h1>
      <h2>বাংলা প্রথম পত্র</h2>
      <div className="meta">সময়: ৩ ঘণ্টা | পূর্ণমান: ১০০</div>
    </div>
  );

  return (
    <PaginatedPagePreview header={header}>
      <div className="question">
        <strong>প্রশ্ন ১:</strong> একটি প্রশ্ন
        <ol className="parts" type="a">
          <li>অংশ ক</li>
          <li>অংশ খ</li>
          <li>অংশ গ</li>
        </ol>
      </div>
      
      <div className="question">
        <strong>প্রশ্ন ২:</strong> আরেকটি প্রশ্ন
        <ol className="parts" type="a">
          <li>অংশ ক</li>
          <li>অংশ খ</li>
        </ol>
      </div>
    </PaginatedPagePreview>
  );
}
```

## Component Props

```typescript
interface PaginatedPagePreviewProps {
  // Main content - should contain elements with class="question"
  children: React.ReactNode;
  
  // Header content (shown only on first page)
  header?: React.ReactNode;
  
  // Whether to include header on first page (default: true)
  includeHeader?: boolean;
  
  // Whether to show the print toolbar (default: true)
  showToolbar?: boolean;
}
```

### Props Explained

#### `children` (Required)
The main content to paginate. Should contain multiple elements with `className="question"`:

```tsx
<PaginatedPagePreview>
  <div className="question">Question 1</div>
  <div className="question">Question 2</div>
  <div className="question">Question 3</div>
</PaginatedPagePreview>
```

#### `header` (Optional)
Content displayed at the top of the first page only. Good for exam title, date, time, etc:

```tsx
<PaginatedPagePreview header={
  <div>
    <h1>Exam Title</h1>
    <p>Date: February 15, 2026</p>
  </div>
}>
  {/* questions */}
</PaginatedPagePreview>
```

#### `includeHeader` (Optional)
Toggle whether header is shown (default: `true`):

```tsx
<PaginatedPagePreview header={header} includeHeader={false}>
  {/* Header will not be shown */}
</PaginatedPagePreview>
```

#### `showToolbar` (Optional)
Toggle the print toolbar visibility (default: `true`):

```tsx
<PaginatedPagePreview showToolbar={false}>
  {/* No print toolbar will be shown */}
</PaginatedPagePreview>
```

## CSS Classes

Use these classes to style your content:

### `.question`
Wraps a single question. Keeps questions together on a page:

```tsx
<div className="question">
  <strong>প্রশ্ন ১:</strong> Question text
  <ol className="parts" type="a">
    <li>Part a</li>
    <li>Part b</li>
  </ol>
</div>
```

### `.parts`
The list of question sub-parts. Uses lowercase letters (a, b, c, d):

```tsx
<ol className="parts" type="a">
  <li>First part</li>
  <li>Second part</li>
</ol>
```

### `.page-header`
Styling for header content (auto-applied):

```css
.page-header {
  flex-shrink: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}
```

## Pagination Algorithm

The component uses this algorithm to distribute content:

1. **Initialize** first page with header (if `includeHeader=true`)
2. **Add questions** one by one to current page
3. **Check overflow**: If page content exceeds A4 height:
   - Remove last question from current page
   - Create new page without header
   - Add question to new page
   - Repeat check
4. **Continue** until all questions are placed

### Key Measurements

- **A4 Page Height**: 297mm (1123px at 96 DPI)
- **Page Padding**: 18mm (68px at 96 DPI)
- **Available Content Height**: 261mm (987px at 96 DPI)

## Live Demo

Visit `/print-preview` route to see a working example with 10 Bangla questions.

### Example Routes

```
http://localhost:5173/print-preview  # Full demo page
http://localhost:5173/               # Dashboard
```

## Advanced Usage

### Dynamic Questions from Data

```tsx
import { PaginatedPagePreview } from '../components/PaginatedPagePreview';

const QUESTIONS = [
  { num: 1, stem: 'Question 1', parts: ['a', 'b', 'c'] },
  { num: 2, stem: 'Question 2', parts: ['a', 'b', 'c', 'd'] },
  // ... more questions
];

export default function DynamicPage() {
  return (
    <PaginatedPagePreview header={<h1>My Exam</h1>}>
      {QUESTIONS.map(q => (
        <div key={q.num} className="question">
          <strong>প্রশ্ন {q.num}:</strong> {q.stem}
          <ol className="parts" type="a">
            {q.parts.map((part, i) => (
              <li key={i}>{part}</li>
            ))}
          </ol>
        </div>
      ))}
    </PaginatedPagePreview>
  );
}
```

### Custom Styling

The component uses custom CSS properties:

```css
:root {
  --page-w: 210mm;        /* A4 width */
  --page-h: 297mm;        /* A4 height */
  --pad: 18mm;            /* Page padding */
  --content-h: 261mm;     /* Available content height */
}
```

Override in your CSS:

```css
.page {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);  /* Custom shadow */
}

.question {
  margin-bottom: 16px;  /* More spacing */
}
```

## Printing to PDF

### Steps:

1. **Click** "PDF ডাউনলোড করুন" button (or press Ctrl+P / Cmd+P)
2. **Print Dialog** opens
3. **Set options**:
   - **Destination**: Save as PDF (not printer)
   - **Paper**: A4
   - **Scale**: 100%
   - **Margins**: Default
4. **Click** Save/Download

### Browser Support

✅ Chrome / Chromium  
✅ Edge (Chromium-based)  
✅ Firefox  
✅ Safari  

## CSS Reset for Questions

If questions have default spacing issues, add this to your stylesheet:

```css
/* Question resets */
.question {
  margin: 0 0 14px 0;
  line-height: 1.7;
  page-break-inside: avoid;
  font-size: 14px;
}

.question strong {
  display: inline-block;
  margin-bottom: 4px;
  font-weight: 600;
}

.question ol.parts {
  margin: 6px 0 0 0;
  padding-left: 20px;
  list-style-type: lower-alpha;
}

.question ol.parts li {
  margin: 4px 0;
  line-height: 1.5;
}
```

## Troubleshooting

### Questions splitting across pages

**Problem**: Questions are breaking across page boundaries

**Solution**: Make sure your question has `className="question"`:

```tsx
// ✅ Correct
<div className="question">...</div>

// ❌ Wrong
<div class="question">...</div>  // React requires className
```

### Pages not creating

**Problem**: No new pages are being created

**Solution**: Check that questions have the correct class:

```tsx
// Make sure content looks like this:
<div className="questions">
  <div className="question">Q1</div>
  <div className="question">Q2</div>
</div>

// NOT like this:
<div className="questions">
  <div className="q">Q1</div>
  <div className="q">Q2</div>
</div>
```

### Bangla text not showing

**Problem**: Bangla characters appear as boxes

**Solution**: Ensure "Noto Sans Bengali" font is loaded in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap');

body {
  font-family: 'Noto Sans Bengali', sans-serif;
}
```

### Print layout broken

**Problem**: Print preview looks different from screen

**Solution**: The component uses `@media print` to optimize for PDF. Make sure:

1. No custom print stylesheets override the component's styles
2. Browser print settings are: Scale 100%, Margins - Default
3. Check "Background graphics" is enabled in print dialog

## Files Reference

- **Component**: `src/app/components/PaginatedPagePreview.tsx`
- **Styles**: `src/app/styles/paginated-preview.css`
- **Demo Page**: `src/app/pages/PrintPreviewPage.tsx`
- **Route**: `/print-preview`

## Example Complete Integration

```tsx
// src/app/pages/MyExamPage.tsx
import { PaginatedPagePreview } from '../components/PaginatedPagePreview';

const EXAM_INFO = {
  class: '৮ম',
  subject: 'বাংলা প্রথম পত্র',
  time: '৩ ঘণ্টা',
  marks: '১০০',
};

const QUESTIONS = [
  // ... your questions data
];

export default function MyExamPage() {
  return (
    <PaginatedPagePreview
      header={
        <div>
          <h1>শ্রেণি: {EXAM_INFO.class}</h1>
          <h2>{EXAM_INFO.subject}</h2>
          <div className="meta">
            সময়: {EXAM_INFO.time} | পূর্ণমান: {EXAM_INFO.marks}
          </div>
        </div>
      }
    >
      {QUESTIONS.map((q) => (
        <div key={q.num} className="question">
          <strong>প্রশ্ন {q.num}:</strong> {q.stem}
          <ol className="parts" type="a">
            {q.parts.map((part, idx) => (
              <li key={idx}>{part}</li>
            ))}
          </ol>
        </div>
      ))}
    </PaginatedPagePreview>
  );
}
```

## Performance

The component is optimized for:

- **100+ questions**: Handles large question papers smoothly
- **Mobile**: Scales down on screens < 768px
- **Print**: All rendering happens on document load, no runtime overhead

## Future Enhancements

Potential improvements:

- [ ] Custom page height configuration
- [ ] Column-based layout (2 columns per page)
- [ ] Page numbering
- [ ] Table of contents generation
- [ ] Watermarks and background images
- [ ] Custom fonts per question
- [ ] Word/RTF export

---

For issues or questions, check the [demo page](/print-preview) or review the source code in `src/app/components/PaginatedPagePreview.tsx`.

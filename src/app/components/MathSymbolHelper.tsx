import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface MathSymbol {
  symbol: string;
  latex: string;
  description: string;
  category: string;
}

// Comprehensive Math Symbols
const MATH_SYMBOLS: MathSymbol[] = [
  // Basic Operators
  { symbol: '+', latex: '+', description: 'যোগ', category: 'Basic' },
  { symbol: '-', latex: '-', description: 'বিয়োগ', category: 'Basic' },
  { symbol: '×', latex: '\\times', description: 'গুণ', category: 'Basic' },
  { symbol: '÷', latex: '\\div', description: 'ভাগ', category: 'Basic' },
  { symbol: '±', latex: '\\pm', description: 'প্লাস মাইনাস', category: 'Basic' },
  { symbol: '∓', latex: '\\mp', description: 'মাইনাস প্লাস', category: 'Basic' },
  { symbol: '=', latex: '=', description: 'সমান', category: 'Basic' },
  { symbol: '≠', latex: '\\neq', description: 'সমান নয়', category: 'Basic' },
  
  // Powers & Roots
  { symbol: 'x²', latex: 'x^2', description: 'বর্গ', category: 'Power' },
  { symbol: 'x³', latex: 'x^3', description: 'ঘন', category: 'Power' },
  { symbol: 'xⁿ', latex: 'x^n', description: 'ঘাত', category: 'Power' },
  { symbol: 'x₁', latex: 'x_1', description: 'সাবস্ক্রিপ্ট', category: 'Power' },
  { symbol: '√', latex: '\\sqrt{x}', description: 'বর্গমূল', category: 'Root' },
  { symbol: '∛', latex: '\\sqrt[3]{x}', description: 'ঘনমূল', category: 'Root' },
  { symbol: '∜', latex: '\\sqrt[4]{x}', description: 'চতুর্থমূল', category: 'Root' },
  { symbol: 'ⁿ√', latex: '\\sqrt[n]{x}', description: 'n-তম মূল', category: 'Root' },
  
  // Fractions
  { symbol: '½', latex: '\\frac{1}{2}', description: 'অর্ধেক', category: 'Fraction' },
  { symbol: '⅓', latex: '\\frac{1}{3}', description: 'তৃতীয়াংশ', category: 'Fraction' },
  { symbol: '¼', latex: '\\frac{1}{4}', description: 'চতুর্থাংশ', category: 'Fraction' },
  { symbol: '¾', latex: '\\frac{3}{4}', description: 'তিন-চতুর্থাংশ', category: 'Fraction' },
  { symbol: 'a/b', latex: '\\frac{a}{b}', description: 'ভগ্নাংশ', category: 'Fraction' },
  { symbol: 'x/y', latex: '\\frac{x}{y}', description: 'ভগ্নাংশ', category: 'Fraction' },
  
  // Inequalities
  { symbol: '<', latex: '<', description: 'ছোট', category: 'Inequality' },
  { symbol: '>', latex: '>', description: 'বড়', category: 'Inequality' },
  { symbol: '≤', latex: '\\leq', description: 'ছোট বা সমান', category: 'Inequality' },
  { symbol: '≥', latex: '\\geq', description: 'বড় বা সমান', category: 'Inequality' },
  { symbol: '≈', latex: '\\approx', description: 'প্রায় সমান', category: 'Inequality' },
  { symbol: '≡', latex: '\\equiv', description: 'সমতুল্য', category: 'Inequality' },
  { symbol: '∝', latex: '\\propto', description: 'সমানুপাতিক', category: 'Inequality' },
  
  // Greek Letters - Lowercase
  { symbol: 'α', latex: '\\alpha', description: 'আলফা', category: 'Greek' },
  { symbol: 'β', latex: '\\beta', description: 'বিটা', category: 'Greek' },
  { symbol: 'γ', latex: '\\gamma', description: 'গামা', category: 'Greek' },
  { symbol: 'δ', latex: '\\delta', description: 'ডেল্টা', category: 'Greek' },
  { symbol: 'ε', latex: '\\epsilon', description: 'এপসাইলন', category: 'Greek' },
  { symbol: 'ζ', latex: '\\zeta', description: 'জিটা', category: 'Greek' },
  { symbol: 'η', latex: '\\eta', description: 'ঈটা', category: 'Greek' },
  { symbol: 'θ', latex: '\\theta', description: 'থিটা', category: 'Greek' },
  { symbol: 'ι', latex: '\\iota', description: 'আয়োটা', category: 'Greek' },
  { symbol: 'κ', latex: '\\kappa', description: 'কাপা', category: 'Greek' },
  { symbol: 'λ', latex: '\\lambda', description: 'ল্যাম্বডা', category: 'Greek' },
  { symbol: 'μ', latex: '\\mu', description: 'মিউ', category: 'Greek' },
  { symbol: 'ν', latex: '\\nu', description: 'নিউ', category: 'Greek' },
  { symbol: 'ξ', latex: '\\xi', description: 'ক্সাই', category: 'Greek' },
  { symbol: 'ο', latex: '\\omicron', description: 'ওমিক্রন', category: 'Greek' },
  { symbol: 'π', latex: '\\pi', description: 'পাই', category: 'Greek' },
  { symbol: 'ρ', latex: '\\rho', description: 'রো', category: 'Greek' },
  { symbol: 'σ', latex: '\\sigma', description: 'সিগমা', category: 'Greek' },
  { symbol: 'τ', latex: '\\tau', description: 'টাউ', category: 'Greek' },
  { symbol: 'υ', latex: '\\upsilon', description: 'উপসিলন', category: 'Greek' },
  { symbol: 'φ', latex: '\\phi', description: 'ফাই', category: 'Greek' },
  { symbol: 'χ', latex: '\\chi', description: 'কাই', category: 'Greek' },
  { symbol: 'ψ', latex: '\\psi', description: 'সাই', category: 'Greek' },
  { symbol: 'ω', latex: '\\omega', description: 'ওমেগা', category: 'Greek' },
  
  // Greek Letters - Uppercase
  { symbol: 'Γ', latex: '\\Gamma', description: 'বড় গামা', category: 'Greek' },
  { symbol: 'Δ', latex: '\\Delta', description: 'বড় ডেল্টা', category: 'Greek' },
  { symbol: 'Θ', latex: '\\Theta', description: 'বড় থিটা', category: 'Greek' },
  { symbol: 'Λ', latex: '\\Lambda', description: 'বড় ল্যাম্বডা', category: 'Greek' },
  { symbol: 'Π', latex: '\\Pi', description: 'বড় পাই', category: 'Greek' },
  { symbol: 'Σ', latex: '\\Sigma', description: 'বড় সিগমা', category: 'Greek' },
  { symbol: 'Φ', latex: '\\Phi', description: 'বড় ফাই', category: 'Greek' },
  { symbol: 'Ψ', latex: '\\Psi', description: 'বড় সাই', category: 'Greek' },
  { symbol: 'Ω', latex: '\\Omega', description: 'বড় ওমেগা', category: 'Greek' },
  
  // Calculus
  { symbol: '∫', latex: '\\int', description: 'ইন্টিগ্রাল', category: 'Calculus' },
  { symbol: '∬', latex: '\\iint', description: 'ডাবল ইন্টিগ্রাল', category: 'Calculus' },
  { symbol: '∭', latex: '\\iiint', description: 'ট্রিপল ইন্টিগ্রাল', category: 'Calculus' },
  { symbol: '∮', latex: '\\oint', description: 'কন্টুর ইন্টিগ্রাল', category: 'Calculus' },
  { symbol: '∂', latex: '\\partial', description: 'আংশিক ডেরিভেটিভ', category: 'Calculus' },
  { symbol: '∇', latex: '\\nabla', description: 'নাবলা অপারেটর', category: 'Calculus' },
  { symbol: 'lim', latex: '\\lim_{x \\to a}', description: 'লিমিট', category: 'Calculus' },
  { symbol: 'dx', latex: 'dx', description: 'ডিফারেনশিয়াল', category: 'Calculus' },
  
  // Summation & Product
  { symbol: '∑', latex: '\\sum', description: 'সমষ্টি চিহ্ন', category: 'Series' },
  { symbol: '∑n', latex: '\\sum_{i=1}^{n}', description: 'সমষ্টি', category: 'Series' },
  { symbol: '∏', latex: '\\prod', description: 'গুণফল', category: 'Series' },
  { symbol: '∏n', latex: '\\prod_{i=1}^{n}', description: 'গুণফল', category: 'Series' },
  
  // Trigonometry
  { symbol: 'sin', latex: '\\sin', description: 'সাইন', category: 'Trig' },
  { symbol: 'cos', latex: '\\cos', description: 'কোসাইন', category: 'Trig' },
  { symbol: 'tan', latex: '\\tan', description: 'ট্যানজেন্ট', category: 'Trig' },
  { symbol: 'cot', latex: '\\cot', description: 'কোট্যানজেন্ট', category: 'Trig' },
  { symbol: 'sec', latex: '\\sec', description: 'সেক্যান্ট', category: 'Trig' },
  { symbol: 'csc', latex: '\\csc', description: 'কোসেক্যান্ট', category: 'Trig' },
  { symbol: 'sin⁻¹', latex: '\\sin^{-1}', description: 'আর্ক সাইন', category: 'Trig' },
  { symbol: 'cos⁻¹', latex: '\\cos^{-1}', description: 'আর্ক কোসাইন', category: 'Trig' },
  { symbol: 'tan⁻¹', latex: '\\tan^{-1}', description: 'আর্ক ট্যান', category: 'Trig' },
  
  // Logarithm & Exponential
  { symbol: 'log', latex: '\\log', description: 'লগারিদম', category: 'Log' },
  { symbol: 'ln', latex: '\\ln', description: 'ন্যাচারাল লগ', category: 'Log' },
  { symbol: 'e', latex: 'e', description: 'আয়লার সংখ্যা', category: 'Log' },
  { symbol: 'exp', latex: 'e^x', description: 'এক্সপোনেনশিয়াল', category: 'Log' },
  
  // Sets & Number Theory
  { symbol: '∈', latex: '\\in', description: 'উপাদান', category: 'Set' },
  { symbol: '∉', latex: '\\notin', description: 'উপাদান নয়', category: 'Set' },
  { symbol: '⊂', latex: '\\subset', description: 'উপসেট', category: 'Set' },
  { symbol: '⊃', latex: '\\supset', description: 'সুপারসেট', category: 'Set' },
  { symbol: '⊆', latex: '\\subseteq', description: 'সম উপসেট', category: 'Set' },
  { symbol: '∪', latex: '\\cup', description: 'ইউনিয়ন', category: 'Set' },
  { symbol: '∩', latex: '\\cap', description: 'ইন্টারসেকশন', category: 'Set' },
  { symbol: '∅', latex: '\\emptyset', description: 'ফাঁকা সেট', category: 'Set' },
  { symbol: 'ℕ', latex: '\\mathbb{N}', description: 'প্রাকৃতিক সংখ্যা', category: 'Set' },
  { symbol: 'ℤ', latex: '\\mathbb{Z}', description: 'পূর্ণ সংখ্যা', category: 'Set' },
  { symbol: 'ℚ', latex: '\\mathbb{Q}', description: 'মূলদ সংখ্যা', category: 'Set' },
  { symbol: 'ℝ', latex: '\\mathbb{R}', description: 'বাস্তব সংখ্যা', category: 'Set' },
  { symbol: 'ℂ', latex: '\\mathbb{C}', description: 'জটিল সংখ্যা', category: 'Set' },
  { symbol: '∀', latex: '\\forall', description: 'সকলের জন্য', category: 'Set' },
  { symbol: '∃', latex: '\\exists', description: 'অস্তিত্ব আছে', category: 'Set' },
  
  // Geometry
  { symbol: '∠', latex: '\\angle', description: 'কোণ', category: 'Geometry' },
  { symbol: '∟', latex: '\\rightangle', description: 'সমকোণ', category: 'Geometry' },
  { symbol: '°', latex: '^\\circ', description: 'ডিগ্রি', category: 'Geometry' },
  { symbol: '⊥', latex: '\\perp', description: 'লম্ব', category: 'Geometry' },
  { symbol: '∥', latex: '\\parallel', description: 'সমান্তরাল', category: 'Geometry' },
  { symbol: '△', latex: '\\triangle', description: 'ত্রিভুজ', category: 'Geometry' },
  { symbol: '○', latex: '\\circ', description: 'বৃত্ত', category: 'Geometry' },
  { symbol: '□', latex: '\\square', description: 'বর্গ', category: 'Geometry' },
  { symbol: '▱', latex: '\\parallelogram', description: 'সামান্তরিক', category: 'Geometry' },
  { symbol: '∾', latex: '\\sim', description: 'সদৃশ', category: 'Geometry' },
  { symbol: '≅', latex: '\\cong', description: 'সর্বসম', category: 'Geometry' },
  { symbol: '~', latex: '\\sim', description: 'সদৃশ্য', category: 'Geometry' },
  
  // Statistics & Probability
  { symbol: 'μ', latex: '\\mu', description: 'গড়/মিন', category: 'Stats' },
  { symbol: 'σ', latex: '\\sigma', description: 'স্ট্যান্ডার্ড বিচ্যুতি', category: 'Stats' },
  { symbol: 'σ²', latex: '\\sigma^2', description: 'ভেদ', category: 'Stats' },
  { symbol: 'x̄', latex: '\\bar{x}', description: 'নমুনা গড়', category: 'Stats' },
  { symbol: 'n!', latex: 'n!', description: 'ফ্যাক্টরিয়াল', category: 'Stats' },
  { symbol: 'P', latex: 'P', description: 'সম্ভাবনা', category: 'Stats' },
  { symbol: 'C', latex: '^nC_r', description: 'কম্বিনেশন', category: 'Stats' },
  { symbol: 'P', latex: '^nP_r', description: 'পারমুটেশন', category: 'Stats' },
  
  // Arrows
  { symbol: '→', latex: '\\to', description: 'তীর চিহ্ন', category: 'Arrow' },
  { symbol: '←', latex: '\\leftarrow', description: 'বাম তীর', category: 'Arrow' },
  { symbol: '↔', latex: '\\leftrightarrow', description: 'দ্বিমুখী তীর', category: 'Arrow' },
  { symbol: '⇒', latex: '\\Rightarrow', description: 'যদি তব', category: 'Arrow' },
  { symbol: '⇔', latex: '\\Leftrightarrow', description: 'যদি এবং কেবল যদি', category: 'Arrow' },
  { symbol: '↑', latex: '\\uparrow', description: 'উপর তীর', category: 'Arrow' },
  { symbol: '↓', latex: '\\downarrow', description: 'নিচ তীর', category: 'Arrow' },
  { symbol: '↦', latex: '\\mapsto', description: 'ম্যাপ টু', category: 'Arrow' },
  
  // Misc Math
  { symbol: '∞', latex: '\\infty', description: 'অসীম', category: 'Misc' },
  { symbol: '°', latex: '^\\circ', description: 'ডিগ্রি', category: 'Misc' },
  { symbol: '·', latex: '\\cdot', description: 'গুণ চিহ্ন', category: 'Misc' },
  { symbol: '…', latex: '\\ldots', description: 'এলিপসিস', category: 'Misc' },
  { symbol: '⋯', latex: '\\cdots', description: 'সেন্টার এলিপসিস', category: 'Misc' },
  { symbol: '⋮', latex: '\\vdots', description: 'ভার্টিকাল এলিপসিস', category: 'Misc' },
  { symbol: '∴', latex: '\\therefore', description: 'সুতরাং', category: 'Misc' },
  { symbol: '∵', latex: '\\because', description: 'কারণ', category: 'Misc' },
  { symbol: '√', latex: '\\checkmark', description: 'চেক মার্ক', category: 'Misc' },
  
  // Chemistry - Elements (as subscripts/superscripts)
  { symbol: '⁰', latex: '^0', description: 'পারমাণবিক সংখ্যা', category: 'Chem' },
  { symbol: '⁺', latex: '^+', description: 'ধনাত্মক চার্জ', category: 'Chem' },
  { symbol: '⁻', latex: '^-', description: 'ঋণাত্মক চার্জ', category: 'Chem' },
  { symbol: '₂', latex: '_2', description: 'সাবস্ক্রিপ্ট', category: 'Chem' },
  { symbol: '³⁺', latex: '^{3+}', description: 'ত্রিযোজী ধনাত্মক', category: 'Chem' },
  { symbol: '₂⁻', latex: '^{2-}', description: 'দ্বিযোজী ঋণাত্মক', category: 'Chem' },
  { symbol: '⇌', latex: '\\rightleftharpoons', description: 'রিভার্সিবল রিঅ্যাকশন', category: 'Chem' },
  { symbol: '→', latex: '\\rightarrow', description: 'রিঅ্যাকশন', category: 'Chem' },
  { symbol: '△', latex: '\\triangle', description: 'তাপ', category: 'Chem' },
  { symbol: '⇌', latex: '\\rightleftharpoons', description: 'সাম্যাবস্থা', category: 'Chem' },
  
  // Common Element Symbols
  { symbol: 'H', latex: 'H', description: 'হাইড্রোজেন', category: 'Element' },
  { symbol: 'He', latex: 'He', description: 'হিলিয়াম', category: 'Element' },
  { symbol: 'Li', latex: 'Li', description: 'লিথিয়াম', category: 'Element' },
  { symbol: 'C', latex: 'C', description: 'কার্বন', category: 'Element' },
  { symbol: 'N', latex: 'N', description: 'নাইট্রোজেন', category: 'Element' },
  { symbol: 'O', latex: 'O', description: 'অক্সিজেন', category: 'Element' },
  { symbol: 'Na', latex: 'Na', description: 'সোডিয়াম', category: 'Element' },
  { symbol: 'Mg', latex: 'Mg', description: 'ম্যাগনেসিয়াম', category: 'Element' },
  { symbol: 'Al', latex: 'Al', description: 'অ্যালুমিনিয়াম', category: 'Element' },
  { symbol: 'Si', latex: 'Si', description: 'সিলিকন', category: 'Element' },
  { symbol: 'P', latex: 'P', description: 'ফসফরাস', category: 'Element' },
  { symbol: 'S', latex: 'S', description: 'সালফার', category: 'Element' },
  { symbol: 'Cl', latex: 'Cl', description: 'ক্লোরিন', category: 'Element' },
  { symbol: 'K', latex: 'K', description: 'পটাশিয়াম', category: 'Element' },
  { symbol: 'Ca', latex: 'Ca', description: 'ক্যালসিয়াম', category: 'Element' },
  { symbol: 'Fe', latex: 'Fe', description: 'আয়রন', category: 'Element' },
  { symbol: 'Cu', latex: 'Cu', description: 'কপার', category: 'Element' },
  { symbol: 'Zn', latex: 'Zn', description: 'জিংক', category: 'Element' },
  { symbol: 'Ag', latex: 'Ag', description: 'সিলভার', category: 'Element' },
  { symbol: 'Au', latex: 'Au', description: 'গোল্ড', category: 'Element' },
  { symbol: 'Hg', latex: 'Hg', description: 'মারকারি', category: 'Element' },
  { symbol: 'Pb', latex: 'Pb', description: 'লেড', category: 'Element' },
  { symbol: 'Br', latex: 'Br', description: 'ব্রোমিন', category: 'Element' },
  { symbol: 'I', latex: 'I', description: 'আয়োডিন', category: 'Element' },
];

// Group symbols by category
const CATEGORIES = ['Basic', 'Power', 'Root', 'Fraction', 'Inequality', 'Greek', 'Calculus', 'Series', 'Trig', 'Log', 'Set', 'Geometry', 'Stats', 'Arrow', 'Misc', 'Chem', 'Element'];

interface MathSymbolHelperProps {
  onInsert: (latex: string) => void;
}

export function MathSymbolHelper({ onInsert }: MathSymbolHelperProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleInsert = (latex: string) => {
    onInsert(latex);
    setOpen(false);
  };

  const filteredSymbols = selectedCategory === 'All' 
    ? MATH_SYMBOLS 
    : MATH_SYMBOLS.filter(s => s.category === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <HelpCircle className="w-4 h-4 mr-2" />
          গণিত চিহ্ন
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col min-h-0">
          <div>
            <h4 className="font-medium text-sm mb-2">গণিত ও রসায়ন চিহ্ন</h4>
            <p className="text-xs text-slate-500 mb-2">
              ক্লিক করে সরাসরি যোগ করুন
            </p>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-2 py-1 text-xs rounded ${
                  selectedCategory === 'All' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                সব
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 text-xs rounded ${
                    selectedCategory === cat 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <ScrollArea className="flex-1 min-h-0 overflow-auto pr-3">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pb-2">
              {filteredSymbols.map((item, idx) => (
                <button
                  key={`${item.category}-${idx}`}
                  type="button"
                  onClick={() => handleInsert(item.latex)}
                  className="flex items-center gap-1 p-2 rounded border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                >
                  <span className="text-lg font-mono min-w-[24px] text-center">{item.symbol}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-slate-600 truncate">
                      {item.latex}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="pt-3 border-t border-slate-200 space-y-2 shrink-0">
            <h5 className="text-xs font-medium text-slate-700">দ্রুত টিপস:</h5>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• সাবস্ক্রিপ্ট: x_1, x_a → x₁, xₐ</li>
              <li>• সুপারস্ক্রিপ্ট: x^2, x^n → x², xⁿ</li>
              <li>• ভগ্নাংশ: \frac{'{numerator}{denominator}'}</li>
              <li>• রুট: \sqrt{'{x}'}, \sqrt[3]{'x'}</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

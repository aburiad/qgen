import { ArrowLeft, BookOpen, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { BoardStyleLayout } from '../components/BoardStyleLayout';
import { PDFDownloadButton } from '../components/PDFDownloadButton';
import { GeneratePdfButton } from '../components/GeneratePdfButton';
import { QuestionRenderer } from '../components/QuestionRenderer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Slider } from '../components/ui/slider';
import { usePaper } from '../hooks/usePaper';
import { ensureFontsLoaded } from '../utils/fontLoader';
import { getExamTypeBangla } from '../utils/helpers';

/** ~96dpi: 1mm = 96/25.4 px */
const MM_TO_PX = 96 / 25.4;

export default function A4Preview() {
  const { paper, paperId } = usePaper();
  const navigate = useNavigate();
  const [useBoardStyle, setUseBoardStyle] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [pageWidth, setPageWidth] = useState(210);
  const [pageHeight, setPageHeight] = useState(297);
  const [pageMargin, setPageMargin] = useState(20);
  const [baseFontSize, setBaseFontSize] = useState(16);
  
  // Question styling settings
  const [questionFontSize, setQuestionFontSize] = useState(16);
  const [questionMargin, setQuestionMargin] = useState(0);
  const [questionPadding, setQuestionPadding] = useState(0);
  const [columnGap, setColumnGap] = useState(8);
  const [printMargin, setPrintMargin] = useState(20);

  // Removed JavaScript pagination - using pure CSS pagination instead

  /** On mobile: scale preview to fit viewport width; on desktop use 1 */
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const pageWidthPx = pageWidth * MM_TO_PX;
      const viewW = typeof window !== 'undefined' ? window.innerWidth : 800;
      setScale(Math.min(1, viewW / pageWidthPx));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [pageWidth]);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await ensureFontsLoaded();
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  useEffect(() => {
    if (paperId) {
      const savedSettings = localStorage.getItem(`pageSettings_${paperId}`);
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setPageWidth(Math.max(150, Math.min(250, settings.pageWidth ?? 210)));
          setPageHeight(Math.max(200, Math.min(400, settings.pageHeight ?? 297)));
          setPageMargin(Math.max(0, Math.min(40, settings.pageMargin ?? 20)));
          setBaseFontSize(Math.max(10, Math.min(24, settings.baseFontSize ?? 16)));
          setQuestionFontSize(Math.max(10, Math.min(32, settings.questionFontSize ?? 16)));
          setQuestionMargin(Math.max(0, Math.min(20, settings.questionMargin ?? 0)));
          setQuestionPadding(Math.max(0, Math.min(20, settings.questionPadding ?? 0)));
          setColumnGap(Math.max(0, Math.min(40, settings.columnGap ?? 8)));
          setPrintMargin(Math.max(0, Math.min(40, settings.printMargin ?? 20)));
          setUseBoardStyle(settings.useBoardStyle ?? true);
        } catch (e) {
          console.error('Error loading page settings:', e);
        }
      }
    }
  }, [paperId]);

  useEffect(() => {
    if (paperId && paper) {
      const settings = {
        pageWidth,
        pageHeight,
        pageMargin,
        baseFontSize,
        questionFontSize,
        questionMargin,
        questionPadding,
        columnGap,
        printMargin,
        useBoardStyle,
      };
      localStorage.setItem(`pageSettings_${paperId}`, JSON.stringify(settings));
    }
  }, [paperId, paper, pageWidth, pageHeight, pageMargin, baseFontSize, questionFontSize, questionMargin, questionPadding, columnGap, printMargin, useBoardStyle]);

  // Capture HTML content from preview ref for PDF generation - on demand
  const getHtmlContent = () => {
    return previewRef.current?.innerHTML || '';
  };

  // Removed JavaScript pagination logic - browser handles pagination via CSS

  if (!paper || !fontsLoaded) return null;

  // Removed pageStyle and renderPageContent - using single container approach

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/builder/${paperId}`)} className="shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1.5 sm:p-2 rounded-lg shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">প্রিভিউ</h1>
                  <p className="text-xs text-slate-500 hidden sm:block">A4 Format Preview</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Settings className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">পেজ সেটিংস</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>পেজ সেটিংস</SheetTitle>
                    <SheetDescription>
                      পেজের আকার, মার্জিন এবং ফন্ট সাইজ কাস্টমাইজ করুন।
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                    <div className="space-y-6 mt-6">
                      {/* Page Settings Section */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">পেজ সেটিংস</h3>
                      </div>
                      <div className="space-y-3">
                        <Label>পেজ প্রস্থ (Width): {pageWidth}mm</Label>
                        <Slider value={[pageWidth]} onValueChange={(v) => setPageWidth(v[0])} min={150} max={250} step={1} />
                        <Input type="number" value={pageWidth} onChange={(e) => setPageWidth(Number(e.target.value))} min={150} max={250} />
                      </div>
                      <div className="space-y-3">
                        <Label>পেজ উচ্চতা (Height): {pageHeight}mm</Label>
                        <Slider value={[pageHeight]} onValueChange={(v) => setPageHeight(v[0])} min={200} max={400} step={1} />
                        <Input type="number" value={pageHeight} onChange={(e) => setPageHeight(Number(e.target.value))} min={200} max={400} />
                      </div>
                      <div className="space-y-3">
                        <Label>পেজ মার্জিন (Margin): {pageMargin}mm</Label>
                        <Slider value={[pageMargin]} onValueChange={(v) => setPageMargin(v[0])} min={0} max={40} step={1} />
                        <Input 
                          type="number" 
                          value={pageMargin} 
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(40, Number(e.target.value)));
                            setPageMargin(val);
                          }} 
                          min={0} 
                          max={40} 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label>পেজ ফন্ট সাইজ: {baseFontSize}px</Label>
                        <Slider value={[baseFontSize]} onValueChange={(v) => setBaseFontSize(v[0])} min={10} max={24} step={1} />
                        <Input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value))} min={10} max={24} />
                      </div>

                      {/* Question Styling Section */}
                      <div className="space-y-2 pt-4 border-t">
                        <h3 className="font-semibold text-sm">প্রশ্ন স্টাইল সেটিংস</h3>
                      </div>
                      <div className="space-y-3">
                        <Label>প্রশ্ন ফন্ট সাইজ: {questionFontSize}px</Label>
                        <Slider value={[questionFontSize]} onValueChange={(v) => setQuestionFontSize(v[0])} min={10} max={32} step={1} />
                        <Input type="number" value={questionFontSize} onChange={(e) => setQuestionFontSize(Number(e.target.value))} min={10} max={32} />
                      </div>
                      <div className="space-y-3">
                        <Label>প্রশ্ন মার্জিন: {questionMargin}px</Label>
                        <Slider value={[questionMargin]} onValueChange={(v) => setQuestionMargin(v[0])} min={0} max={20} step={1} />
                        <Input type="number" value={questionMargin} onChange={(e) => setQuestionMargin(Number(e.target.value))} min={0} max={20} />
                      </div>
                      <div className="space-y-3">
                        <Label>প্রশ্ন প্যাডিং: {questionPadding}px</Label>
                        <Slider value={[questionPadding]} onValueChange={(v) => setQuestionPadding(v[0])} min={0} max={20} step={1} />
                        <Input type="number" value={questionPadding} onChange={(e) => setQuestionPadding(Number(e.target.value))} min={0} max={20} />
                      </div>
                      <div className="space-y-3">
                        <Label>কলাম গ্যাপ (Column Gap): {columnGap}px</Label>
                        <Slider value={[columnGap]} onValueChange={(v) => setColumnGap(v[0])} min={0} max={40} step={1} />
                        <Input type="number" value={columnGap} onChange={(e) => setColumnGap(Number(e.target.value))} min={0} max={40} />
                      </div>

                      {/* Print Settings Section */}
                      <div className="space-y-2 pt-4 border-t">
                        <h3 className="font-semibold text-sm">প্রিন্ট সেটিংস</h3>
                      </div>
                      <div className="space-y-3">
                        <Label>প্রিন্ট মার্জিন: {printMargin}mm</Label>
                        <Slider value={[printMargin]} onValueChange={(v) => setPrintMargin(v[0])} min={0} max={40} step={1} />
                        <Input type="number" value={printMargin} onChange={(e) => setPrintMargin(Number(e.target.value))} min={0} max={40} />
                      </div>

                      {/* Presets */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label>প্রিসেট</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setPageWidth(210); setPageHeight(297); setPageMargin(20); setBaseFontSize(16); }}>A4</Button>
                          <Button variant="outline" size="sm" onClick={() => { setPageWidth(215); setPageHeight(279); setPageMargin(25); setBaseFontSize(16); }}>Letter</Button>
                          <Button variant="outline" size="sm" onClick={() => { setPageWidth(210); setPageHeight(297); setPageMargin(10); setBaseFontSize(14); }}>কম মার্জিন</Button>
                          <Button variant="outline" size="sm" onClick={() => { setPageWidth(210); setPageHeight(297); setPageMargin(0); setBaseFontSize(16); }}>কোন মার্জিন</Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              <div className="flex gap-2 flex-wrap">
                <PDFDownloadButton 
                  previewRef={previewRef} 
                  printMargin={printMargin}
                  onMarginChange={setPrintMargin}
                />
                <GeneratePdfButton 
                  htmlContent={getHtmlContent} 
                  filename={`${paper.title || 'question_paper'}.pdf`}
                  label="PDF ডাউনলোড করুন"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto overflow-x-auto overflow-y-auto p-4 sm:p-6 bg-white">
        {/* Single document container - browser handles pagination via CSS */}
        <div
          className="mx-auto bg-white"
          style={{
            width: scale < 1 ? `${pageWidth * scale}mm` : `${pageWidth}mm`,
            position: scale < 1 ? 'relative' : undefined,
          }}
        >
          {/* Single continuous document - all content in one container */}
          <div
            ref={previewRef}
            id="printable-content"
            className="printable-document bg-white"
            style={{
              width: `${pageWidth}mm`,
              padding: `${pageMargin}mm`,
              fontSize: `${baseFontSize}px`,
              boxSizing: 'border-box',
              margin: scale < 1 ? 0 : '0 auto',
            }}
          >
            {useBoardStyle ? (
              <BoardStyleLayout 
                paper={paper} 
                baseFontSize={baseFontSize}
                questionFontSize={questionFontSize}
                questionMargin={questionMargin}
                questionPadding={questionPadding}
                columnGap={columnGap}
              />
            ) : (
              <>
                <div className="text-center mb-3 pb-3 border-b-2 border-slate-800 font-['Noto_Sans_Bengali']">
                  {paper.setup.schoolName && <h1 className="text-lg font-bold mb-1">{paper.setup.schoolName}</h1>}
                  <h2 className="text-base font-semibold mb-1">{getExamTypeBangla(paper.setup.examType)}</h2>
                  <div className="flex justify-center gap-4 text-xs"><span>শ্রেণি: {paper.setup.class}</span><span>বিষয়: {paper.setup.subject}</span></div>
                </div>
                <div className="flex justify-between text-xs pb-2 border-b border-slate-300 mb-2 font-['Noto_Sans_Bengali']">
                  <span>সময়: {paper.setup.timeMinutes || '0'} মিনিট</span>
                  <span>পূর্ণমান: {paper.setup.totalMarks || '0'}</span>
                </div>
                <div className="font-['Noto_Sans_Bengali']">
                  {paper.questions.map((q) => (
                    <div key={q.id} className="question-item">
                      <QuestionRenderer 
                        question={q} 
                        fontSize={questionFontSize}
                        margin={questionMargin}
                        padding={questionPadding}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  ArrowLeft,
  BookOpen,
  Copy,
  Eye,
  FileText,
  Image,
  Loader2,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { BlockEditor } from '../components/BlockEditor';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useIsMobile } from '../hooks/useIsMobile';
import { usePaper } from '../hooks/usePaper';
import { Question, QuestionType, SubQuestion } from '../types';
import { extractQuestionWithTesseract, mapFieldsToQuestion, type QuestionFieldType } from '../utils/aiQuestionParser';
import { generateId, savePaper } from '../utils/storage';

const QUESTION_TYPES: { value: QuestionType; label: string; labelEn: string }[] = [
  { value: 'mcq', label: 'বহুনির্বাচনী', labelEn: 'MCQ' },
  { value: 'creative', label: 'সৃজনশীল', labelEn: 'Creative' },
  { value: 'short-question', label: 'সংক্ষিপ্ত প্রশ্ন', labelEn: 'Short Question' },
  // { value: 'fill-in-blanks', label: 'শূন্যস্থান পূরণ', labelEn: 'Fill in Blanks' },
  // { value: 'true-false', label: 'সত্য/মিথ্যা', labelEn: 'True/False' },
  // { value: 'matching', label: 'মিলকরণ', labelEn: 'Matching' },
  // { value: 'explain', label: 'ব্যাখ্যা', labelEn: 'Explain' },
  // { value: 'problem-solving', label: 'সমস্যা সমাধান', labelEn: 'Problem Solving' },
  // { value: 'conversion', label: 'রূপান্তর', labelEn: 'Conversion' },
  // { value: 'pattern', label: 'প্যাটার্ন', labelEn: 'Pattern' },
  // { value: 'diagram', label: 'চিত্র ভিত্তিক', labelEn: 'Diagram Based' },
  // { value: 'construction', label: 'অঙ্কন', labelEn: 'Construction' },
  // { value: 'table-based', label: 'টেবিল ভিত্তিক', labelEn: 'Table Based' },
  // { value: 'graph-based', label: 'গ্রাফ ভিত্তিক', labelEn: 'Graph Based' },
  // { value: 'proof', label: 'প্রমাণ', labelEn: 'Proof' },
];

export default function QuestionBuilder() {
  const { paper, setPaper, paperId } = usePaper();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const isMobile = useIsMobile();
  const editorRef = useRef<HTMLDivElement>(null);

  // AI Image Upload State
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);

  const createNewQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      type: 'short-question',
      number: (paper?.questions.length || 0) + 1,
      blocks: [],
      marks: 5,
      optional: false,
      options: ['', '', '', ''], // Initialize empty options for MCQ
    };
    setSelectedQuestion(newQuestion);
    setEditingIndex(-1);

    // On mobile, scroll to editor after state update
    if (isMobile) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // AI Image Upload Handlers
  const handleImageSelect = (file: File) => {
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedData(null);
    }
  };

  const handleExtractQuestion = async () => {
    if (!selectedImage || !selectedQuestion) return;

    setIsProcessing(true);
    try {
      const questionType = selectedQuestion.type as QuestionFieldType;
      
      // Try Gemini API first for intelligent parsing
      let data;
      try {
        setIsProcessing(true);
        data = await extractQuestionWithGemini(selectedImage, questionType);
        toast.success('AI প্রশ্ন পড়ে ফিল্ড পূরণ করেছে!');
      } catch (geminiError) {
        // Fallback to Tesseract if Gemini fails
        console.log('Gemini failed, using Tesseract fallback:', geminiError);
        toast.warning('AI এরর - Tesseract ব্যবহার করছি...');
        data = await extractQuestionWithTesseract(selectedImage, questionType, (progress) => {
          console.log('OCR Progress:', progress);
        });
      }
      setExtractedData(data);
      toast.success('প্রশ্ন উদ্ধার সম্পন্ন');
    } catch (error: any) {
      toast.error(error.message || 'OCR ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyExtractedData = () => {
    if (!extractedData || !selectedQuestion) return;

    const questionType = selectedQuestion.type as QuestionFieldType;
    const mappedData = mapFieldsToQuestion(extractedData, questionType);

    setSelectedQuestion({
      ...selectedQuestion,
      blocks: mappedData.blocks || [],
      options: mappedData.options,
      correctAnswer: mappedData.correctAnswer,
      subQuestions: mappedData.subQuestions,
    });

    setIsAiDialogOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedData(null);
    toast.success('প্রশ্ন আপডেট হয়েছে');
  };

  const openAiDialog = () => {
    if (!selectedQuestion) {
      toast.error('প্রথমে একটি প্রশ্ন তৈরি বা নির্বাচন করুন');
      return;
    }
    setIsAiDialogOpen(true);
  };

  const saveQuestion = async () => {
    if (!paper || !selectedQuestion) return;

    if (selectedQuestion.blocks.length === 0) {
      toast.error('ন্তত একটি ব্লক যোগ করুন');
      return;
    }

    // MCQ validation
    if (selectedQuestion.type === 'mcq') {
      const options = selectedQuestion.options || ['', '', '', ''];
      // Allow saving MCQ without requiring all options or correct answer
    }

    let updatedQuestions = [...paper.questions];

    if (editingIndex >= 0) {
      updatedQuestions[editingIndex] = selectedQuestion;
      toast.success('প্রশ্ন আপডেট হয়েছে');
    } else {
      updatedQuestions.push(selectedQuestion);
      toast.success('প্রশ্ন যোগ হয়েছে');
    }

    // Renumber questions
    updatedQuestions = updatedQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));

    const updatedPaper = {
      ...paper,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    };

    await savePaper(updatedPaper);
    setPaper(updatedPaper);
    setSelectedQuestion(null);
    setEditingIndex(-1);
  };

  const editQuestion = (index: number) => {
    setSelectedQuestion({ ...paper!.questions[index] });
    setEditingIndex(index);

    // On mobile, scroll to editor after state update
    if (isMobile) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const deleteQuestion = async (index: number) => {
    if (!paper) return;

    const updatedQuestions = paper.questions
      .filter((_, idx) => idx !== index)
      .map((q, idx) => ({ ...q, number: idx + 1 }));

    const updatedPaper = {
      ...paper,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    };

    await savePaper(updatedPaper);
    setPaper(updatedPaper);
    toast.success('প্রশ্ন মুছে ফেলা হয়েছে');
  };

  const duplicateQuestion = async (index: number) => {
    if (!paper) return;

    const originalQuestion = paper.questions[index];
    
    // Create a deep copy with new IDs
    const duplicatedQuestion: Question = {
      ...originalQuestion,
      id: generateId(),
      number: paper.questions.length + 1,
      subQuestions: originalQuestion.subQuestions?.map(subQ => ({
        ...subQ,
        id: generateId(),
      })),
      options: originalQuestion.options ? [...originalQuestion.options] : undefined,
      correctAnswer: originalQuestion.correctAnswer,
      mcqFormat: originalQuestion.mcqFormat,
    };

    const updatedQuestions = [...paper.questions, duplicatedQuestion].map((q, idx) => ({
      ...q,
      number: idx + 1,
    }));

    const updatedPaper = {
      ...paper,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    };

    await savePaper(updatedPaper);
    setPaper(updatedPaper);
    toast.success('প্রশ্ন কপি করা হয়েছে');
  };

  const addSubQuestion = () => {
    if (!selectedQuestion) return;

    const labels = ['ক', 'খ', 'গ', 'ঘ'];
    const currentCount = selectedQuestion.subQuestions?.length || 0;

    if (currentCount >= 4) {
      toast.error('সর্বোচ্চ ৪টি উপপ্রশ্ন যোগ করা যাবে');
      return;
    }

    const newSubQuestion: SubQuestion = {
      id: generateId(),
      label: labels[currentCount],
      blocks: [],
      marks: 2,
    };

    setSelectedQuestion({
      ...selectedQuestion,
      subQuestions: [...(selectedQuestion.subQuestions || []), newSubQuestion],
    });
  };

  const updateSubQuestion = (index: number, subQuestion: SubQuestion) => {
    if (!selectedQuestion) return;

    const updatedSubQuestions = [...(selectedQuestion.subQuestions || [])];
    updatedSubQuestions[index] = subQuestion;

    setSelectedQuestion({
      ...selectedQuestion,
      subQuestions: updatedSubQuestions,
    });
  };

  const deleteSubQuestion = (index: number) => {
    if (!selectedQuestion) return;

    const updatedSubQuestions = (selectedQuestion.subQuestions || []).filter((_, idx) => idx !== index);

    setSelectedQuestion({
      ...selectedQuestion,
      subQuestions: updatedSubQuestions,
    });
  };

  if (!paper) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      {isMobile ? (
        <MobileHeader
          title={`${paper.setup.subject} - শ্রেণি ${paper.setup.class}`}
          subtitle={paper.setup.chapter}
          showBack={true}
          onBack={() => navigate('/')}
          action={
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/preview/${paperId}`)}
              className="h-10 w-10 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          }
        />
      ) : (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-slate-900">
                      {paper.setup.subject} - শ্রেণি {paper.setup.class}
                    </h1>
                    <p className="text-xs text-slate-500">{paper.setup.chapter}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {paper.questions.length} প্রশ্ন
                </Badge>
                <Button variant="outline" onClick={() => navigate(`/preview/${paperId}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  প্রিভিউ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8 pb-safe">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Question List - no fixed min-height; grows with content on mobile */}
          <div className="lg:col-span-1 flex flex-col">
            <Card className="flex flex-col">
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-base md:text-base font-['Noto_Sans_Bengali']">প্রশ্ন তালিকা</CardTitle>
                <CardDescription className="text-xs md:text-sm font-['Noto_Sans_Bengali']">
                  সর্বমোট {paper.questions.length}টি প্রশ্ন • ট্যাপ করে সম্পাদনা
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-2">
                <ScrollArea className="max-h-[60vh] md:max-h-none lg:h-[520px] pr-2 md:pr-4 overflow-y-auto">
                  <div className="space-y-2">
                    {paper.questions.length === 0 && (
                      <p className="text-sm text-slate-500 py-4 text-center font-['Noto_Sans_Bengali']">এখনও কোনো প্রশ্ন নেই। নিচে বাটন থেকে যোগ করুন।</p>
                    )}
                    {paper.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className={`p-3 rounded-xl border cursor-pointer transition-all active:scale-[0.99] touch-manipulation ${
                          editingIndex === index
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-slate-200 hover:border-slate-300 active:bg-slate-50'
                        }`}
                        onClick={() => editQuestion(index)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm font-['Noto_Sans_Bengali']">প্রশ্ন {question.number}</span>
                              <Badge variant="outline" className="text-xs font-['Noto_Sans_Bengali']">
                                {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-['Noto_Sans_Bengali']">
                              {question.marks} নম্বর
                              {question.optional && ' • ঐচ্ছিক'}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-blue-600 hover:bg-blue-50 touch-manipulation"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateQuestion(index);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 touch-manipulation"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteQuestion(index);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Question Editor - এখানে প্রশ্ন বানান */}
          <div className="lg:col-span-2 flex flex-col" ref={editorRef}>
            {selectedQuestion ? (
              <Card className="flex flex-col">
                <CardHeader className="p-4 md:p-6 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-['Noto_Sans_Bengali']">
                      {editingIndex >= 0 ? `প্রশ্ন ${selectedQuestion.number} সম্পাদনা` : 'নতুন প্রশ্ন'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 touch-manipulation"
                      onClick={() => {
                        setSelectedQuestion(null);
                        setEditingIndex(-1);
                      }}
                    >
                      বাতিল
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-2">
                  <ScrollArea className="max-h-[60vh] lg:h-[520px] pr-2 md:pr-4">
                    <div className="space-y-6">
                      {/* Question Type */}
                      <div className="space-y-2">
                        <Label className="font-['Noto_Sans_Bengali']">প্রশ্নের ধরন</Label>
                        <Select
                          value={selectedQuestion.type}
                          onValueChange={(value) =>
                            setSelectedQuestion(prev => {
                              const nextType = value as QuestionType;
                              if (nextType === 'mcq') {
                                return {
                                  ...prev,
                                  type: nextType,
                                  options: prev.options || ['', '', '', ''],
                                  mcqFormat: prev.mcqFormat || 'vertical',
                                } as any;
                              }
                              if (nextType === 'creative') {
                                // Auto-add 4 sub-questions for creative type
                                const defaultSubQuestions: SubQuestion[] = [
                                  { id: generateId(), label: 'ক', blocks: [], marks: 2 },
                                  { id: generateId(), label: 'খ', blocks: [], marks: 2 },
                                  { id: generateId(), label: 'গ', blocks: [], marks: 2 },
                                  { id: generateId(), label: 'ঘ', blocks: [], marks: 2 },
                                ];
                                return {
                                  ...prev,
                                  type: nextType,
                                  subQuestions: defaultSubQuestions,
                                } as any;
                              }
                              return { ...prev, type: nextType } as any;
                            })
                          }
                        >
                          <SelectTrigger className="w-full h-12 md:h-10 font-['Noto_Sans_Bengali']">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label} ({type.labelEn})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Extracted Text Area - Shows after AI/OCR */}
                      {extractedData && (
                        <div className="space-y-2">
                          <Label className="font-['Noto_Sans_Bengali']">
                            📋 AI থেকে উদ্ধারিত টেক্সট (কপি করে নিচে পেস্ট করুন):
                          </Label>
                          <textarea
                            className="w-full h-32 p-3 text-sm border-2 border-blue-200 rounded-lg bg-blue-50 font-['Noto_Sans_Bengali']"
                            value={extractedData.uddipok || extractedData.question || ''}
                            onChange={(e) => {
                              setExtractedData({
                                ...extractedData,
                                uddipok: e.target.value,
                                question: e.target.value,
                              });
                            }}
                            placeholder="এখানে উদ্ধারিত টেক্সট দেখুন..."
                          />
                          <p className="text-xs text-gray-500 font-['Noto_Sans_Bengali']">
                            উপরের টেক্সট কপি করে নিচে uddipok, ক, খ, গ, ঘ ফিল্ডে পেস্ট করুন।
                          </p>
                        </div>
                      )}

                      {/* Marks and Optional */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedQuestion.type !== 'mcq' && (
                          <div className="space-y-2">
                            <Label className="font-['Noto_Sans_Bengali']">নম্বর</Label>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              value={selectedQuestion.marks}
                              onChange={(e) =>
                                setSelectedQuestion({
                                  ...selectedQuestion,
                                  marks: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full h-12 md:h-10 font-['Noto_Sans_Bengali']"
                            />
                          </div>
                        )}
                      </div>

                      {/* MCQ Options */}
                      {selectedQuestion.type === 'mcq' && (
                        <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className="font-medium text-sm font-['Noto_Sans_Bengali']">বহুনির্বাচনী বিকল্প</h3>
                            <div className="flex gap-2">
                              <div className="w-36">
                                <Label className="mb-1 text-xs">লেবেল</Label>
                                <Select
                                  value={selectedQuestion.mcqLabelType || 'bangla'}
                                  onValueChange={(val) => setSelectedQuestion({ ...selectedQuestion, mcqLabelType: val as any })}
                                >
                                  <SelectTrigger className="w-full h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="bangla">বাংলা (ক,খ,গ,ঘ)</SelectItem>
                                    <SelectItem value="english">English (A,B,C,D)</SelectItem>
                                    <SelectItem value="roman">Roman (i,ii,iii,iv)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="w-36">
                                <Label className="mb-1 text-xs">ফরম্যাট</Label>
                                <Select
                                  value={selectedQuestion.mcqFormat || 'vertical'}
                                  onValueChange={(val) => setSelectedQuestion({ ...selectedQuestion, mcqFormat: val as any })}
                                >
                                  <SelectTrigger className="w-full h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="vertical">উপর-নিচে</SelectItem>
                                    <SelectItem value="two-column">দুই কলাম</SelectItem>
                                    <SelectItem value="answer-key">উত্তর চাবি</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          {(() => {
                            const labelType = selectedQuestion.mcqLabelType || 'bangla';
                            const labels = labelType === 'bangla' ? ['ক', 'খ', 'গ', 'ঘ'] 
                              : labelType === 'english' ? ['A', 'B', 'C', 'D'] 
                              : ['i', 'ii', 'iii', 'iv'];
                            return labels.map((label, idx) => (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-purple-200">
                                <div className="flex items-start justify-between mb-3 gap-3">
                                  <div className="flex items-center gap-3 flex-1">
                                    <Badge className="font-['Noto_Sans_Bengali']">{label}</Badge>
                                  </div>
                                </div>
                                
                                <Input
                                  placeholder={`বিকল্প ${label}`}
                                  value={selectedQuestion.options?.[idx] || ''}
                                  onChange={(e) => {
                                    const newOptions = [...(selectedQuestion.options || ['', '', '', ''])];
                                    newOptions[idx] = e.target.value;
                                    setSelectedQuestion({
                                      ...selectedQuestion,
                                      options: newOptions,
                                    });
                                  }}
                                  className="w-full h-11 md:h-9 font-['Noto_Sans_Bengali']"
                                />
                              </div>
                            ));
                          })()}
                        </div>
                      )}

                      {/* Creative Question Sub-parts */}
                      {selectedQuestion.type === 'creative' && (
                        <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h3 className="font-medium text-sm font-['Noto_Sans_Bengali']">সৃজনশীল উপপ্রশ্ন</h3>

                          {selectedQuestion.subQuestions?.map((subQ, idx) => (
                            <div key={subQ.id} className="p-3 bg-white rounded-xl border border-blue-200">
                              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <Badge className="font-['Noto_Sans_Bengali']">{subQ.label}</Badge>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={subQ.marks}
                                    onChange={(e) =>
                                      updateSubQuestion(idx, {
                                        ...subQ,
                                        marks: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full min-w-[80px] h-11 md:h-9 font-['Noto_Sans_Bengali']"
                                    placeholder="নম্বর"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600"
                                    onClick={() => deleteSubQuestion(idx)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>

                              <BlockEditor
                                blocks={subQ.blocks}
                                onChange={(blocks) => updateSubQuestion(idx, { ...subQ, blocks })}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Main Question Blocks */}
                      <div className="space-y-2">
                        <Label className="font-['Noto_Sans_Bengali']">
                          {selectedQuestion.type === 'creative' ? 'প্রশ্নের উদ্দীপক/স্টেম' : 'প্রশ্নের বিষয়বস্তু'}
                        </Label>
                        <BlockEditor
                          blocks={selectedQuestion.blocks}
                          onChange={(blocks) => setSelectedQuestion({ ...selectedQuestion, blocks })}
                        />
                      </div>

                      {/* AI Image Upload Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (!selectedQuestion) {
                              toast.error('প্রথমে একটি প্রশ্ন তৈরি বা নির্বাচন করুন');
                              return;
                            }
                            setIsAiDialogOpen(true);
                          }}
                          className="w-full h-10 border-dashed border-2 font-['Noto_Sans_Bengali']"
                        >
                          <Image className="w-4 h-4 mr-2"/>
                          📷 AI দিয়ে ছবি থেকে প্রশ্ন তৈরি করুন
                        </Button>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4 border-t">
                        <Button onClick={saveQuestion} className="w-full h-12 md:h-11 bg-green-600 hover:bg-green-700 text-base font-['Noto_Sans_Bengali'] touch-manipulation">
                          <Save className="w-5 h-5 mr-2" />
                          প্রশ্ন সংরক্ষণ করুন
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : paper.questions.length === 0 ? (
              /* শূন্য প্রশ্ন: প্রথম প্রশ্ন যোগের ফুল কার্ড (মোবাইল + ডেস্কটপ) */
              <Card className="flex items-center justify-center py-12 md:py-16 px-4">
                <div className="text-center max-w-sm">
                  <FileText className="w-14 h-14 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-['Noto_Sans_Bengali'] mb-1 text-sm md:text-base">একটি প্রশ্ন নির্বাচন করুন বা নতুন যোগ করুন</p>
                  <p className="text-slate-500 text-xs md:text-sm font-['Noto_Sans_Bengali'] mb-6">বাম পাশের তালিকা থেকে ট্যাপ করুন অথবা নিচে ক্লিক করুন</p>
                  <Button onClick={createNewQuestion} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-['Noto_Sans_Bengali'] touch-manipulation">
                    <Plus className="w-5 h-5 mr-2" />
                    প্রথম প্রশ্ন যোগ করুন
                  </Button>
                </div>
              </Card>
            ) : isMobile ? (
              /* মোবাইল: প্রশ্ন আছে, নির্বাচন নেই — বড় কার্ড না দেখিয়ে শুধু হিন্ট */
              <Card className="flex flex-col items-center justify-center py-6 px-4">
                <p className="text-slate-500 text-sm font-['Noto_Sans_Bengali'] text-center mb-4">
                  উপরের তালিকা থেকে প্রশ্ন ট্যাপ করে সম্পাদনা করুন
                </p>
                <Button 
                  onClick={createNewQuestion} 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-['Noto_Sans_Bengali'] touch-manipulation"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  নতুন প্রশ্ন যোগ করুন
                </Button>
              </Card>
            ) : (
              /* ডেস্কটপ: প্রশ্ন আছে, নির্বাচন নেই — আগের মতো সিলেক্ট/যোগ প্রম্পট */
              <Card className="flex items-center justify-center py-12 md:py-16 px-4">
                <div className="text-center max-w-sm">
                  <FileText className="w-14 h-14 md:w-16 md:h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-['Noto_Sans_Bengali'] mb-1 text-sm md:text-base">একটি প্রশ্ন নির্বাচন করুন বা নতুন যোগ করুন</p>
                  <p className="text-slate-500 text-xs md:text-sm font-['Noto_Sans_Bengali'] mb-6">বাম পাশের তালিকা থেকে ট্যাপ করুন অথবা নিচে ক্লিক করুন</p>
                  <Button onClick={createNewQuestion} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-['Noto_Sans_Bengali'] touch-manipulation">
                    <Plus className="w-5 h-5 mr-2" />
                    নতুন প্রশ্ন যোগ করুন
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* AI Image Upload Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Noto_Sans_Bengali']">📷 ছবি থেকে প্রশ্ন তৈরি</DialogTitle>
            <DialogDescription className="font-['Noto_Sans_Bengali']">
              একটি ছবি আপলোড করুন। AI প্রশ্নটি পড়ে আপনার জন্য ফিল্ডগুলো পূরণ করবে।
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload Area */}
            {!imagePreview ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                  className="hidden"
                  id="ai-image-upload"
                />
                <label
                  htmlFor="ai-image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Image className="w-12 h-12 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-['Noto_Sans_Bengali']">
                    ছবি আপলোড করতে এখানে ক্লিক করুন
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    (JPG, PNG - হস্তলিখিত বা মুদ্রিত)
                  </p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-contain bg-slate-100"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setExtractedData(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>

                {/* Process Button */}
                {!extractedData ? (
                  <Button
                    onClick={handleExtractQuestion}
                    disabled={isProcessing}
                    className="w-full font-['Noto_Sans_Bengali']"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI প্রশ্ন পড়ছে...
                      </>
                    ) : (
                      <>
                        🔍 প্রশ্ন উদ্ধার করুন
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {/* Extracted Text as Textarea - User can copy */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800 mb-2 font-['Noto_Sans_Bengali']">
                        ✓ উদ্ধারিত টেক্সট (কপি করে নিচের ফিল্ডে পেস্ট করুন):
                      </p>
                      <textarea
                        className="w-full h-40 p-2 text-sm border rounded font-['Noto_Sans_Bengali']"
                        value={extractedData.uddipok || extractedData.question || ''}
                        onChange={(e) => {
                          // Update the extracted data with edited text
                          setExtractedData({
                            ...extractedData,
                            uddipok: e.target.value,
                            question: e.target.value,
                          });
                        }}
                        placeholder="এখানে উদ্ধারিত টেক্সট দেখুন..."
                      />
                      <p className="text-xs text-gray-500 mt-2 font-['Noto_Sans_Bengali']">
                        উপরের টেক্সট কপি করে নিচে ম্যানুয়ালি পেস্ট করুন।
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                          setExtractedData(null);
                        }}
                        className="flex-1 font-['Noto_Sans_Bengali']"
                      >
                        আরেকটি ছবি
                      </Button>
                      <Button
                        onClick={handleApplyExtractedData}
                        className="flex-1 bg-green-600 hover:bg-green-700 font-['Noto_Sans_Bengali']"
                      >
                        ✓ প্রয়োগ করুন
                      </Button>
                    </div>

                    {/* Direct Save Button - Add to paper directly */}
                    <Button
                      onClick={async () => {
                        if (!extractedData || !paper) return;
                        
                        // Check if extracted data has creative question fields
                        const hasUddipok = extractedData.uddipok && extractedData.uddipok.length > 0;
                        const hasSubQuestions = extractedData.ka || extractedData.kha || extractedData.ga || extractedData.gha;
                        
                        // If has creative fields, force creative type; otherwise use selected or default
                        let questionType: QuestionFieldType;
                        if (hasUddipok || hasSubQuestions) {
                          questionType = 'creative';
                        } else {
                          questionType = (selectedQuestion?.type as QuestionFieldType) || 'creative';
                        }
                        
                        const mappedData = mapFieldsToQuestion(extractedData, questionType);
                        
                        // Create new question with extracted data
                        const newQuestion: Question = {
                          id: generateId(),
                          type: questionType,
                          number: paper.questions.length + 1,
                          blocks: mappedData.blocks || [],
                          marks: 5,
                          optional: false,
                          subQuestions: mappedData.subQuestions,
                          options: mappedData.options,
                          correctAnswer: mappedData.correctAnswer,
                        };
                        
                        // Add to paper
                        const updatedPaper = {
                          ...paper,
                          questions: [...paper.questions, newQuestion],
                          updatedAt: new Date().toISOString(),
                        };
                        
                        await savePaper(updatedPaper);
                        setPaper(updatedPaper);
                        
                        // Reset dialog
                        setIsAiDialogOpen(false);
                        setSelectedImage(null);
                        setImagePreview(null);
                        setExtractedData(null);
                        
                        toast.success('প্রশ্ন সরাসরি যোগ হয়েছে!');
                      }}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 font-['Noto_Sans_Bengali']"
                    >
                      ➕ সরাসরি কাগজে যোগ করুন
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import {
    ArrowLeft,
    BookOpen,
    Copy,
    Eye,
    FileText,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { BlockEditor } from '../components/BlockEditor';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
import { Switch } from '../components/ui/switch';
import { useIsMobile } from '../hooks/useIsMobile';
import { usePaper } from '../hooks/usePaper';
import { Question, QuestionPaper, QuestionType, SubQuestion } from '../types';
import { generateId, loadPapers, savePaper } from '../utils/storage';

const QUESTION_TYPES: { value: QuestionType; label: string; labelEn: string }[] = [
  { value: 'mcq', label: 'বহুনির্বাচনী', labelEn: 'MCQ' },
  { value: 'creative', label: 'সৃজনশীল', labelEn: 'Creative' },
  { value: 'short-question', label: 'সংক্ষিপ্ত প্রশ্ন', labelEn: 'Short Question' },
  { value: 'fill-in-blanks', label: 'শূন্যস্থান পূরণ', labelEn: 'Fill in Blanks' },
  { value: 'true-false', label: 'সত্য/মিথ্যা', labelEn: 'True/False' },
  { value: 'matching', label: 'মিলকরণ', labelEn: 'Matching' },
  { value: 'explain', label: 'ব্যাখ্যা', labelEn: 'Explain' },
  { value: 'problem-solving', label: 'সমস্যা সমাধান', labelEn: 'Problem Solving' },
  { value: 'conversion', label: 'রূপান্তর', labelEn: 'Conversion' },
  { value: 'pattern', label: 'প্যাটার্ন', labelEn: 'Pattern' },
  { value: 'diagram', label: 'চিত্র ভিত্তিক', labelEn: 'Diagram Based' },
  { value: 'construction', label: 'অঙ্কন', labelEn: 'Construction' },
  { value: 'table-based', label: 'টেবিল ভিত্তিক', labelEn: 'Table Based' },
  { value: 'graph-based', label: 'গ্রাফ ভিত্তিক', labelEn: 'Graph Based' },
  { value: 'proof', label: 'প্রমাণ', labelEn: 'Proof' },
];

export default function QuestionBuilder() {
  const { paper, setPaper, paperId } = usePaper();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const isMobile = useIsMobile();
  const editorRef = useRef<HTMLDivElement>(null);

  const createNewQuestion = () => {
    const newQuestion: Question = {
      id: generateId(),
      type: 'short-question',
      number: (paper?.questions.length || 0) + 1,
      blocks: [],
      marks: 5,
      optional: false,
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

  const saveQuestion = async () => {
    if (!paper || !selectedQuestion) return;

    if (selectedQuestion.blocks.length === 0) {
      toast.error('ন্তত একটি ব্লক যোগ করুন');
      return;
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
                            setSelectedQuestion({ ...selectedQuestion, type: value as QuestionType })
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

                      {/* Marks and Optional */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="space-y-2">
                          <Label className="font-['Noto_Sans_Bengali']">ঐচ্ছিক প্রশ্ন</Label>
                          <div className="flex items-center h-12 md:h-10">
                            <Switch
                              checked={selectedQuestion.optional}
                              onCheckedChange={(checked) =>
                                setSelectedQuestion({ ...selectedQuestion, optional: checked })
                              }
                            />
                            <span className="ml-2 text-sm text-slate-600">
                              {selectedQuestion.optional ? 'হ্যাঁ' : 'না'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Creative Question Sub-parts */}
                      {selectedQuestion.type === 'creative' && (
                        <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-medium text-sm font-['Noto_Sans_Bengali']">সৃজনশীল উপপ্রশ্ন</h3>
                            <Button size="sm" variant="outline" onClick={addSubQuestion} className="touch-manipulation font-['Noto_Sans_Bengali']">
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              উপপ্রশ্ন যোগ করুন
                            </Button>
                          </div>

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
    </div>
  );
}
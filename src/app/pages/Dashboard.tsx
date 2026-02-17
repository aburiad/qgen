import {
  BookOpen,
  Clock,
  Copy,
  Eye,
  FileText,
  GraduationCap,
  LogOut,
  MoreVertical,
  Pencil,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { HelpDialog } from '../components/HelpDialog';
import { FAB } from '../components/mobile/FAB';
import { MobileCard } from '../components/mobile/MobileCard';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useIsMobile } from '../hooks/useIsMobile';
import { QuestionPaper } from '../types';
import { deletePaper, duplicatePaper, loadPapers } from '../utils/storage';
import { getClassBangla, getExamTypeBangla } from '../utils/helpers';

export default function Dashboard() {
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fallback function to clean any remaining corrupted unicode (shouldn't be needed now)
  const stripCorruptedUnicode = (text: string) => {
    if (!text) return '';
    return text.replace(/u[0-9a-fA-F]{4}/g, '').trim();
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedPapers = await loadPapers();
        const papersArray = Array.isArray(loadedPapers) ? loadedPapers : [];
        setPapers(papersArray);
      } catch (error) {
        console.error('Error loading papers:', error);
        toast.error('Failed to load papers');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deletePaper(id);
      const updatedPapers = await loadPapers();
      setPapers(updatedPapers);
      toast.success('Question paper deleted');
    } catch (error) {
      console.error('Error deleting paper:', error);
      toast.error('Failed to delete paper');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const newPaper = await duplicatePaper(id);
      if (newPaper) {
        const updatedPapers = await loadPapers();
        setPapers(updatedPapers);
        toast.success('Question paper duplicated');
      }
    } catch (error) {
      console.error('Error duplicating paper:', error);
      toast.error('Failed to duplicate paper');
    }
  };

  const handleLogout = async () => {
    try {
      const { supabase } = await import('../utils/supabaseClient');
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut failed (non-blocking):', e);
    }

    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
    toast.info('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-safe">
      {!isMobile && (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">বাংলাদেশ বোর্ড প্রশ্নপত্র জেনারেটর</h1>
                  <p className="text-sm text-slate-500">Question Paper Generator</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HelpDialog />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="text-slate-500 hover:text-slate-900"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/setup')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন প্রশ্নপত্র তৈরি করুন
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobile && (
        <MobileHeader
          title="প্রশ্নপত্র জেনারেটর"
          subtitle="Question Paper Generator"
          showBack={false}
          onBack={() => {}}
          action={
            <div className="flex items-center gap-1">
              <HelpDialog />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                className="h-10 w-10 text-slate-500"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          }
        />
      )}

      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-8'}`}>
        {papers.length === 0 ? (
          <div className={`text-center ${isMobile ? 'py-12' : 'py-16'}`}>
            <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-medium text-slate-700 mb-2 font-['Noto_Sans_Bengali']">কোন প্রশ্নপত্র নেই</h2>
            <p className="text-slate-500 mb-6 font-['Noto_Sans_Bengali']">নতুন একটি প্রশ্নপত্র তৈরি করে শুরু করুন</p>
            {!isMobile && (
              <Button 
                onClick={() => navigate('/setup')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                প্রথম প্রশ্নপত্র তৈরি করুন
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className={`font-semibold text-slate-900 font-['Noto_Sans_Bengali'] ${isMobile ? 'text-base' : 'text-lg'}`}>
                আপনার প্রশ্নপত্রসমূহ
              </h2>
              <p className="text-sm text-slate-500 font-['Noto_Sans_Bengali']">মোট {papers.length}টি প্রশ্নপত্র</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper) => (
                isMobile ? (
                  <MobileCard 
                    key={paper.id} 
                    className="hover:shadow-md transition-shadow group"
                  >
                    <CardHeader className="pb-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          className="flex-1 cursor-pointer min-w-0 active:bg-slate-50 rounded-lg -m-2 p-2"
                          onClick={(e) => { e.stopPropagation(); navigate(`/builder/${paper.id}`); }}
                        >
                          <CardTitle className="mb-1 group-hover:text-blue-600 transition-colors font-['Noto_Sans_Bengali'] text-base">
                            শ্রেণি {getClassBangla(String(paper.setup.class))}
                          </CardTitle>

                          {/* Subject Name added here */}
                          <div className="text-sm font-semibold text-blue-600 font-['Noto_Sans_Bengali'] mb-1">
                            বিষয়: {paper.setup.subject}
                          </div>

                          <CardDescription className="text-sm font-['Noto_Sans_Bengali']">
                            {getExamTypeBangla(paper.setup.examType)}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 h-10 w-10 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/preview/${paper.id}`); }}>
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">প্রিভিউ দেখুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/setup/${paper.id}`); }}>
                              <Settings className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">সেটআপ এডিট করুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/builder/${paper.id}`); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">প্রশ্ন সম্পাদনা করুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(paper.id); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">কপি করুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDelete(paper.id); }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">মুছে ফেলুন</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent 
                      className="p-4 pt-0 cursor-pointer active:bg-slate-50 rounded-b-xl"
                      onClick={(e) => { e.stopPropagation(); navigate(`/builder/${paper.id}`); }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-['Noto_Sans_Bengali']">
                            {getExamTypeBangla(paper.setup.examType)}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-['Noto_Sans_Bengali']">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {paper.questions?.length || 0} প্রশ্ন
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-slate-600 font-['Noto_Sans_Bengali']">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{paper.setup.timeMinutes} মিনিট</span>
                          </div>
                          <div className="font-medium">
                            মোট নম্বর: {paper.setup.totalMarks}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 pt-2 border-t">
                          শেষ আপডেট: {new Date(paper.updatedAt).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                    </CardContent>
                  </MobileCard>
                ) : (
                  <Card key={paper.id} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate(`/builder/${paper.id}`)}
                        >
                          <CardTitle className="mb-1 group-hover:text-blue-600 transition-colors font-['Noto_Sans_Bengali'] text-base">
                            শ্রেণি {getClassBangla(String(paper.setup.class))}
                          </CardTitle>

                          {/* Subject Name added here */}
                          <div className="text-sm font-semibold text-blue-600 font-['Noto_Sans_Bengali'] mb-1">
                            বিষয়: {paper.setup.subject}
                          </div>

                          <CardDescription className="text-sm font-['Noto_Sans_Bengali']">
                            {getExamTypeBangla(paper.setup.examType)}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0 h-8 w-8" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/preview/${paper.id}`); }}>
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">প্রিভিউ দেখুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/setup/${paper.id}`); }}>
                              <Settings className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">সেটআপ এডিট করুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/builder/${paper.id}`); }}>
                              <Pencil className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">প্রশ্ন সম্পাদনা করুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(paper.id); }}>
                              <Copy className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">কপি করুন</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDelete(paper.id); }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              <span className="font-['Noto_Sans_Bengali']">মুছে ফেলুন</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent 
                      className="cursor-pointer"
                      onClick={() => navigate(`/builder/${paper.id}`)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-['Noto_Sans_Bengali']">
                            {getExamTypeBangla(paper.setup.examType)}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-['Noto_Sans_Bengali']">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {paper.questions?.length || 0} প্রশ্ন
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-slate-600 font-['Noto_Sans_Bengali']">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{paper.setup.timeMinutes} মিনিট</span>
                          </div>
                          <div className="font-medium">
                            মোট নম্বর: {paper.setup.totalMarks}
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 pt-2 border-t">
                          শেষ আপডেট: {new Date(paper.updatedAt).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </>
        )}
      </div>

      {isMobile && (
        <FAB 
          onClick={() => navigate('/setup')}
          label="নতুন প্রশ্নপত্র তৈরি করুন"
        />
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2, AlertCircle, Settings } from 'lucide-react';
import { pdfService } from '../utils/pdfService';
import { Alert, AlertDescription } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Input } from './ui/input';

interface GeneratePdfButtonProps {
  htmlContent: string | (() => string);
  filename?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const GeneratePdfButton: React.FC<GeneratePdfButtonProps> = ({
  htmlContent,
  filename = 'question-paper.pdf',
  label = 'PDF ডাউনলোড করুন',
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Margin states
  const [topMargin, setTopMargin] = useState(15);
  const [rightMargin, setRightMargin] = useState(10);
  const [bottomMargin, setBottomMargin] = useState(15);
  const [leftMargin, setLeftMargin] = useState(10);

  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get fresh content from function or use string directly
      const content = typeof htmlContent === 'function' ? htmlContent() : htmlContent;

      if (!content || content.trim() === '') {
        setError('কোনও কন্টেন্ট পাওয়া যায়নি। প্রথমে প্রশ্নপত্র তৈরি করুন।');
        return;
      }

      // Generate PDF with custom margins
      const options = {
        margin: {
          top: `${topMargin}mm`,
          right: `${rightMargin}mm`,
          bottom: `${bottomMargin}mm`,
          left: `${leftMargin}mm`
        }
      };

      const blob = await pdfService.generateQuestionPaper(content, filename, options);
      pdfService.downloadBlob(blob, filename);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF তৈরি করতে ব্যর্থ';
      setError(errorMessage);
      console.error('PDF download error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={handleDownloadPdf}
          disabled={disabled || isLoading}
          className={`${className} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              PDF তৈরি হচ্ছে...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {label}
            </>
          )}
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>PDF মার্জিন সেটিংস</DialogTitle>
              <DialogDescription>
                A4 পেজের জন্য মার্জিন সামঞ্জস্য করুন
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>উপরের মার্জিন: {topMargin}mm</Label>
                <Slider 
                  value={[topMargin]} 
                  onValueChange={(v) => setTopMargin(v[0])} 
                  min={0} 
                  max={30} 
                  step={1}
                />
                <Input 
                  type="number" 
                  value={topMargin} 
                  onChange={(e) => setTopMargin(Number(e.target.value))} 
                  min={0} 
                  max={30}
                />
              </div>

              <div className="space-y-2">
                <Label>ডানের মার্জিন: {rightMargin}mm</Label>
                <Slider 
                  value={[rightMargin]} 
                  onValueChange={(v) => setRightMargin(v[0])} 
                  min={0} 
                  max={30} 
                  step={1}
                />
                <Input 
                  type="number" 
                  value={rightMargin} 
                  onChange={(e) => setRightMargin(Number(e.target.value))} 
                  min={0} 
                  max={30}
                />
              </div>

              <div className="space-y-2">
                <Label>নিচের মার্জিন: {bottomMargin}mm</Label>
                <Slider 
                  value={[bottomMargin]} 
                  onValueChange={(v) => setBottomMargin(v[0])} 
                  min={0} 
                  max={30} 
                  step={1}
                />
                <Input 
                  type="number" 
                  value={bottomMargin} 
                  onChange={(e) => setBottomMargin(Number(e.target.value))} 
                  min={0} 
                  max={30}
                />
              </div>

              <div className="space-y-2">
                <Label>বামের মার্জিন: {leftMargin}mm</Label>
                <Slider 
                  value={[leftMargin]} 
                  onValueChange={(v) => setLeftMargin(v[0])} 
                  min={0} 
                  max={30} 
                  step={1}
                />
                <Input 
                  type="number" 
                  value={leftMargin} 
                  onChange={(e) => setLeftMargin(Number(e.target.value))} 
                  min={0} 
                  max={30}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setTopMargin(15); setRightMargin(10); setBottomMargin(15); setLeftMargin(10); }}
                >
                  ডিফল্ট
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setTopMargin(0); setRightMargin(0); setBottomMargin(0); setLeftMargin(0); }}
                >
                  কোন মার্জিন
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setTopMargin(20); setRightMargin(20); setBottomMargin(20); setLeftMargin(20); }}
                >
                  বড় মার্জিন
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default GeneratePdfButton;

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { pdfService } from '../utils/pdfService';
import { Alert, AlertDescription } from './ui/alert';

interface GeneratePdfButtonProps {
  htmlContent: string;
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

  const handleDownloadPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate PDF
      const blob = await pdfService.generateQuestionPaper(htmlContent, filename);

      // Download the PDF
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
      <Button
        onClick={handleDownloadPdf}
        disabled={disabled || isLoading || !htmlContent}
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

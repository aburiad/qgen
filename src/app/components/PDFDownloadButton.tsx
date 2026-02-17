import { Printer } from 'lucide-react';
import React, { useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

interface PDFDownloadButtonProps {
  previewRef: React.RefObject<HTMLDivElement | null>;
  printMargin?: number;
  onMarginChange?: (margin: number) => void;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  previewRef, 
  printMargin = 5,
  onMarginChange 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [margin, setMargin] = useState(printMargin);

  const handleMarginChange = (newMargin: number) => {
    setMargin(newMargin);
    onMarginChange?.(newMargin);
  };

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    pageStyle: `
      @page {
        margin: ${margin}mm;
      }
    `,
  });

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Printer className="w-4 h-4 mr-2" />
            প্রিন্ট / সেভ করুন
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>প্রিন্ট সেটিংস</DialogTitle>
            <DialogDescription>
              প্রিন্ট করার আগে মার্জিন সামঞ্জস্য করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>প্রিন্ট মার্জিন: {margin}mm</Label>
              <Slider 
                value={[margin]} 
                onValueChange={(v) => handleMarginChange(v[0])} 
                min={0} 
                max={40} 
                step={1} 
              />
              <Input 
                type="number" 
                value={margin} 
                onChange={(e) => handleMarginChange(Number(e.target.value))} 
                min={0} 
                max={40} 
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleMarginChange(0)}
              >
                কোন মার্জিন (0mm)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleMarginChange(10)}
              >
                ছোট (10mm)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleMarginChange(20)}
              >
                স্বাভাবিক (20mm)
              </Button>
            </div>
            <Button 
              onClick={() => {
                handlePrint();
                setDialogOpen(false);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              প্রিন্ট করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

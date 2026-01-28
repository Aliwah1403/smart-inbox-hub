import { FileText, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PDFPreviewProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PDFPreview({ document, open, onOpenChange }: PDFPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5; // Mock total pages

  if (!document) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-medium truncate pr-4">
              {document.filename}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-md">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{zoom}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-muted/50 p-4">
          <div 
            className="mx-auto bg-background rounded-lg shadow-lg flex items-center justify-center"
            style={{ 
              width: `${(595 * zoom) / 100}px`, 
              minHeight: `${(842 * zoom) / 100}px`,
              transform: `scale(1)`,
            }}
          >
            {/* Placeholder PDF content */}
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <div>
                <p className="font-medium">{document.title}</p>
                <p className="text-sm text-muted-foreground">
                  {document.fileType.toUpperCase()} • {(document.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <div className="text-xs text-muted-foreground max-w-md">
                <p className="mb-2">Document Preview Placeholder</p>
                <p>In a production app, this would render the actual PDF content using a library like react-pdf or pdf.js</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 border-t flex items-center justify-center gap-4 flex-shrink-0">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

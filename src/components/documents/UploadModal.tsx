import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Cloud, Mail, HardDrive, X, FileText, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Document } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFiles?: File[];
}

interface FileUpload {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export function UploadModal({ open, onOpenChange, initialFiles }: UploadModalProps) {
  const { user, addDocuments } = useApp();
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const processedFilesRef = useRef<File[]>([]);
  const filesLengthRef = useRef(0);

  // Keep ref in sync with files length for use in intervals
  useEffect(() => {
    filesLengthRef.current = files.length;
  }, [files.length]);

  const simulateUpload = useCallback((newFiles: File[]) => {
    const uploads: FileUpload[] = newFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles(prev => {
      const startIndex = prev.length;
      
      // Simulate upload progress for each file
      uploads.forEach((upload, index) => {
        let progress = 0;
        const fileIndex = startIndex + index;

        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setFiles(prevFiles => prevFiles.map((f, i) => 
              i === fileIndex 
                ? { ...f, progress: 100, status: 'completed' as const }
                : f
            ));

            // Add to documents after "upload" completes
            const newDoc: Document = {
              id: `doc-${Date.now()}-${index}`,
              filename: upload.file.name,
              title: upload.file.name.replace(/\.[^/.]+$/, ''),
              uploadDate: new Date(),
              uploader: user?.name || 'Unknown',
              uploaderId: user?.id || 'unknown',
              source: 'manual_upload',
              status: 'processing',
              tags: [],
              fileSize: upload.file.size,
              fileType: upload.file.type,
            };
            
            setTimeout(() => {
              addDocuments([newDoc]);
            }, 500);
          } else {
            setFiles(prevFiles => prevFiles.map((f, i) => 
              i === fileIndex 
                ? { ...f, progress }
                : f
            ));
          }
        }, 200);
      });
      
      return [...prev, ...uploads];
    });
  }, [user, addDocuments]);

  // Process initial files when modal opens with pre-dropped files
  useEffect(() => {
    if (open && initialFiles && initialFiles.length > 0) {
      // Check if these files are new (not already processed)
      const newFiles = initialFiles.filter(
        file => !processedFilesRef.current.some(
          pf => pf.name === file.name && pf.size === file.size
        )
      );
      
      if (newFiles.length > 0) {
        processedFilesRef.current = [...processedFilesRef.current, ...newFiles];
        simulateUpload(newFiles);
      }
    }
    
    // Reset processed files when modal closes
    if (!open) {
      processedFilesRef.current = [];
    }
  }, [open, initialFiles, simulateUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    simulateUpload(droppedFiles);
  }, [simulateUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      simulateUpload(selectedFiles);
    }
  }, [simulateUpload]);

  const handleClose = () => {
    setFiles([]);
    onOpenChange(false);
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const allCompleted = files.length > 0 && completedCount === files.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>
            Upload files from your device or connect to external sources
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload sources */}
          <div className="grid grid-cols-3 gap-3">
            <label 
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-accent"
            >
              <HardDrive className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">From device</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-not-allowed flex-col items-center gap-2 rounded-lg border border-border p-4 opacity-50">
                  <Cloud className="h-6 w-6" />
                  <span className="text-sm font-medium">Google Drive</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-not-allowed flex-col items-center gap-2 rounded-lg border border-border p-4 opacity-50">
                  <Mail className="h-6 w-6" />
                  <span className="text-sm font-medium">From email</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Documents can be pulled from connected email accounts</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Drop zone */}
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors",
              isDragging && "border-primary bg-primary/5"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag and drop files here</p>
            <p className="text-xs text-muted-foreground">or click "From device" to browse</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Uploading {completedCount}/{files.length} files
                </span>
                {allCompleted && (
                  <span className="flex items-center gap-1 text-sm text-success">
                    <Check className="h-4 w-4" />
                    All complete
                  </span>
                )}
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {files.map((upload, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{upload.file.name}</p>
                      <Progress value={upload.progress} className="mt-1 h-1" />
                    </div>
                    {upload.status === 'completed' && (
                      <Check className="h-4 w-4 text-success" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            {allCompleted ? 'Done' : 'Cancel'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

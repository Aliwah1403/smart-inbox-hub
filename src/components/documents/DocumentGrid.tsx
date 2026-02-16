import { format } from 'date-fns';
import { FileText, MoreHorizontal, Eye, Edit, Trash2, Share2, Download } from 'lucide-react';
import { Document, DocumentSource, DocumentStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import { useState } from 'react';

interface DocumentGridProps {
  documents: Document[];
  isLoading?: boolean;
  onViewDocument: (doc: Document) => void;
  onEditDocument: (doc: Document) => void;
  onShareDocument?: (doc: Document) => void;
}

const sourceLabels: Record<DocumentSource, string> = {
  manual_upload: 'Upload',
  scan_to_email: 'Scan',
  gmail: 'Gmail',
  outlook: 'Outlook',
  whatsapp: 'WhatsApp',
};

const sourceColors: Record<DocumentSource, string> = {
  manual_upload: 'bg-secondary text-secondary-foreground',
  scan_to_email: 'bg-primary/10 text-primary',
  gmail: 'bg-destructive/10 text-destructive',
  outlook: 'bg-primary/10 text-primary',
  whatsapp: 'bg-success/10 text-success',
};

const statusColors: Record<DocumentStatus, string> = {
  parsed: 'bg-success/10 text-success',
  needs_review: 'bg-warning/10 text-warning',
  processing: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<DocumentStatus, string> = {
  parsed: 'Parsed',
  needs_review: 'Review',
  processing: 'Processing',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function handleDownload(doc: Document) {
  const blob = new Blob([''], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DocumentGrid({
  documents,
  isLoading,
  onViewDocument,
  onEditDocument,
  onShareDocument,
}: DocumentGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string[]>([]);

  const handleDeleteClick = (docId: string) => {
    setDocumentToDelete([docId]);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="mb-3 h-24 w-full rounded-lg" />
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-1 text-lg font-medium">No documents found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or upload a new document
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => onViewDocument(doc)}
          >
            <CardContent className="p-4">
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{doc.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{doc.filename}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDocument(doc)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditDocument(doc)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {onShareDocument && (
                        <DropdownMenuItem onClick={() => onShareDocument(doc)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleDownload(doc)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(doc.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className={cn("text-xs", sourceColors[doc.source])}>
                  {sourceLabels[doc.source]}
                </Badge>
                <Badge variant="secondary" className={cn("text-xs", statusColors[doc.status])}>
                  {statusLabels[doc.status]}
                </Badge>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{format(doc.uploadDate, 'MMM d, yyyy')}</span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DeleteDocumentDialog
        documentIds={documentToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

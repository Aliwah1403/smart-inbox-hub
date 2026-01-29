import { format } from 'date-fns';
import { FileText, MoreHorizontal, Eye, Edit, Trash2, Share2, GripVertical } from 'lucide-react';
import { Document, DocumentSource, DocumentStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface DocumentTableProps {
  documents: Document[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
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

export function DocumentTable({
  documents,
  isLoading,
  selectedIds,
  onSelectIds,
  onViewDocument,
  onEditDocument,
  onShareDocument,
}: DocumentTableProps) {
  const { user, deleteDocuments } = useApp();
  const isAdmin = user?.role === 'admin';

  const toggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      onSelectIds([]);
    } else {
      onSelectIds(documents.map(d => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectIds(selectedIds.filter(i => i !== id));
    } else {
      onSelectIds([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead className="w-12" />}
              <TableHead>Document</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {isAdmin && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  const handleDragStart = (e: React.DragEvent, doc: Document) => {
    // If the dragged document is selected, drag all selected; otherwise just this one
    const idsToMove = selectedIds.includes(doc.id) && selectedIds.length > 1
      ? selectedIds
      : [doc.id];
    
    e.dataTransfer.setData('application/json', JSON.stringify({ documentIds: idsToMove }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === documents.length && documents.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="w-8" />
            <TableHead>Document</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow 
              key={doc.id}
              draggable
              onDragStart={(e) => handleDragStart(e, doc)}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                selectedIds.includes(doc.id) && "bg-muted/30"
              )}
              onClick={() => onViewDocument(doc)}
            >
              {isAdmin && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(doc.id)}
                    onCheckedChange={() => toggleSelect(doc.id)}
                  />
                </TableCell>
              )}
              <TableCell className="w-8 cursor-grab" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.filename}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={cn("text-xs", sourceColors[doc.source])}>
                  {sourceLabels[doc.source]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={cn("text-xs", statusColors[doc.status])}>
                  {statusLabels[doc.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <p>{format(doc.uploadDate, 'MMM d, yyyy')}</p>
                  <p className="text-xs text-muted-foreground">{doc.uploader}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatFileSize(doc.fileSize)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => deleteDocuments([doc.id])}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

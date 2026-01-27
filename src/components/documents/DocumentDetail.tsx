import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, X, Sparkles, Tag, Calendar, User, HardDrive, Edit2, Save } from 'lucide-react';
import { Document, DocumentSource, DocumentStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { availableTags, availableCategories } from '@/data/mockData';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DocumentDetailProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sourceLabels: Record<DocumentSource, string> = {
  manual_upload: 'Manual Upload',
  scan_to_email: 'Scan-to-Email',
  gmail: 'Gmail',
  outlook: 'Outlook',
};

const statusLabels: Record<DocumentStatus, string> = {
  parsed: 'Parsed',
  needs_review: 'Needs Review',
  processing: 'Processing',
};

const statusColors: Record<DocumentStatus, string> = {
  parsed: 'bg-success/10 text-success',
  needs_review: 'bg-warning/10 text-warning',
  processing: 'bg-muted text-muted-foreground',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function DocumentDetail({ document: doc, open, onOpenChange }: DocumentDetailProps) {
  const { updateDocument } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  if (!doc) return null;

  const startEditing = () => {
    setEditTitle(doc.title);
    setEditCategory(doc.category || '');
    setEditTags(doc.tags);
    setIsEditing(true);
  };

  const saveChanges = () => {
    updateDocument(doc.id, {
      title: editTitle,
      category: editCategory || undefined,
      tags: editTags,
    });
    setIsEditing(false);
  };

  const toggleTag = (tag: string) => {
    setEditTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-xl">Document Details</SheetTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <Button size="sm" onClick={saveChanges}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
            <div className="text-center">
              <FileText className="mx-auto mb-2 h-16 w-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Document preview</p>
              <p className="text-xs text-muted-foreground">{doc.filename}</p>
            </div>
          </div>

          {/* Title and category */}
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-semibold">{doc.title}</h2>
                  <p className="text-sm text-muted-foreground">{doc.filename}</p>
                </div>
                {doc.category && (
                  <Badge variant="outline">{doc.category}</Badge>
                )}
              </>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={editTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {doc.tags.length > 0 ? (
                  doc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Uploaded
              </p>
              <p className="text-sm font-medium">
                {format(doc.uploadDate, 'MMM d, yyyy')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                Uploader
              </p>
              <p className="text-sm font-medium">{doc.uploader}</p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <HardDrive className="h-3 w-3" />
                Source
              </p>
              <p className="text-sm font-medium">{sourceLabels[doc.source]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="secondary" className={cn("text-xs", statusColors[doc.status])}>
                {statusLabels[doc.status]}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">File size</p>
              <p className="text-sm font-medium">{formatFileSize(doc.fileSize)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">File type</p>
              <p className="text-sm font-medium">{doc.fileType}</p>
            </div>
          </div>

          {/* AI Summary */}
          {doc.aiSummary && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Summary
                </Label>
                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="text-sm leading-relaxed">{doc.aiSummary}</p>
                </div>
              </div>
            </>
          )}

          {/* Extracted fields */}
          {doc.extractedFields && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Extracted Fields</Label>
                <div className="rounded-lg border border-border">
                  {Object.entries(doc.extractedFields).map(([key, value], index) => (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center justify-between px-4 py-2",
                        index !== 0 && "border-t border-border"
                      )}
                    >
                      <span className="text-sm text-muted-foreground">{key}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

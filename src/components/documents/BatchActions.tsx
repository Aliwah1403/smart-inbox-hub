import { useState } from 'react';
import { Tag, Trash2, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { availableTags } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';

interface BatchActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function BatchActions({ selectedIds, onClearSelection }: BatchActionsProps) {
  const { documents, updateDocument } = useApp();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleAddTag = (tag: string) => {
    selectedIds.forEach(id => {
      const doc = documents.find(d => d.id === id);
      if (doc && !doc.tags.includes(tag)) {
        updateDocument(id, { tags: [...doc.tags, tag] });
      }
    });
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg bg-muted p-3 animate-fade-in">
        <Badge variant="secondary" className="gap-1">
          {selectedIds.length} selected
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={onClearSelection}
          />
        </Badge>

        <div className="h-4 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Tag className="mr-2 h-4 w-4" />
              Add tag
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableTags.map((tag) => (
              <DropdownMenuItem key={tag} onClick={() => handleAddTag(tag)}>
                {tag}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <DeleteDocumentDialog
        documentIds={selectedIds}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onComplete={onClearSelection}
      />
    </>
  );
}

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewFolderCardProps {
  onClick: () => void;
  viewMode: 'grid' | 'list';
}

export function NewFolderCard({ onClick, viewMode }: NewFolderCardProps) {
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-4 p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 transition-all w-full text-left"
      >
        <div className="w-10 h-8 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">New Folder</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group p-4 rounded-xl border-2 border-dashed border-muted-foreground/30",
        "hover:border-primary/50 hover:bg-muted/50 transition-all",
        "flex flex-col items-center justify-center text-center min-h-[140px]"
      )}
    >
      <div className="w-20 h-16 rounded-xl border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/50 flex items-center justify-center mb-3 transition-colors">
        <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        New...
      </span>
    </button>
  );
}

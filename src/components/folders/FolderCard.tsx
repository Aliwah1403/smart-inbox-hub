import { MoreHorizontal, Pencil, Trash2, Palette, Pin, PinOff, RotateCcw, Trash } from 'lucide-react';
import { useState } from 'react';
import { Folder, FolderColor, useFolders } from '@/context/FolderContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DeleteConfirmDialog } from '@/components/trash/DeleteConfirmDialog';

interface FolderCardProps {
  folder: Folder & { documentCount: number };
  viewMode: 'grid' | 'list';
  onClick: () => void;
  isTrashed?: boolean;
}

const folderColors: Record<FolderColor, { bg: string; icon: string; border: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-500', border: 'border-blue-200 dark:border-blue-800' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', icon: 'text-pink-500', border: 'border-pink-200 dark:border-pink-800' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: 'text-yellow-500', border: 'border-yellow-200 dark:border-yellow-800' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-500', border: 'border-red-200 dark:border-red-800' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-500', border: 'border-green-200 dark:border-green-800' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-500', border: 'border-purple-200 dark:border-purple-800' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-500', border: 'border-orange-200 dark:border-orange-800' },
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-500', border: 'border-teal-200 dark:border-teal-800' },
};

const colorHexValues: Record<FolderColor, string> = {
  blue: '#60A5FA',
  pink: '#F472B6',
  yellow: '#FBBF24',
  red: '#F87171',
  green: '#4ADE80',
  purple: '#A78BFA',
  orange: '#FB923C',
  teal: '#2DD4BF',
};

const colorLabels: Record<FolderColor, string> = {
  blue: 'Blue',
  pink: 'Pink',
  yellow: 'Yellow',
  red: 'Red',
  green: 'Green',
  purple: 'Purple',
  orange: 'Orange',
  teal: 'Teal',
};

export function FolderCard({ folder, viewMode, onClick, isTrashed = false }: FolderCardProps) {
  const { renameFolder, updateFolderColor, deleteFolder, toggleQuickAccess, restoreFolder, permanentlyDeleteFolder } = useFolders();
  const [editDialog, setEditDialog] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const colors = folderColors[folder.color];
  const allColors: FolderColor[] = ['blue', 'pink', 'yellow', 'red', 'green', 'purple', 'orange', 'teal'];

  const handleRename = () => {
    if (editName.trim()) {
      renameFolder(folder.id, editName.trim());
      setEditDialog(false);
    }
  };

  const handleColorChange = (color: FolderColor) => {
    updateFolderColor(folder.id, color);
    toast.success(`Folder color changed to ${colorLabels[color]}`);
  };

  const handleToggleQuickAccess = () => {
    toggleQuickAccess(folder.id);
    toast.success(folder.isQuickAccess ? 'Removed from Quick Access' : 'Added to Quick Access');
  };

  const handleRestore = () => {
    restoreFolder(folder.id);
    toast.success('Folder restored');
  };

  const handlePermanentDelete = () => {
    permanentlyDeleteFolder(folder.id);
    toast.success('Folder permanently deleted');
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const cardContent = viewMode === 'list' ? (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
        colors.bg,
        colors.border
      )}
    >
      <FolderIcon color={folder.color} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{folder.name}</p>
          {folder.isQuickAccess && <Pin className="h-3 w-3 text-muted-foreground" />}
        </div>
        <p className="text-sm text-muted-foreground">
          {folder.documentCount} {folder.documentCount === 1 ? 'file' : 'files'}
        </p>
      </div>
      {!isTrashed && (
        <div onClick={stopPropagation}>
          <FolderActions
            folder={folder}
            allColors={allColors}
            onRename={() => { setEditName(folder.name); setEditDialog(true); }}
            onColorChange={handleColorChange}
            onDelete={() => setDeleteDialogOpen(true)}
            onToggleQuickAccess={handleToggleQuickAccess}
            isTrashed={isTrashed}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      )}
      {isTrashed && (
        <div onClick={stopPropagation}>
          <FolderActions
            folder={folder}
            allColors={allColors}
            onRename={() => {}}
            onColorChange={handleColorChange}
            onDelete={() => {}}
            onToggleQuickAccess={() => {}}
            isTrashed={isTrashed}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      )}
    </div>
  ) : (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
        colors.bg,
        colors.border
      )}
    >
      {folder.isQuickAccess && (
        <div className="absolute top-2 left-2">
          <Pin className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      {!isTrashed && (
        <div 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={stopPropagation}
        >
          <FolderActions
            folder={folder}
            allColors={allColors}
            onRename={() => { setEditName(folder.name); setEditDialog(true); }}
            onColorChange={handleColorChange}
            onDelete={() => setDeleteDialogOpen(true)}
            onToggleQuickAccess={handleToggleQuickAccess}
            isTrashed={isTrashed}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      )}
      {isTrashed && (
        <div 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={stopPropagation}
        >
          <FolderActions
            folder={folder}
            allColors={allColors}
            onRename={() => {}}
            onColorChange={handleColorChange}
            onDelete={() => {}}
            onToggleQuickAccess={() => {}}
            isTrashed={isTrashed}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </div>
      )}
      
      <div className="flex flex-col items-center text-center space-y-3">
        <FolderIcon color={folder.color} size="lg" />
        <div className="space-y-1">
          <p className="font-medium truncate max-w-full">{folder.name}</p>
          <p className="text-xs text-muted-foreground">
            {folder.documentCount} {folder.documentCount === 1 ? 'file' : 'files'}
          </p>
        </div>
      </div>
    </div>
  );

  if (isTrashed) {
    return (
      <>
        {cardContent}
        <RenameDialog
          open={editDialog}
          onOpenChange={setEditDialog}
          name={editName}
          onNameChange={setEditName}
          onSave={handleRename}
        />
      </>
    );
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardContent}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={handleToggleQuickAccess}>
            {folder.isQuickAccess ? (
              <>
                <PinOff className="mr-2 h-4 w-4" />
                Remove from Quick Access
              </>
            ) : (
              <>
                <Pin className="mr-2 h-4 w-4" />
                Add to Quick Access
              </>
            )}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => { setEditName(folder.name); setEditDialog(true); }}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Palette className="mr-2 h-4 w-4" />
              Change Color
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {allColors.map((color) => (
                <ContextMenuItem 
                  key={color} 
                  onClick={() => handleColorChange(color)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: colorHexValues[color] }} 
                  />
                  {colorLabels[color]}
                  {folder.color === color && (
                    <span className="ml-auto text-xs text-muted-foreground">✓</span>
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuItem 
            className="text-destructive focus:text-destructive" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Move to Trash
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <RenameDialog
        open={editDialog}
        onOpenChange={setEditDialog}
        name={editName}
        onNameChange={setEditName}
        onSave={handleRename}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => deleteFolder(folder.id)}
        itemType="folder"
        itemName={folder.name}
      />
    </>
  );
}

function FolderIcon({ color, size }: { color: FolderColor; size: 'sm' | 'lg' }) {
  const colorValue = colorHexValues[color];
  const sizeClass = size === 'lg' ? 'w-20 h-16' : 'w-10 h-8';
  
  return (
    <svg 
      viewBox="0 0 80 64" 
      className={sizeClass}
      fill="none"
    >
      {/* Back of folder */}
      <path
        d="M4 12C4 7.58172 7.58172 4 12 4H28L36 14H68C72.4183 14 76 17.5817 76 22V52C76 56.4183 72.4183 60 68 60H12C7.58172 60 4 56.4183 4 52V12Z"
        fill={colorValue}
        opacity="0.7"
      />
      {/* Front of folder */}
      <path
        d="M4 24C4 19.5817 7.58172 16 12 16H68C72.4183 16 76 19.5817 76 24V52C76 56.4183 72.4183 60 68 60H12C7.58172 60 4 56.4183 4 52V24Z"
        fill={colorValue}
      />
      {/* Highlight */}
      <path
        d="M12 20H68C70.2091 20 72 21.7909 72 24V28H8V24C8 21.7909 9.79086 20 12 20Z"
        fill="white"
        opacity="0.3"
      />
    </svg>
  );
}

function FolderActions({ 
  folder, 
  allColors,
  onRename, 
  onColorChange, 
  onDelete,
  onToggleQuickAccess,
  isTrashed,
  onRestore,
  onPermanentDelete,
}: { 
  folder: Folder;
  allColors: FolderColor[];
  onRename: () => void;
  onColorChange: (color: FolderColor) => void;
  onDelete: () => void;
  onToggleQuickAccess: () => void;
  isTrashed?: boolean;
  onRestore: () => void;
  onPermanentDelete: () => void;
}) {
  if (isTrashed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRestore}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={onPermanentDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onToggleQuickAccess}>
          {folder.isQuickAccess ? (
            <>
              <PinOff className="mr-2 h-4 w-4" />
              Remove from Quick Access
            </>
          ) : (
            <>
              <Pin className="mr-2 h-4 w-4" />
              Add to Quick Access
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Change Color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {allColors.map((color) => (
              <DropdownMenuItem 
                key={color} 
                onClick={() => onColorChange(color)}
                className="flex items-center gap-2"
              >
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: colorHexValues[color] }} 
                />
                {colorLabels[color]}
                {folder.color === color && (
                  <span className="ml-auto text-xs text-muted-foreground">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Move to Trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RenameDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Folder name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ColorDialog is no longer used - colors are now in submenus

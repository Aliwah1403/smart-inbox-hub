import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemType: 'document' | 'folder';
  itemCount?: number;
  itemName?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  itemCount = 1,
  itemName,
}: DeleteConfirmDialogProps) {
  const isMultiple = itemCount > 1;
  const itemLabel = isMultiple 
    ? `${itemCount} ${itemType}s` 
    : itemName 
      ? `"${itemName}"` 
      : `this ${itemType}`;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Move to Trash?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              {isMultiple 
                ? `${itemCount} ${itemType}s will be moved to the trash.`
                : `${itemLabel} will be moved to the trash.`}
            </span>
            <span className="block text-muted-foreground">
              You can restore {isMultiple ? 'them' : 'it'} from the Trash page within 30 days. 
              After that, {isMultiple ? 'they' : 'it'} will be permanently deleted.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Move to Trash
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

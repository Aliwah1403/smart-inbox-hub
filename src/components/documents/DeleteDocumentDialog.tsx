import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
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

interface DeleteDocumentDialogProps {
  documentIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function DeleteDocumentDialog({
  documentIds,
  open,
  onOpenChange,
  onComplete,
}: DeleteDocumentDialogProps) {
  const { trashDocuments, restoreDocuments } = useApp();
  const count = documentIds.length;

  const handleConfirm = () => {
    trashDocuments(documentIds);
    onOpenChange(false);
    onComplete?.();

    toast.info(
      count === 1 ? 'Document moved to trash' : `${count} documents moved to trash`,
      {
        action: {
          label: 'Undo',
          onClick: () => {
            restoreDocuments(documentIds);
            toast.success(count === 1 ? 'Document restored' : `${count} documents restored`);
          },
        },
        duration: 5000,
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Move to Trash?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {count === 1
              ? 'This document will be moved to the trash. You can restore it later from the Trash folder.'
              : `${count} documents will be moved to the trash. You can restore them later from the Trash folder.`}
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

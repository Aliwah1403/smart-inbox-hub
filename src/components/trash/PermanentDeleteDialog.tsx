import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PermanentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmPhrase?: string;
}

export function PermanentDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmPhrase = 'delete',
}: PermanentDeleteDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const isConfirmed = inputValue.toLowerCase() === confirmPhrase.toLowerCase();

  useEffect(() => {
    if (!open) setInputValue('');
  }, [open]);

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-phrase" className="text-sm">
            Type <span className="font-bold text-foreground">{confirmPhrase}</span> to continue
          </Label>
          <Input
            id="confirm-phrase"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmPhrase}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isConfirmed) handleConfirm();
            }}
            autoComplete="off"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!isConfirmed}
            onClick={handleConfirm}
          >
            Delete Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

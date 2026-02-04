import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export default function Trash() {
  const { trashedDocuments, restoreDocuments, permanentlyDeleteDocuments } = useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === trashedDocuments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(trashedDocuments.map(d => d.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRestore = () => {
    restoreDocuments(selectedIds);
    toast.success(
      selectedIds.length === 1
        ? 'Document restored'
        : `${selectedIds.length} documents restored`
    );
    setSelectedIds([]);
  };

  const handlePermanentDelete = () => {
    permanentlyDeleteDocuments(selectedIds);
    toast.success(
      selectedIds.length === 1
        ? 'Document permanently deleted'
        : `${selectedIds.length} documents permanently deleted`
    );
    setSelectedIds([]);
    setDeleteDialogOpen(false);
  };

  const handleEmptyTrash = () => {
    const allIds = trashedDocuments.map(d => d.id);
    permanentlyDeleteDocuments(allIds);
    toast.success('Trash emptied');
    setSelectedIds([]);
    setEmptyTrashDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Trash
            </h1>
            <p className="text-muted-foreground">
              {trashedDocuments.length} document{trashedDocuments.length !== 1 ? 's' : ''} in trash
            </p>
          </div>
          {trashedDocuments.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setEmptyTrashDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Empty Trash
            </Button>
          )}
        </div>

        {/* Batch Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
            <Badge variant="secondary">
              {selectedIds.length} selected
            </Badge>
            <div className="h-4 w-px bg-border" />
            <Button variant="outline" size="sm" onClick={handleRestore}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Forever
            </Button>
          </div>
        )}

        {/* Table */}
        {trashedDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Trash2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-medium">Trash is empty</h3>
            <p className="text-sm text-muted-foreground">
              Documents you delete will appear here
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === trashedDocuments.length && trashedDocuments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trashedDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(doc.id)}
                        onCheckedChange={() => toggleSelect(doc.id)}
                      />
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
                    <TableCell className="text-sm text-muted-foreground">
                      {format(doc.uploadDate, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            restoreDocuments([doc.id]);
                            toast.success('Document restored');
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedIds([doc.id]);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Permanent Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Forever?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedIds.length === 1
                  ? 'This document will be permanently deleted. This action cannot be undone.'
                  : `${selectedIds.length} documents will be permanently deleted. This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handlePermanentDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Empty Trash Confirmation */}
        <AlertDialog open={emptyTrashDialogOpen} onOpenChange={setEmptyTrashDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Empty Trash?
              </AlertDialogTitle>
              <AlertDialogDescription>
                All {trashedDocuments.length} document{trashedDocuments.length !== 1 ? 's' : ''} will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEmptyTrash}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Empty Trash
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}

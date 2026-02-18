import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, Folder } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useApp } from '@/context/AppContext';
import { useFolders } from '@/context/FolderContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PermanentDeleteDialog } from '@/components/trash/PermanentDeleteDialog';
import { toast } from 'sonner';

const TRASH_RETENTION_DAYS = 30;

function getDaysUntilExpiry(trashedAt?: Date): number {
  if (!trashedAt) return TRASH_RETENTION_DAYS;
  const daysSinceTrashed = differenceInDays(new Date(), new Date(trashedAt));
  return Math.max(0, TRASH_RETENTION_DAYS - daysSinceTrashed);
}

function ExpiryBadge({ daysLeft }: { daysLeft: number }) {
  const variant = daysLeft <= 7 ? 'destructive' : daysLeft <= 14 ? 'secondary' : 'outline';
  return (
    <Badge variant={variant} className="font-mono">
      {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
    </Badge>
  );
}

export default function Trash() {
  const { trashedDocuments, restoreDocuments, permanentlyDeleteDocuments } = useApp();
  const { trashedFolders, restoreFolder, permanentlyDeleteFolder } = useFolders();
  
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [deleteDocDialogOpen, setDeleteDocDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);

  const totalTrashedItems = trashedDocuments.length + trashedFolders.length;

  // Document handlers
  const toggleSelectAllDocs = () => {
    if (selectedDocIds.length === trashedDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(trashedDocuments.map(d => d.id));
    }
  };

  const toggleSelectDoc = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter(i => i !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const handleRestoreDocs = () => {
    restoreDocuments(selectedDocIds);
    toast.success(
      selectedDocIds.length === 1
        ? 'Document restored'
        : `${selectedDocIds.length} documents restored`
    );
    setSelectedDocIds([]);
  };

  const handlePermanentDeleteDocs = () => {
    permanentlyDeleteDocuments(selectedDocIds);
    toast.success(
      selectedDocIds.length === 1
        ? 'Document permanently deleted'
        : `${selectedDocIds.length} documents permanently deleted`
    );
    setSelectedDocIds([]);
    setDeleteDocDialogOpen(false);
  };

  // Folder handlers
  const toggleSelectAllFolders = () => {
    if (selectedFolderIds.length === trashedFolders.length) {
      setSelectedFolderIds([]);
    } else {
      setSelectedFolderIds(trashedFolders.map(f => f.id));
    }
  };

  const toggleSelectFolder = (id: string) => {
    if (selectedFolderIds.includes(id)) {
      setSelectedFolderIds(selectedFolderIds.filter(i => i !== id));
    } else {
      setSelectedFolderIds([...selectedFolderIds, id]);
    }
  };

  const handleRestoreFolders = () => {
    selectedFolderIds.forEach(id => restoreFolder(id));
    toast.success(
      selectedFolderIds.length === 1
        ? 'Folder restored'
        : `${selectedFolderIds.length} folders restored`
    );
    setSelectedFolderIds([]);
  };

  const handlePermanentDeleteFolders = () => {
    selectedFolderIds.forEach(id => permanentlyDeleteFolder(id));
    toast.success(
      selectedFolderIds.length === 1
        ? 'Folder permanently deleted'
        : `${selectedFolderIds.length} folders permanently deleted`
    );
    setSelectedFolderIds([]);
    setDeleteFolderDialogOpen(false);
  };

  // Empty all trash
  const handleEmptyTrash = () => {
    const allDocIds = trashedDocuments.map(d => d.id);
    permanentlyDeleteDocuments(allDocIds);
    trashedFolders.forEach(f => permanentlyDeleteFolder(f.id));
    toast.success('Trash emptied');
    setSelectedDocIds([]);
    setSelectedFolderIds([]);
    setEmptyTrashDialogOpen(false);
  };

  const EmptyState = ({ type }: { type: 'documents' | 'folders' }) => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
      {type === 'documents' ? (
        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
      ) : (
        <Folder className="mb-4 h-12 w-12 text-muted-foreground" />
      )}
      <h3 className="mb-1 text-lg font-medium">No {type} in trash</h3>
      <p className="text-sm text-muted-foreground">
        {type === 'documents' ? 'Documents' : 'Folders'} you delete will appear here
      </p>
    </div>
  );

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
              {totalTrashedItems} item{totalTrashedItems !== 1 ? 's' : ''} in trash
              {totalTrashedItems > 0 && ' • Items are permanently deleted after 30 days'}
            </p>
          </div>
          {totalTrashedItems > 0 && (
            <Button
              variant="destructive"
              onClick={() => setEmptyTrashDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Empty Trash
            </Button>
          )}
        </div>

        {totalTrashedItems === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
            <Trash2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-medium">Trash is empty</h3>
            <p className="text-sm text-muted-foreground">
              Items you delete will appear here
            </p>
          </div>
        ) : (
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Documents
                {trashedDocuments.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {trashedDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="folders" className="gap-2">
                <Folder className="h-4 w-4" />
                Folders
                {trashedFolders.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {trashedFolders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              {/* Batch Actions */}
              {selectedDocIds.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <Badge variant="secondary">
                    {selectedDocIds.length} selected
                  </Badge>
                  <div className="h-4 w-px bg-border" />
                  <Button variant="outline" size="sm" onClick={handleRestoreDocs}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteDocDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Forever
                  </Button>
                </div>
              )}

              {trashedDocuments.length === 0 ? (
                <EmptyState type="documents" />
              ) : (
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedDocIds.length === trashedDocuments.length && trashedDocuments.length > 0}
                            onCheckedChange={toggleSelectAllDocs}
                          />
                        </TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Deleted</TableHead>
                        <TableHead>Days Til Expiry</TableHead>
                        <TableHead className="w-32" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trashedDocuments.map((doc) => {
                        const daysLeft = getDaysUntilExpiry(doc.trashedAt);
                        return (
                          <TableRow key={doc.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedDocIds.includes(doc.id)}
                                onCheckedChange={() => toggleSelectDoc(doc.id)}
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
                              {doc.trashedAt 
                                ? format(new Date(doc.trashedAt), 'MMM d, yyyy')
                                : format(doc.uploadDate, 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <ExpiryBadge daysLeft={daysLeft} />
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
                                    setSelectedDocIds([doc.id]);
                                    setDeleteDocDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Folders Tab */}
            <TabsContent value="folders" className="space-y-4">
              {/* Batch Actions */}
              {selectedFolderIds.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <Badge variant="secondary">
                    {selectedFolderIds.length} selected
                  </Badge>
                  <div className="h-4 w-px bg-border" />
                  <Button variant="outline" size="sm" onClick={handleRestoreFolders}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteFolderDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Forever
                  </Button>
                </div>
              )}

              {trashedFolders.length === 0 ? (
                <EmptyState type="folders" />
              ) : (
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedFolderIds.length === trashedFolders.length && trashedFolders.length > 0}
                            onCheckedChange={toggleSelectAllFolders}
                          />
                        </TableHead>
                        <TableHead>Folder</TableHead>
                        <TableHead>Deleted</TableHead>
                        <TableHead>Days Til Expiry</TableHead>
                        <TableHead className="w-32" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trashedFolders.map((folder) => {
                        const daysLeft = getDaysUntilExpiry(folder.trashedAt);
                        return (
                          <TableRow key={folder.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedFolderIds.includes(folder.id)}
                                onCheckedChange={() => toggleSelectFolder(folder.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                  <Folder className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium">{folder.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {folder.documentCount} {folder.documentCount === 1 ? 'file' : 'files'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {folder.trashedAt 
                                ? format(new Date(folder.trashedAt), 'MMM d, yyyy')
                                : format(folder.createdAt, 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <ExpiryBadge daysLeft={daysLeft} />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    restoreFolder(folder.id);
                                    toast.success('Folder restored');
                                  }}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedFolderIds([folder.id]);
                                    setDeleteFolderDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Document Permanent Delete Confirmation */}
        <PermanentDeleteDialog
          open={deleteDocDialogOpen}
          onOpenChange={setDeleteDocDialogOpen}
          onConfirm={handlePermanentDeleteDocs}
          title="Delete Forever?"
          description={
            selectedDocIds.length === 1
              ? 'This document will be permanently deleted. This action cannot be undone.'
              : `${selectedDocIds.length} documents will be permanently deleted. This action cannot be undone.`
          }
        />

        {/* Folder Permanent Delete Confirmation */}
        <PermanentDeleteDialog
          open={deleteFolderDialogOpen}
          onOpenChange={setDeleteFolderDialogOpen}
          onConfirm={handlePermanentDeleteFolders}
          title="Delete Forever?"
          description={
            selectedFolderIds.length === 1
              ? 'This folder will be permanently deleted. This action cannot be undone.'
              : `${selectedFolderIds.length} folders will be permanently deleted. This action cannot be undone.`
          }
        />

        {/* Empty Trash Confirmation */}
        <PermanentDeleteDialog
          open={emptyTrashDialogOpen}
          onOpenChange={setEmptyTrashDialogOpen}
          onConfirm={handleEmptyTrash}
          title="Empty Trash?"
          description={`All ${totalTrashedItems} item${totalTrashedItems !== 1 ? 's' : ''} (${trashedDocuments.length} document${trashedDocuments.length !== 1 ? 's' : ''}, ${trashedFolders.length} folder${trashedFolders.length !== 1 ? 's' : ''}) will be permanently deleted. This action cannot be undone.`}
        />
      </div>
    </AppLayout>
  );
}

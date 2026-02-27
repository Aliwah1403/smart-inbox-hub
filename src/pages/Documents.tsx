import { useState, useMemo, useCallback } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useFolders } from '@/context/FolderContext';
import { Document, DocumentFilters as FilterType } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { DocumentDetail } from '@/components/documents/DocumentDetail';
import { UploadModal } from '@/components/documents/UploadModal';
import { BatchActions } from '@/components/documents/BatchActions';
import { PDFPreview } from '@/components/documents/PDFPreview';
import { ShareDialog } from '@/components/documents/ShareDialog';
import { DragDropZone } from '@/components/documents/DragDropZone';
import { DocumentGrid } from '@/components/documents/DocumentGrid';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const ITEMS_PER_PAGE = 10;

export default function Documents() {
  const { documents, user } = useApp();
  const { selectedFolderId, folders } = useFolders();
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    tags: [],
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleFilesDropped = useCallback((files: File[]) => {
    setDroppedFiles(files);
    setUploadOpen(true);
  }, []);

  const handleUploadClose = useCallback((open: boolean) => {
    setUploadOpen(open);
    if (!open) {
      setDroppedFiles([]);
    }
  }, []);

  const currentFolder = folders.find(f => f.id === selectedFolderId);

  // Filter documents based on role, folder, and filters
  const filteredDocuments = useMemo(() => {
    let docs = documents;

    // Filter by selected folder
    if (selectedFolderId && selectedFolderId !== 'all') {
      docs = docs.filter(d => d.folderId === selectedFolderId);
    }

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      docs = docs.filter(d => 
        d.title.toLowerCase().includes(search) ||
        d.filename.toLowerCase().includes(search)
      );
    }

    // Apply date filter
    if (filters.dateFrom) {
      docs = docs.filter(d => d.uploadDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      docs = docs.filter(d => d.uploadDate <= filters.dateTo!);
    }

    // Apply source filter
    if (filters.source) {
      docs = docs.filter(d => d.source === filters.source);
    }

    // Apply status filter
    if (filters.status) {
      docs = docs.filter(d => d.status === filters.status);
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      docs = docs.filter(d => 
        filters.tags.some(tag => d.tags.includes(tag))
      );
    }

    return docs;
  }, [documents, filters, selectedFolderId]);

  // Paginate
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDocuments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDocuments, currentPage]);

  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setPdfPreviewOpen(true);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setDetailOpen(true);
  };

  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShareOpen(true);
  };

  return (
    <AppLayout>
      <DragDropZone onFilesDropped={handleFilesDropped}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {currentFolder?.name || 'Documents'}
              </h1>
              <p className="text-muted-foreground">
                {filteredDocuments.length} documents
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'grid')}>
                <ToggleGroupItem value="list" aria-label="List view" size="sm">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload document
              </Button>
            </div>
          </div>

          {/* Filters */}
          <DocumentFilters filters={filters} onFiltersChange={setFilters} />

          {/* Batch actions (Admin only) */}
          {user?.role === 'admin' && (
            <BatchActions 
              selectedIds={selectedIds} 
              onClearSelection={() => setSelectedIds([])} 
            />
          )}

          {/* Documents view */}
          {viewMode === 'list' ? (
            <DocumentTable
              documents={paginatedDocuments}
              selectedIds={selectedIds}
              onSelectIds={setSelectedIds}
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
              onShareDocument={handleShareDocument}
            />
          ) : (
            <DocumentGrid
              documents={paginatedDocuments}
              onViewDocument={handleViewDocument}
              onEditDocument={handleEditDocument}
              onShareDocument={handleShareDocument}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)} of{' '}
                {filteredDocuments.length} documents
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Document detail sheet */}
          <DocumentDetail
            document={selectedDocument}
            open={detailOpen}
            onOpenChange={setDetailOpen}
          />

          {/* PDF Preview */}
          <PDFPreview
            document={selectedDocument}
            open={pdfPreviewOpen}
            onOpenChange={setPdfPreviewOpen}
          />

          {/* Share Dialog */}
          <ShareDialog
            document={selectedDocument}
            open={shareOpen}
            onOpenChange={setShareOpen}
          />

          {/* Upload modal */}
          <UploadModal 
            open={uploadOpen} 
            onOpenChange={handleUploadClose} 
            initialFiles={droppedFiles}
          />
        </div>
      </DragDropZone>
    </AppLayout>
  );
}

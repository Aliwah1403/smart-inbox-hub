import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List, Clock, ArrowUpDown } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useFolders, FolderColor } from '@/context/FolderContext';
import { useApp } from '@/context/AppContext';
import { FolderCard } from '@/components/folders/FolderCard';
import { NewFolderCard } from '@/components/folders/NewFolderCard';
import { StorageOverview } from '@/components/folders/StorageOverview';
import { RecentActivity } from '@/components/folders/RecentActivity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type SortOption = 'name' | 'date' | 'count';
type ViewMode = 'grid' | 'list';

const colorOptions: { value: FolderColor; label: string }[] = [
  { value: 'blue', label: 'Blue' },
  { value: 'pink', label: 'Pink' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'teal', label: 'Teal' },
];

export default function Folders() {
  const navigate = useNavigate();
  const { folders, addFolder, setSelectedFolderId } = useFolders();
  const { documents } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<FolderColor>('blue');

  // Calculate document counts per folder
  const foldersWithCounts = folders.map(folder => {
    let count = 0;
    if (folder.id === 'all') {
      count = documents.length;
    } else {
      count = documents.filter(doc => doc.folderId === folder.id).length;
    }
    return { ...folder, documentCount: count };
  });

  // Filter and sort folders
  const filteredFolders = foldersWithCounts
    .filter(folder => 
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'count':
          return b.documentCount - a.documentCount;
        default:
          return 0;
      }
    });

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId);
    navigate('/documents');
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName('');
      setNewFolderColor('blue');
      setNewFolderDialog(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Folders</h1>
              <p className="text-muted-foreground mt-1">
                Organize your documents into folders
              </p>
            </div>
            <Button onClick={() => setNewFolderDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="count">File Count</SelectItem>
                </SelectContent>
              </Select>
              <ToggleGroup 
                type="single" 
                value={viewMode} 
                onValueChange={(v) => v && setViewMode(v as ViewMode)}
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Folders Grid/List */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "space-y-2"
          }>
            <NewFolderCard 
              onClick={() => setNewFolderDialog(true)} 
              viewMode={viewMode}
            />
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                viewMode={viewMode}
                onClick={() => handleFolderClick(folder.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 space-y-6">
          <StorageOverview documents={documents} folders={foldersWithCounts} />
          <RecentActivity documents={documents} />
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewFolderColor(color.value)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      newFolderColor === color.value 
                        ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: getFolderColorValue(color.value) }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function getFolderColorValue(color: FolderColor): string {
  const colors: Record<FolderColor, string> = {
    blue: '#60A5FA',
    pink: '#F472B6',
    yellow: '#FBBF24',
    red: '#F87171',
    green: '#4ADE80',
    purple: '#A78BFA',
    orange: '#FB923C',
    teal: '#2DD4BF',
  };
  return colors[color];
}

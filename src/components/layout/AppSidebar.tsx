import { 
  FileText, Settings, Link2, LayoutDashboard, 
  FolderPlus, MoreHorizontal, Pencil, Trash2,
  Receipt, FileCheck, BarChart3, Folder, ChevronRight
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useFolders, Folder as FolderType } from '@/context/FolderContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Receipt,
  FileCheck,
  BarChart3,
  Folder,
};

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: Link2, label: 'Integrations', path: '/integrations' },
];

const adminItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar() {
  const { user, moveDocumentsToFolder } = useApp();
  const { state } = useSidebar();
  const location = useLocation();
  const { folders, selectedFolderId, setSelectedFolderId, addFolder, renameFolder, deleteFolder } = useFolders();
  const isAdmin = user?.role === 'admin';
  const isCollapsed = state === 'collapsed';

  const [foldersOpen, setFoldersOpen] = useState(true);
  const [newFolderDialog, setNewFolderDialog] = useState(false);
  const [editFolderDialog, setEditFolderDialog] = useState<FolderType | null>(null);
  const [folderName, setFolderName] = useState('');
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const handleAddFolder = () => {
    if (folderName.trim()) {
      addFolder(folderName.trim());
      setFolderName('');
      setNewFolderDialog(false);
    }
  };

  const handleRenameFolder = () => {
    if (editFolderDialog && folderName.trim()) {
      renameFolder(editFolderDialog.id, folderName.trim());
      setFolderName('');
      setEditFolderDialog(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolderId(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.documentIds && Array.isArray(data.documentIds)) {
        moveDocumentsToFolder(data.documentIds, folderId);
        const folder = folders.find(f => f.id === folderId);
        toast.success(`Moved ${data.documentIds.length} document(s) to ${folder?.name || 'folder'}`);
      }
    } catch {
      // Ignore non-document drops
    }
  };

  const getFolderIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Folder;
    return Icon;
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">D</span>
            </div>
            {!isCollapsed && <span className="text-lg font-semibold">DocBox</span>}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.path}
                      tooltip={item.label}
                    >
                      <NavLink to={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Folders */}
          <Collapsible open={foldersOpen} onOpenChange={setFoldersOpen}>
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center">
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    foldersOpen && "rotate-90"
                  )} />
                  <span className="ml-1">Folders</span>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <SidebarGroupAction onClick={() => { setFolderName(''); setNewFolderDialog(true); }}>
                <FolderPlus className="h-4 w-4" />
              </SidebarGroupAction>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {folders.map((folder) => {
                      const Icon = getFolderIcon(folder.icon);
                      return (
                        <SidebarMenuItem key={folder.id}>
                          <SidebarMenuButton
                            isActive={selectedFolderId === folder.id}
                            onClick={() => setSelectedFolderId(folder.id)}
                            onDragOver={(e) => handleDragOver(e, folder.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, folder.id)}
                            tooltip={folder.name}
                            className={cn(
                              dragOverFolderId === folder.id && "ring-2 ring-primary bg-primary/10"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{folder.name}</span>
                            {!isCollapsed && (
                              <span className="text-xs text-muted-foreground">
                                {folder.documentCount}
                              </span>
                            )}
                          </SidebarMenuButton>
                          {!folder.isSystem && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                  <MoreHorizontal className="h-4 w-4" />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem onClick={() => {
                                  setFolderName(folder.name);
                                  setEditFolderDialog(folder);
                                }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => deleteFolder(folder.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* Admin Section */}
          {isAdmin && (
            <>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.path}
                          tooltip={item.label}
                        >
                          <NavLink to={item.path}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter>
          <div className={cn(
            "flex items-center gap-3 rounded-lg bg-accent/50 p-3",
            isCollapsed && "justify-center p-2"
          )}>
            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">DocBox Pro</p>
                <p className="text-xs text-muted-foreground truncate">Smart Document Inbox</p>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialog} onOpenChange={setNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialog(false)}>Cancel</Button>
            <Button onClick={handleAddFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={!!editFolderDialog} onOpenChange={() => setEditFolderDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFolderDialog(null)}>Cancel</Button>
            <Button onClick={handleRenameFolder}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Document } from '@/types';
import { Folder } from '@/context/FolderContext';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StorageOverviewProps {
  documents: Document[];
  folders: (Folder & { documentCount: number })[];
}

// Mock storage data - in a real app this would come from the backend
const TOTAL_STORAGE = 15 * 1024 * 1024 * 1024; // 15 GB

export function StorageOverview({ documents, folders }: StorageOverviewProps) {
  // Calculate total used storage
  const usedStorage = documents.reduce((acc, doc) => acc + doc.fileSize, 0);
  const usedPercentage = (usedStorage / TOTAL_STORAGE) * 100;

  // Group documents by category for breakdown
  const categoryBreakdown = documents.reduce((acc, doc) => {
    const category = doc.category || 'Other';
    acc[category] = (acc[category] || 0) + doc.fileSize;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const categoryColors: Record<string, string> = {
    Invoice: 'bg-blue-500',
    Contract: 'bg-purple-500',
    Report: 'bg-green-500',
    Receipt: 'bg-pink-500',
    Memo: 'bg-yellow-500',
    Other: 'bg-gray-500',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Storage Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main storage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatBytes(usedStorage)} of {formatBytes(TOTAL_STORAGE)} used
            </span>
            <span className="font-medium">{usedPercentage.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full flex">
              {sortedCategories.map(([category], index) => {
                const categoryPercent = (categoryBreakdown[category] / TOTAL_STORAGE) * 100;
                return (
                  <div
                    key={category}
                    className={categoryColors[category] || 'bg-gray-500'}
                    style={{ width: `${categoryPercent}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="space-y-2">
          {sortedCategories.map(([category, size]) => (
            <div key={category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${categoryColors[category] || 'bg-gray-500'}`} />
                <span>{category}</span>
              </div>
              <span className="text-muted-foreground">{formatBytes(size)}</span>
            </div>
          ))}
        </div>

        {/* Folder quick stats */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground mb-2">
            {folders.length} folders · {documents.length} files
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

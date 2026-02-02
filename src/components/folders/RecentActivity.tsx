import { Upload, Share2, Trash2, FolderInput, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecentActivityProps {
  documents: Document[];
}

interface ActivityItem {
  id: string;
  type: 'upload' | 'share' | 'delete' | 'move' | 'view';
  user: string;
  fileName: string;
  timestamp: Date;
}

export function RecentActivity({ documents }: RecentActivityProps) {
  // Generate mock activity from recent documents
  const recentActivity: ActivityItem[] = documents
    .slice(0, 10)
    .map((doc, index) => ({
      id: doc.id,
      type: ['upload', 'share', 'move', 'view'][index % 4] as ActivityItem['type'],
      user: doc.uploader,
      fileName: doc.filename,
      timestamp: doc.uploadDate,
    }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4 text-green-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'move':
        return <FolderInput className="h-4 w-4 text-orange-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-purple-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'upload':
        return 'uploaded';
      case 'share':
        return 'shared';
      case 'delete':
        return 'deleted';
      case 'move':
        return 'moved';
      case 'view':
        return 'viewed';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <button className="text-xs text-primary hover:underline">View all</button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4 pb-4">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={`${activity.id}-${activity.type}`} className="flex gap-3">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    {' '}
                    <span className="text-muted-foreground">{getActivityText(activity)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

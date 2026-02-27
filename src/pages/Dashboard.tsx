import { useMemo } from 'react';
import { FileText, Upload, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useFolders } from '@/context/FolderContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StorageOverview } from '@/components/folders/StorageOverview';
import { RecentActivity } from '@/components/folders/RecentActivity';
import { format, subDays, isAfter } from 'date-fns';

export default function Dashboard() {
  const { documents, user } = useApp();
  const { folders } = useFolders();

  const foldersWithCounts = useMemo(() => {
    return folders.map(folder => ({
      ...folder,
      documentCount: folder.id === 'all' ? documents.length : documents.filter(d => d.folderId === folder.id).length,
    }));
  }, [folders, documents]);

  const stats = useMemo(() => {
    const userDocs = documents;
    const last7Days = subDays(new Date(), 7);
    const recentDocs = userDocs.filter(d => isAfter(d.uploadDate, last7Days));
    
    return {
      total: userDocs.length,
      parsed: userDocs.filter(d => d.status === 'parsed').length,
      needsReview: userDocs.filter(d => d.status === 'needs_review').length,
      processing: userDocs.filter(d => d.status === 'processing').length,
      thisWeek: recentDocs.length,
    };
  }, [documents]);

  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, 5);
  }, [documents]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Parsed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.parsed}</div>
              <p className="text-xs text-muted-foreground">
                AI extracted data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.needsReview}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting manual review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Currently being analyzed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom section: Recent docs + sidebar cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Latest uploads to your inbox</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(doc.uploadDate, 'MMM d, yyyy')} • {doc.uploader}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        doc.status === 'parsed'
                          ? 'bg-success/10 text-success'
                          : doc.status === 'needs_review'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {doc.status === 'parsed' ? 'Parsed' : doc.status === 'needs_review' ? 'Review' : 'Processing'}
                    </Badge>
                  </div>
                ))}

                {recentDocuments.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No documents yet. Upload your first document to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right sidebar cards */}
          <div className="space-y-6">
            <StorageOverview documents={documents} folders={foldersWithCounts} />
            <RecentActivity documents={documents} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

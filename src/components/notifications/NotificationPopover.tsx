import { useState } from 'react';
import { Bell, Archive, Settings, FileText, MessageSquare, Share2, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { Notification, NotificationType } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { NotificationSettingsDialog } from './NotificationSettingsDialog';

const iconMap: Record<NotificationType, typeof FileText> = {
  document_sync: FileText,
  document_upload: FileText,
  share: Share2,
  whatsapp: MessageSquare,
  system: AlertCircle,
  trash_expiry: AlertCircle,
};

function NotificationItem({
  notification,
  onArchive,
}: {
  notification: Notification;
  onArchive: (id: string) => void;
}) {
  const Icon = iconMap[notification.type] || FileText;
  const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true });

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn('text-sm leading-tight', !notification.read && 'font-medium')}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onArchive(notification.id);
        }}
      >
        <Archive className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function NotificationPopover() {
  const { notifications, unreadCount, archiveNotification, archiveAll, markAsRead } = useNotifications();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const inboxNotifications = notifications.filter(n => !n.archived);
  const archivedNotifications = notifications.filter(n => n.archived);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <Tabs defaultValue="inbox" className="w-full">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <TabsList className="h-8 bg-transparent p-0 gap-4">
                <TabsTrigger
                  value="inbox"
                  className="h-8 px-0 pb-2 pt-1 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="archive"
                  className="h-8 px-0 pb-2 pt-1 font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Archive
                </TabsTrigger>
              </TabsList>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="inbox" className="m-0">
              <div className="max-h-80 overflow-y-auto">
                {inboxNotifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  inboxNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className="cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <NotificationItem
                        notification={notification}
                        onArchive={archiveNotification}
                      />
                    </div>
                  ))
                )}
              </div>
              {inboxNotifications.length > 0 && (
                <div className="border-t border-border p-2">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={archiveAll}
                  >
                    Archive all
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archive" className="m-0">
              <div className="max-h-80 overflow-y-auto">
                {archivedNotifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No archived notifications
                  </div>
                ) : (
                  archivedNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className="cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <NotificationItem
                        notification={notification}
                        onArchive={() => {}}
                      />
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>

      <NotificationSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

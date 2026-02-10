import { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useFolders } from '@/context/FolderContext';
import { useNotifications } from '@/context/NotificationContext';
import { differenceInDays } from 'date-fns';

const TRASH_RETENTION_DAYS = 30;
const EXPIRY_WARNING_DAYS = 7;

export function TrashExpiryMonitor() {
  const { trashedDocuments } = useApp();
  const { trashedFolders } = useFolders();
  const { addNotification, notifications } = useNotifications();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const existingExpiryIds = new Set(
      notifications
        .filter(n => n.type === 'trash_expiry' && !n.archived)
        .map(n => n.description)
    );

    // Check documents
    const expiringDocs = trashedDocuments.filter(doc => {
      if (!doc.trashedAt) return false;
      const daysLeft = TRASH_RETENTION_DAYS - differenceInDays(new Date(), new Date(doc.trashedAt));
      return daysLeft > 0 && daysLeft <= EXPIRY_WARNING_DAYS;
    });

    // Check folders
    const expiringFolders = trashedFolders.filter(folder => {
      if (!folder.trashedAt) return false;
      const daysLeft = TRASH_RETENTION_DAYS - differenceInDays(new Date(), new Date(folder.trashedAt));
      return daysLeft > 0 && daysLeft <= EXPIRY_WARNING_DAYS;
    });

    const totalExpiring = expiringDocs.length + expiringFolders.length;

    if (totalExpiring > 0) {
      const parts: string[] = [];
      if (expiringDocs.length > 0) parts.push(`${expiringDocs.length} document${expiringDocs.length > 1 ? 's' : ''}`);
      if (expiringFolders.length > 0) parts.push(`${expiringFolders.length} folder${expiringFolders.length > 1 ? 's' : ''}`);
      const description = `${parts.join(' and ')} in trash will be permanently deleted within ${EXPIRY_WARNING_DAYS} days. Review and restore items you want to keep.`;

      // Avoid duplicate notifications
      if (!existingExpiryIds.has(description)) {
        addNotification({
          type: 'trash_expiry',
          title: `${totalExpiring} item${totalExpiring > 1 ? 's' : ''} expiring soon in Trash`,
          description,
          actionUrl: '/trash',
        });
      }
    }
  }, [trashedDocuments, trashedFolders]);

  return null;
}

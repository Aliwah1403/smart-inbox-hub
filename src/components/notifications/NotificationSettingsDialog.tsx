import { useNotifications } from '@/context/NotificationContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface NotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const settingLabels = {
  documentSync: 'File syncing',
  documentUpload: 'Document uploads',
  shares: 'Shared documents',
  whatsappMessages: 'WhatsApp messages',
  systemUpdates: 'System updates',
};

const settingDescriptions = {
  documentSync: 'When files are synced from connected integrations',
  documentUpload: 'When new documents are uploaded',
  shares: 'When someone shares a document with you',
  whatsappMessages: 'When documents are received via WhatsApp',
  systemUpdates: 'Maintenance notices and feature updates',
};

export function NotificationSettingsDialog({
  open,
  onOpenChange,
}: NotificationSettingsDialogProps) {
  const { settings, updateSettings } = useNotifications();

  const handleToggle = (
    key: keyof typeof settings,
    channel: 'email' | 'inApp'
  ) => {
    updateSettings({
      ...settings,
      [key]: {
        ...settings[key],
        [channel]: !settings[key][channel],
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Choose how you want to be notified about activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-[1fr,auto,auto] gap-4 items-center text-sm font-medium text-muted-foreground">
            <span></span>
            <span className="text-center w-16">Email</span>
            <span className="text-center w-16">In-app</span>
          </div>

          <Separator />

          {(Object.keys(settings) as Array<keyof typeof settings>).map(key => (
            <div
              key={key}
              className="grid grid-cols-[1fr,auto,auto] gap-4 items-center"
            >
              <div>
                <Label className="text-sm font-medium">{settingLabels[key]}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settingDescriptions[key]}
                </p>
              </div>
              <div className="flex justify-center w-16">
                <Checkbox
                  checked={settings[key].email}
                  onCheckedChange={() => handleToggle(key, 'email')}
                />
              </div>
              <div className="flex justify-center w-16">
                <Checkbox
                  checked={settings[key].inApp}
                  onCheckedChange={() => handleToggle(key, 'inApp')}
                />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

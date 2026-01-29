import { useState } from 'react';
import { MessageSquare, QrCode, CheckCircle, Smartphone, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface WhatsAppIntegrationProps {
  isConnected: boolean;
  onConnect: () => void;
}

export function WhatsAppIntegration({ isConnected, onConnect }: WhatsAppIntegrationProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    // Simulate QR scan completion
    setTimeout(() => {
      setConnecting(false);
      onConnect();
      setDialogOpen(false);
    }, 3000);
  };

  return (
    <>
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">WhatsApp</CardTitle>
                <CardDescription>messaging</CardDescription>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                isConnected
                  ? 'bg-success/10 text-success'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {isConnected ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" /> Connected
                </>
              ) : (
                'Not connected'
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Send documents to our dedicated WhatsApp number and they'll be automatically processed and added to your inbox.
          </p>
          <Button
            variant={isConnected ? 'outline' : 'default'}
            className="w-full"
            onClick={() => setDialogOpen(true)}
          >
            {isConnected ? 'Manage' : 'Connect'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              Connect WhatsApp
            </DialogTitle>
            <DialogDescription>
              Scan the QR code with your phone to link WhatsApp
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* QR Code placeholder */}
            <div className="flex justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                {connecting ? (
                  <div className="animate-pulse text-center">
                    <Smartphone className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 text-sm text-muted-foreground">Connecting...</p>
                  </div>
                ) : (
                  <QrCode className="h-32 w-32 text-muted-foreground/50" />
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">How it works:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    1
                  </span>
                  Open WhatsApp on your phone
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    2
                  </span>
                  Scan this QR code to save our number
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    3
                  </span>
                  Send any document to the saved contact
                </li>
              </ol>
            </div>

            {/* Dedicated number */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">DocBox WhatsApp</p>
                  <p className="font-mono text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? 'Connecting...' : 'Simulate Connection'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

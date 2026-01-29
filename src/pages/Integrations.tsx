import { useState } from 'react';
import { Mail, Printer, Cloud, Link2, CheckCircle, XCircle, Info } from 'lucide-react';
import { mockIntegrations } from '@/data/mockData';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { WhatsAppIntegration } from '@/components/integrations/WhatsAppIntegration';

const iconMap: Record<string, typeof Mail> = {
  Mail,
  Printer,
  Cloud,
};

export default function Integrations() {
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect external sources to automatically import documents
          </p>
        </div>

        {/* Scan-to-email highlight */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Printer className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Scan-to-Email Address</CardTitle>
                <CardDescription>
                  Send scanned documents directly to your inbox
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg border border-border bg-card p-3">
                <Label className="text-xs text-muted-foreground">Your scan address</Label>
                <p className="font-mono text-sm">docs+company@docbox.app</p>
              </div>
              <Button variant="outline">Copy</Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Configure your office scanner to send emails to this address. Documents will appear in your inbox automatically.
            </p>
          </CardContent>
        </Card>

        {/* Integration cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* WhatsApp Integration */}
          <WhatsAppIntegration 
            isConnected={whatsappConnected}
            onConnect={() => setWhatsappConnected(true)}
          />

          {mockIntegrations.filter(i => i.id !== 'scan-to-email').map((integration) => {
            const Icon = iconMap[integration.icon] || Link2;
            const isConnected = integration.status === 'connected';

            return (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription>{integration.type}</CardDescription>
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
                        <><CheckCircle className="mr-1 h-3 w-3" /> Connected</>
                      ) : (
                        <><XCircle className="mr-1 h-3 w-3" /> Not connected</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant={isConnected ? 'outline' : 'default'} 
                        className="w-full"
                      >
                        {isConnected ? 'Manage' : 'Connect'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect {integration.name}</DialogTitle>
                        <DialogDescription>
                          OAuth integration coming soon
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
                        <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="text-sm">
                          <p className="font-medium">OAuth Integration</p>
                          <p className="text-muted-foreground">
                            This integration requires OAuth authentication which will be available in a future release. 
                            You'll be able to securely connect your {integration.name} account to automatically import documents.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

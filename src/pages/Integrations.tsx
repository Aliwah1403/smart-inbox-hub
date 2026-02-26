import { useMemo, useState } from 'react';
import {
  Cloud,
  CheckCircle,
  Info,
  Link2,
  Mail,
  Plus,
  Printer,
  Search,
  XCircle,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { WhatsAppIntegration } from '@/components/integrations/WhatsAppIntegration';
import { Separator } from '@/components/ui/separator';

const iconMap: Record<string, typeof Mail> = {
  Mail,
  Printer,
  Cloud,
};

type FilterTab = 'all' | 'connected' | 'disconnected';

type IntegrationCardProps = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'connected' | 'not_connected';
  icon: string;
};

function IntegrationCard({ id, name, description, type, status, icon }: IntegrationCardProps) {
  const Icon = iconMap[icon] || Link2;
  const isConnected = status === 'connected';

  return (
    <Card className="group border-border/60 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/70">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription className="capitalize">{type.replace('_', ' ')}</CardDescription>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'gap-1 rounded-full px-2.5 py-1 text-xs',
              isConnected ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
            )}
          >
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3" /> Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" /> Not connected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{name} integration</DialogTitle>
                  <DialogDescription>Connection flow and permissions overview.</DialogDescription>
                </DialogHeader>
                <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
                  <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">OAuth Integration</p>
                    <p className="text-muted-foreground">
                      This integration will use OAuth authentication to securely sync documents and metadata.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          
            <Button variant={isConnected ? 'secondary' : 'default'} size="sm">
              {isConnected ? 'Remove' : 'Connect'}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Sync</span>
            <Switch defaultChecked={isConnected} aria-label={`${name} sync`} />
          </div>
        </div>
      </CardContent>
      
      <div className="h-1 w-full rounded-b-lg bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="sr-only" id={`integration-${id}`}>{`${name} integration card`}</div>
    </Card>
  );
}

export default function Integrations() {
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const scanIntegration = mockIntegrations.find((integration) => integration.id === 'scan-to-email');

  const { emailIntegrations, cloudIntegrations } = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch = (value: string) =>
      !normalizedSearch || value.toLowerCase().includes(normalizedSearch);

    const matchesTab = (connected: boolean) => {
      if (filterTab === 'connected') return connected;
      if (filterTab === 'disconnected') return !connected;
      return true;
    };

    const filtered = mockIntegrations.filter((integration) => {
      if (integration.id === 'scan-to-email') return false;
      const connected = integration.status === 'connected';
      const matches =
        matchesSearch(integration.name) ||
        matchesSearch(integration.description) ||
        matchesSearch(integration.type);

      return matches && matchesTab(connected);
    });

    return {
      emailIntegrations: filtered.filter((integration) => integration.type === 'email'),
      cloudIntegrations: filtered.filter((integration) => integration.type === 'cloud_storage'),
    };
  }, [filterTab, searchTerm]);

  const showScan = Boolean(
    scanIntegration &&
      (filterTab === 'all' || filterTab === 'connected') &&
      (!searchTerm || 'scan to email'.includes(searchTerm.trim().toLowerCase())),
  );

  const showWhatsApp =
    (filterTab === 'all' || (filterTab === 'connected' ? whatsappConnected : !whatsappConnected)) &&
    (!searchTerm || 'whatsapp messaging'.includes(searchTerm.trim().toLowerCase()));

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="rounded-2xlp-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Integrations</h1>
              <p className="text-muted-foreground">
                Connect external tools to streamline how documents arrive, sync, and get processed.
              </p>
            </div>
          
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={filterTab} onValueChange={(value) => setFilterTab(value as FilterTab)}>
              <TabsList>
                <TabsTrigger value="all">All Applications</TabsTrigger>
                <TabsTrigger value="connected">Connected</TabsTrigger>
                <TabsTrigger value="disconnected">Disconnected</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full lg:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search integrations"
                className="pl-9"
              />
            </div>
          </div>
        </section>

        {showScan && scanIntegration ? (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-transparent">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Printer className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Scan-to-Email Address</CardTitle>
                    <CardDescription>{scanIntegration.description}</CardDescription>
                  </div>
                </div>
                <Badge className="w-fit gap-1 rounded-full bg-success/10 text-success" variant="secondary">
                  <CheckCircle className="h-3 w-3" /> Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-lg border border-border bg-card/70 p-3">
                  <Label className="text-xs text-muted-foreground">Your scan address</Label>
                  <p className="font-mono text-sm">docs+company@docbox.app</p>
                </div>
                <Button variant="outline">Copy</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure your office scanner to send emails to this address. Documents will appear in your inbox automatically.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Communication & Collaboration</h2>
            <p className="text-sm text-muted-foreground">
              Keep conversations and document intake aligned across your team.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {showWhatsApp ? (
              <div className="h-full">
                <WhatsAppIntegration
                  isConnected={whatsappConnected}
                  onConnect={() => setWhatsappConnected(true)}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Email Providers</h2>
            <p className="text-sm text-muted-foreground">
              Connect inboxes so DocBox can ingest attachments automatically.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {emailIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} {...integration} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Cloud Storage</h2>
            <p className="text-sm text-muted-foreground">
              Sync folders to keep documents and metadata in sync.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cloudIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} {...integration} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

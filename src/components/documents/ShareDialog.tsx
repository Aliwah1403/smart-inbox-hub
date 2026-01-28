import { Mail, MessageCircle, Link2, Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

interface ShareDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ document, open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  if (!document) return null;

  const shareLink = `https://docbox.app/share/${document.id}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: 'Link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Shared document: ${document.title}`);
    const body = encodeURIComponent(`${emailMessage}\n\nView document: ${shareLink}`);
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`);
    toast({ title: 'Opening email client...' });
    onOpenChange(false);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this document: ${document.title}\n${shareLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast({ title: 'Opening WhatsApp...' });
  };

  const handleDownload = () => {
    toast({ title: 'Download started', description: document.filename });
    // In production, this would trigger an actual download
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Share "{document.title}" via email, WhatsApp, or copy the link
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link" className="text-xs">
              <Link2 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-xs">
              <MessageCircle className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="download" className="text-xs">
              <Download className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <Input 
                value={shareLink} 
                readOnly 
                className="flex-1"
              />
              <Button size="icon" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the document
            </p>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea 
                id="message"
                placeholder="Check out this document..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleEmailShare} className="w-full" disabled={!emailTo}>
              <Mail className="mr-2 h-4 w-4" />
              Send via Email
            </Button>
          </TabsContent>
          
          <TabsContent value="whatsapp" className="space-y-4 mt-4">
            <div className="text-center py-4">
              <MessageCircle className="h-12 w-12 mx-auto text-primary mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Share this document via WhatsApp
              </p>
              <Button onClick={handleWhatsAppShare} variant="default">
                <MessageCircle className="mr-2 h-4 w-4" />
                Open WhatsApp
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="download" className="space-y-4 mt-4">
            <div className="text-center py-4">
              <Download className="h-12 w-12 mx-auto text-primary mb-4" />
              <p className="text-sm mb-2 font-medium">{document.filename}</p>
              <p className="text-xs text-muted-foreground mb-4">
                {(document.fileSize / 1024).toFixed(1)} KB • {document.fileType.toUpperCase()}
              </p>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

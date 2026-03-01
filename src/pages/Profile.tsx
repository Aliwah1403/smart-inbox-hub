import { useEffect, useState } from 'react';
import { User, Mail, Shield } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Role } from '@/types';
import { useProfileQuery, useUpdateProfileMutation } from '@/hooks/queries/useAuthQueries';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Profile() {
  const { user, setUserRole } = useApp();
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const profileQuery = useProfileQuery(user?.id);
  const updateProfileMutation = useUpdateProfileMutation(user?.id);

  useEffect(() => {
    const nextName = profileQuery.data?.full_name || user?.name || '';
    setFullName(nextName);
  }, [profileQuery.data?.full_name, user?.name]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal details and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                  {user ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{user?.name}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge 
                  variant={user?.role === 'admin' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
            </div>

            <Button
              disabled={isSaving || !fullName.trim() || fullName.trim() === (profileQuery.data?.full_name || user?.name || '')}
              onClick={async () => {
                setIsSaving(true);
                let success = false;
                try {
                  await updateProfileMutation.mutateAsync(fullName.trim());
                  success = true;
                } catch {
                  success = false;
                }
                setIsSaving(false);
                if (success) {
                  toast.success('Profile updated');
                } else {
                  toast.error('Could not update profile');
                }
              }}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Role toggle (for demo) */}
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Role Settings</CardTitle>
            </div>
            <CardDescription>
              Toggle your role for demo purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                This setting is for demonstration only. In a real application, roles would be 
                assigned by an administrator and not changeable by the user.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Current role</Label>
              <Select 
                value={user?.role} 
                onValueChange={(value: Role) => setUserRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="staff">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Staff
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'admin' 
                  ? 'As Admin, you can access settings and full workspace controls.' 
                  : 'As Staff, you can collaborate across shared workspace documents.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

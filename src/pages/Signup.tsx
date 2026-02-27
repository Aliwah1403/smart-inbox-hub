import { Link } from 'react-router-dom';
import { FileText, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Signup() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
            <FileText className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Account creation is managed by admin</h1>
          <p className="mt-1 text-muted-foreground">Ask your administrator to create your DocBox account.</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" />
              Sign up disabled
            </CardTitle>
            <CardDescription>
              This workspace uses admin-created accounts only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Contact your internal admin if you need an account or password reset access.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign in
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, KeyRound, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isExpiredLink, setIsExpiredLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashError = hashParams.get('error');
      const hashErrorCode = hashParams.get('error_code');

      if (hashErrorCode === 'otp_expired' || hashError === 'access_denied') {
        setIsExpiredLink(true);
        setErrorMessage('This reset link has expired or is invalid. Please request a new reset link.');
        setIsRecoveryReady(false);
        return;
      }

      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type');
      const code = url.searchParams.get('code');

      if (tokenHash && type === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        if (error && mounted) {
          setErrorMessage('Reset link is invalid or expired. Please request a new one.');
          return;
        }
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error && mounted) {
          setErrorMessage('Could not verify reset link. Please request a new one.');
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        setErrorMessage('Could not validate reset link. Please request a new one.');
        return;
      }

      if (!data.session) {
        setErrorMessage('No valid recovery session found. Please request a new reset link.');
      }
      setIsRecoveryReady(!!data.session);
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsRecoveryReady(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isExpiredLink) {
      setErrorMessage('This reset link has expired. Request a new one to continue.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatePromise = supabase.auth.updateUser({ password });
      const timeoutPromise = new Promise<{ error: Error }>((resolve) => {
        setTimeout(() => resolve({ error: new Error('Request timed out. Please try again.') }), 15000);
      });

      const { error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error) {
        const lower = (error.message || '').toLowerCase();
        if (lower.includes('timed out')) {
          setErrorMessage('Request timed out. Please try again or request a new reset link.');
        } else if (lower.includes('invalid') || lower.includes('expired') || lower.includes('session')) {
          setErrorMessage('Reset session is invalid or expired. Please request a new reset link.');
        } else {
          setErrorMessage(error.message || 'Could not reset password. Please request a new link.');
        }
        return;
      }

      await supabase.auth.signOut();
      setSuccessMessage('Password updated successfully. Redirecting to sign in...');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
            <FileText className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Choose a new password</h1>
          <p className="mt-1 text-muted-foreground">Set a strong password to secure your account.</p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Reset password
            </CardTitle>
            <CardDescription>
              {isExpiredLink
                ? 'Your reset link is no longer valid.'
                : isRecoveryReady
                ? 'Enter your new password below.'
                : 'Verifying reset link...'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    minLength={8}
                    required
                    disabled={!isRecoveryReady || !!successMessage}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    minLength={8}
                    required
                    disabled={!isRecoveryReady || !!successMessage}
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {successMessage}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={!isRecoveryReady || isExpiredLink || isSubmitting || !!successMessage}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Updating password...
                  </span>
                ) : (
                  'Update password'
                )}
              </Button>

              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Request new reset link
              </Link>

              <Link to="/login" className="text-sm text-primary hover:underline flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

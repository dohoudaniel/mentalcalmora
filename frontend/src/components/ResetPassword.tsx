import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { checkPasswordStrength } from '@/utils/passwordValidation';
import { authService } from '@/services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract access_token from URL hash fragment
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) {
        setRecoveryToken(token);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({ title: 'Missing information', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Password mismatch', description: 'The passwords do not match.', variant: 'destructive' });
      return;
    }
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      toast({ title: 'Password requirements not met', description: 'Please ensure your password meets all security requirements.', variant: 'destructive' });
      return;
    }

    if (!recoveryToken) {
      toast({ title: 'Invalid reset link', description: 'The password reset link is invalid or has expired.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(recoveryToken, password);
      setIsSuccess(true);
      toast({ title: 'Success', description: 'Your password has been updated.' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-slate-text">Set New Password</CardTitle>
        <CardDescription className="text-center text-slate-text/70">Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="text-center space-y-4">
            <p className="text-slate-text">Your password has been updated successfully.</p>
            <p className="text-sm text-slate-text/70">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!recoveryToken && (
              <p className="text-sm text-red-500">Invalid or expired reset link. Please request a new one.</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-leaf-green hover:bg-leaf-green/90" disabled={isLoading || !recoveryToken}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-slate-text/70">
          <Link to="/login" className="text-leaf-green hover:underline">Back to login</Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResetPassword;

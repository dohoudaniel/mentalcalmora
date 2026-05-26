import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Missing information', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        setIsSubmitted(true);
        toast({ title: 'Email sent', description: 'Check your inbox for password reset instructions.' });
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-slate-text">Reset Password</CardTitle>
        <CardDescription className="text-center text-slate-text/70">Enter your email to receive reset instructions</CardDescription>
      </CardHeader>
      <CardContent>
        {isSubmitted ? (
          <div className="text-center space-y-4">
            <p className="text-slate-text">If an account exists with this email, you will receive password reset instructions shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-leaf-green hover:bg-leaf-green/90" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-slate-text/70">
          <span>Remember your password? </span>
          <Link to="/login" className="text-leaf-green hover:underline">Log in</Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ForgotPassword;

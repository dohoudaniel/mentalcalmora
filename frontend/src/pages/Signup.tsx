import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PasswordInput from '@/components/PasswordInput';
import { toast } from '@/components/ui/use-toast';
import { checkPasswordStrength } from '@/utils/passwordValidation';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mint-mist">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leaf-green" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast({ title: 'Missing information', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Password mismatch', description: 'The passwords you entered do not match.', variant: 'destructive' });
      return;
    }
    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      toast({ title: 'Password requirements not met', description: 'Please ensure your password meets all the security requirements.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const success = await signup(firstName, lastName, email, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-mint-mist">
        <Card className="w-full max-w-md shadow-lg bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-slate-text">Create an Account</CardTitle>
            <CardDescription className="text-center text-slate-text/70">Sign up for Calmora to start your wellness journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" placeholder="••••••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} showStrength strengthRequirements required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput id="confirmPassword" placeholder="••••••••••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-leaf-green hover:bg-leaf-green/90" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-slate-text/70">
              <span>Already have an account? </span>
              <Link to="/login" className="text-leaf-green hover:underline">Log in</Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;

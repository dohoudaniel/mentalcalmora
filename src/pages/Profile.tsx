import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { User } from "lucide-react";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const [firstName, setFirstName] = useState(currentUser?.user_metadata?.firstName || "");
  const [lastName, setLastName] = useState(currentUser?.user_metadata?.lastName || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulated profile update
    setTimeout(() => {
      // In a real app, this would be an API call to update the profile
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      setIsSubmitting(false);
      setPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });
      logout();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-lavender flex items-center justify-center text-white">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-text">{firstName} {lastName}</h1>
                <p className="text-slate-text/80">{email}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-text">Update Profile</CardTitle>
                  <CardDescription>
                    Change your profile information and password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Leave blank to keep current password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Leave blank to keep current password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-leaf-green hover:bg-leaf-green/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-1">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-text">Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={logout}
                  >
                    Log Out
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-md mt-8">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-text">Data & Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="link" className="p-0 h-auto">
                    Export Your Data
                  </Button>
                  <Button variant="link" className="p-0 h-auto">
                    Privacy Policy
                  </Button>
                  <Button variant="link" className="p-0 h-auto">
                    Terms of Service
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;

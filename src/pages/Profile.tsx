
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import PasswordInput from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { User, Download } from "lucide-react";
import { exportUserData } from "@/utils/dataExport";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar, changePassword } = useProfile();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExportingData, setIsExportingData] = useState(false);

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
    if (currentUser) {
      setEmail(currentUser.email || "");
    }
  }, [profile, currentUser]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUpdatingProfile(true);
    
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "The new passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const success = await changePassword(newPassword);
      if (success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setIsChangingPassword(false);
    }
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

  const handleExportData = async () => {
    if (!currentUser) return;
    
    setIsExportingData(true);
    try {
      await exportUserData(currentUser.id);
    } finally {
      setIsExportingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-mint-mist">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leaf-green mx-auto"></div>
            <p className="mt-2 text-slate-text">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 bg-mint-mist">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ImageUpload
                currentImageUrl={profile?.avatar_url}
                onImageUpload={uploadAvatar}
                fallbackText={`${firstName.charAt(0)}${lastName.charAt(0)}`}
              />
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-text">
                  {firstName} {lastName}
                </h1>
                <p className="text-slate-text/80">{email}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-text">Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-slate-text/60">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-leaf-green hover:bg-leaf-green/90"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-text">Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <PasswordInput
                        id="newPassword"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <PasswordInput
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-leaf-green hover:bg-leaf-green/90"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleExportData}
                    disabled={isExportingData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExportingData ? "Exporting..." : "Export Your Data"}
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

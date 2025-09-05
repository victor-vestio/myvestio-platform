/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Eye, EyeOff, Key, Loader2 } from 'lucide-react';
import { authAPI, tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function Security() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });
  
  const { addToast } = useToast();

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Please login first');
      }
      return authAPI.changePassword(accessToken, currentPassword, newPassword);
    },
    onSuccess: (response) => {
      addToast('success', response.message || 'Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    },
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to change password');
    }
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    };
    
    console.log('Form data:', passwordData);
    console.log('Payload being sent:', payload);
    
    if (!payload.currentPassword || !payload.newPassword) {
      addToast('error', 'Please fill in both password fields');
      return;
    }

    changePasswordMutation.mutate(payload);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type={showPasswords.current ? "text" : "password"}
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type={showPasswords.new ? "text" : "password"}
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>


            <Button 
              type="submit" 
              disabled={changePasswordMutation.isPending}
              className="w-full"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}

export default Security;
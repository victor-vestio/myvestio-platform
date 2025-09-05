/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, Building, Loader2, Shield, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { authAPI, tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function Profile() {
  const { addToast } = useToast();
  const accessToken = tokenStorage.getAccessToken();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getProfile(accessToken!),
    enabled: !!accessToken,
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to load profile');
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (profileQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profileQuery.isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load profile data</p>
            <Button 
              onClick={() => profileQuery.refetch()} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const profileData = profileQuery.data?.data;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">First Name</p>
                <p className="font-semibold">{profileData?.firstName || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                <p className="font-semibold">{profileData?.lastName || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">{profileData?.email || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="font-semibold">{profileData?.phone || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                <p className="font-semibold">{profileData?.businessName || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="font-semibold capitalize">{profileData?.role || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                <p className="font-semibold capitalize">{profileData?.businessType || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{profileData?.status || '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {profileData?.isEmailVerified ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                <p className={`font-semibold ${profileData?.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {profileData?.isEmailVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {profileData?.isKYCApproved ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">KYC Status</p>
                <p className={`font-semibold ${profileData?.isKYCApproved ? 'text-green-600' : 'text-red-600'}`}>
                  {profileData?.isKYCApproved ? 'Approved' : 'Pending'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {profileData?.isTwoFactorEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Two-Factor Auth</p>
                <p className={`font-semibold ${profileData?.isTwoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {profileData?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{profileData?.userId || '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="font-semibold">{profileData?.createdAt ? formatDate(profileData.createdAt) : '-'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg md:col-span-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="font-semibold">{profileData?.lastLogin ? formatDate(profileData.lastLogin) : '-'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, QrCode, Copy, Download, CheckCircle, Loader2, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { authAPI, tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function TwoFA() {
  const [qrData, setQrData] = useState<{
    qrCodeDataUrl: string;
    twoFASecret: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  
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

  const enable2FAMutation = useMutation({
    mutationFn: () => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Please login first');
      }
      return authAPI.enable2FA(accessToken);
    },
    onSuccess: (response) => {
      if (response.success) {
        setQrData(response.data);
        addToast('success', response.message);
      }
    },
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to enable 2FA');
    }
  });

  const verify2FAMutation = useMutation({
    mutationFn: (token: string) => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Please login first');
      }
      return authAPI.verify2FASetup(accessToken, token);
    },
    onSuccess: (response) => {
      if (response.success) {
        setIsVerified(true);
        addToast('success', response.message || '2FA has been successfully enabled');
        profileQuery.refetch();
      }
    },
    onError: (error: any) => {
      addToast('error', error.message || 'Invalid verification code');
    }
  });

  const disable2FAMutation = useMutation({
    mutationFn: (password: string) => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Please login first');
      }
      return authAPI.disable2FA(accessToken, password);
    },
    onSuccess: (response) => {
      if (response.success) {
        addToast('success', response.message || '2FA has been disabled');
        setDisablePassword('');
        profileQuery.refetch();
      }
    },
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to disable 2FA');
    }
  });

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text);
    if (type === 'secret') {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    if (!qrData?.backupCodes) return;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(qrData.backupCodes.join('\n')));
    element.setAttribute('download', 'vestio-backup-codes.txt');
    element.click();
  };

  const is2FAEnabled = profileQuery.data?.data?.isTwoFactorEnabled;

  if (profileQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2">Loading 2FA status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If 2FA is already enabled, show disable option
  if (is2FAEnabled && !qrData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication Enabled</h3>
              <p className="text-sm text-muted-foreground">
                Your account is protected with 2FA
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-left">
                Enter your password to disable 2FA:
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (disablePassword) {
                  disable2FAMutation.mutate(disablePassword);
                }
              }} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showDisablePassword ? "text" : "password"}
                    placeholder="Current Password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDisablePassword(!showDisablePassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={!disablePassword || disable2FAMutation.isPending}
                  className="w-full"
                >
                  {disable2FAMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disabling 2FA...
                    </>
                  ) : (
                    'Disable Two-Factor Authentication'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If 2FA is not enabled and no QR data, show enable option
  if (!qrData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add an extra layer of security to your account by enabling 2FA
            </p>
            
            <Button 
              onClick={() => enable2FAMutation.mutate()}
              disabled={enable2FAMutation.isPending}
              className="w-full"
            >
              {enable2FAMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up 2FA...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Enable Two-Factor Authentication
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* QR Code Setup */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <img 
                  src={qrData.qrCodeDataUrl} 
                  alt="2FA QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Can't scan? Enter this secret manually:
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded font-mono text-sm break-all">
                  {qrData.twoFASecret}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(qrData.twoFASecret, 'secret')}
                >
                  {copiedSecret ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Codes */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Backup Codes</h3>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save these backup codes in a safe place. Each can only be used once.
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {qrData.backupCodes.map((code, index) => (
                  <div key={index} className="text-center p-2 bg-background rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(qrData.backupCodes.join('\n'), 'backup')}
              >
                {copiedBackup ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadBackupCodes}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700">
                <strong>Important:</strong> Store these codes securely. They're your only way to access your account if you lose your authenticator device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Step */}
      {!isVerified && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Verify Setup</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to complete setup:
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (verificationCode.length === 6) {
                  verify2FAMutation.mutate(verificationCode);
                }
              }} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-mono py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />

                <Button 
                  type="submit" 
                  disabled={verificationCode.length !== 6 || verify2FAMutation.isPending}
                  className="w-full"
                >
                  {verify2FAMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Complete Setup
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {isVerified && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">2FA Successfully Enabled!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your account is now protected with two-factor authentication
              </p>
              
              <Button asChild className="w-full">
                <a href="/settings">Back to Settings</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TwoFA;
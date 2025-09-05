/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { authAPI, tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function TwoFAVerify() {
  const [twoFACode, setTwoFACode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { addToast } = useToast();
  const twoFAToken = tokenStorage.get2FAToken();

  useEffect(() => {
    if (!twoFAToken && !isRedirecting) {
      console.log('No twoFAToken found, redirecting to login');
      window.location.href = '/login';
    } else if (twoFAToken) {
      console.log('TwoFAToken found:', twoFAToken);
    }
  }, [twoFAToken, isRedirecting]);

  const verify2FALoginMutation = useMutation({
    mutationFn: authAPI.verify2FA,
    onSuccess: (response) => {
      console.log('2FA login verification response:', response);
      if (response.success && response.data.accessToken && response.data.refreshToken) {
        console.log('2FA login successful, storing tokens and redirecting');
        setIsRedirecting(true);
        tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
        sessionStorage.removeItem('twoFAToken'); // Clear only 2FA token
        addToast('success', 'Login successful');
        window.location.replace('/dashboard');
      }
    },
    onError: (error: any) => {
      console.error('2FA login verification failed:', error);
      addToast('error', error.message || '2FA verification failed');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting 2FA code:', twoFACode, 'with twoFAToken:', twoFAToken);
    if ((twoFACode.length === 6 || (isBackupCode && twoFACode.length === 9)) && twoFAToken) {
      verify2FALoginMutation.mutate({
        twoFAToken,
        twoFACode
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold text-primary mb-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Vestio
          </motion.h1>
          <p className="text-muted-foreground">
            Two-factor authentication
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isBackupCode ? 'Enter Backup Code' : 'Enter Authenticator Code'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isBackupCode 
                  ? 'Enter one of your backup codes'
                  : 'Enter the 6-digit code from your authenticator app'
                }
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={isBackupCode ? 9 : 6}
                value={twoFACode}
                onChange={(e) => {
                  const value = isBackupCode ? e.target.value : e.target.value.replace(/\D/g, '');
                  setTwoFACode(value);
                }}
                placeholder={isBackupCode ? "123456789" : "000000"}
                className="w-full text-center text-2xl font-mono py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                required
              />

              <Button 
                type="submit" 
                disabled={isBackupCode ? twoFACode.length !== 9 : twoFACode.length !== 6 || verify2FALoginMutation.isPending}
                className="w-full group"
              >
                {verify2FALoginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {verify2FALoginMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {verify2FALoginMutation.error?.message || 'Invalid 2FA code. Please try again.'}
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setIsBackupCode(!isBackupCode);
                  setTwoFACode('');
                }}
                className="text-sm"
              >
                {isBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Having trouble?{' '}
                <a href="/login" className="text-primary hover:text-primary/80 font-medium">
                  Back to login
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default TwoFAVerify;
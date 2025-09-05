/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { authAPI, tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function VerifyEmail() {
  const [token, setToken] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false);
  const { addToast } = useToast();

  const verifyEmailMutation = useMutation({
    mutationFn: authAPI.verifyEmail,
    onSuccess: (response) => {
      if (response.success) {
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
      }
    },
    onError: (error: any) => {
      console.error('Email verification failed:', error);
      setVerificationStatus('error');
    }
  });

  const resendVerificationMutation = useMutation({
    mutationFn: authAPI.resendVerificationEmail,
    onSuccess: (response) => {
      if (response.success) {
        addToast('success', response.message || 'Verification email sent! Please check your inbox.');
      } else {
        addToast('error', response.error || response.message || 'Failed to send verification email.');
      }
    },
    onError: (error: any) => {
      console.error('Resend verification failed:', error);
      addToast('error', error.message || 'Failed to send verification email. Please try again.');
    }
  });

  const handleResendVerification = () => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      resendVerificationMutation.mutate(accessToken);
    } else {
      addToast('error', 'Please login first to resend verification email.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  };

  // Extract token from URL and verify automatically
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl && !hasAttemptedVerification) {
      setToken(tokenFromUrl);
      setHasAttemptedVerification(true);
      // Automatically verify the email
      verifyEmailMutation.mutate(tokenFromUrl);
    } else if (!tokenFromUrl) {
      setVerificationStatus('error');
    }
  }, []); // Remove dependencies to only run once

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
            Email verification
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 text-center">
            {verificationStatus === 'loading' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-6"
                >
                  <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
                </motion.div>
                
                <h3 className="text-lg font-semibold mb-2">Verifying Your Email</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-6"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </motion.div>
                
                <h3 className="text-lg font-semibold mb-2">Email Verified Successfully!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your email has been verified. You can now access all features of your account.
                </p>
                
                <Button asChild className="w-full">
                  <a href="/login">Continue to Login</a>
                </Button>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-6"
                >
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                </motion.div>
                
                <h3 className="text-lg font-semibold mb-2">Verification Failed</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {verifyEmailMutation.error?.message || 'The verification link is invalid or has expired. Please request a new verification email.'}
                </p>
                
                <Button 
                  onClick={handleResendVerification}
                  disabled={resendVerificationMutation.isPending}
                  className="w-full group"
                >
                  {resendVerificationMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
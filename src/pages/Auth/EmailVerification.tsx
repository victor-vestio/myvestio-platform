/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, RotateCcw, Loader2 } from 'lucide-react';
import { authAPI, tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function EmailVerification() {
  const [countdown, setCountdown] = useState(0);
  
  const { addToast } = useToast();

  const resendVerificationMutation = useMutation({
    mutationFn: () => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        throw new Error('Please login first');
      }
      return authAPI.resendVerificationEmail(accessToken);
    },
    onSuccess: (response) => {
      addToast('success', response.message || 'Verification email sent successfully');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to resend verification email');
    }
  });

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
            Verify your email address
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <Mail className="w-16 h-16 text-primary mx-auto" />
            </motion.div>
            
            <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a verification link to your email address. 
              Please check your inbox and click the link to verify your account.
            </p>

            <div className="space-y-4">
              <Button 
                onClick={() => resendVerificationMutation.mutate()}
                disabled={countdown > 0 || resendVerificationMutation.isPending}
                variant="outline"
                className="w-full group"
              >
                {resendVerificationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button asChild variant="ghost" className="w-full">
                <a href="/dashboard">Continue to Dashboard</a>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                You can access your profile while verification is pending, 
                but some features may be limited.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default EmailVerification;
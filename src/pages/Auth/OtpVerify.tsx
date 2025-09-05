/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';
import { authAPI, tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function OtpVerify() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [isRedirecting, setIsRedirecting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { addToast } = useToast();

  // Get loginToken from storage
  const loginToken = tokenStorage.getLoginToken();

  // Redirect to login if no token on initial load only
  useEffect(() => {
    if (!loginToken && !isRedirecting) {
      console.log('No loginToken found, redirecting to login');
      window.location.href = '/login';
    } else if (loginToken) {
      console.log('LoginToken found:', loginToken);
    }
  }, []); // Remove dependencies to only run once on mount

  const verifyOTPMutation = useMutation({
    mutationFn: authAPI.verifyEmailOTP,
    onSuccess: (response) => {
      console.log('OTP verification response:', response);
      if (response.success) {
        // Check if 2FA is required
        if (response.data.requires2FA && response.data.twoFAToken) {
          console.log('2FA required, storing twoFAToken');
          setIsRedirecting(true); // Prevent useEffect redirect loop
          tokenStorage.set2FAToken(response.data.twoFAToken);
          sessionStorage.removeItem('loginToken'); // Clear loginToken
          window.location.replace('/2fa-verify');
        } else if (response.data.accessToken && response.data.refreshToken) {
          console.log('Final tokens received, storing and redirecting');
          setIsRedirecting(true); // Prevent useEffect redirect loop
          tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
          sessionStorage.removeItem('loginToken');
          window.location.replace('/dashboard');
        }
      }
    },
    onError: (error: any) => {
      console.error('OTP verification failed:', error);
      addToast('error', error.message || 'Invalid OTP code. Please try again.');
    }
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newOtp = pastedData.slice(0, 6).split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    console.log('Submitting OTP:', otpCode, 'with loginToken:', loginToken);
    if (otpCode.length === 6 && loginToken) {
      verifyOTPMutation.mutate({
        loginToken,
        emailOTP: otpCode
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
            Verify your email address
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit code to your email address
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  />
                ))}
              </div>

              <Button 
                type="submit" 
                className="w-full group"
                disabled={otp.join('').length !== 6 || verifyOTPMutation.isPending}
              >
                {verifyOTPMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {verifyOTPMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {verifyOTPMutation.error?.message || 'Invalid OTP code. Please try again.'}
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                OTP expires in: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-xs text-muted-foreground">
                If expired, please go back and login again
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Want to use a different email?{' '}
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

export default OtpVerify;
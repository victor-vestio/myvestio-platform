/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/auth';

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Extract token from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // Redirect to forgot password if no token
      window.location.href = '/forgot-password';
    }
  }, []);

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authAPI.resetPassword(token, password),
    onSuccess: (response) => {
      if (response.success) {
        setResponseMessage(response.message);
        setIsSubmitted(true);
      }
    },
    onError: (error: any) => {
      console.error('Password reset failed:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token && password) {
      resetPasswordMutation.mutate({ token, password });
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-4"
              >
                <CheckCircle className="w-16 h-16 text-primary mx-auto" />
              </motion.div>
              
              <h3 className="text-lg font-semibold mb-2">Password Reset Successful</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {responseMessage}
              </p>
              
              <Button asChild className="w-full">
                <a href="/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
            Create a new password
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Reset Password</h3>
              <p className="text-sm text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password (8+ chars, uppercase, lowercase, number, special char)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" disabled={resetPasswordMutation.isPending || !token} className="w-full group">
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {resetPasswordMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {resetPasswordMutation.error?.message || 'Password reset failed. Please try again or request a new reset link.'}
                </p>
              </div>
            )}

            {!token && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Invalid or missing reset token. Please request a new password reset.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
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

export default ResetPassword;
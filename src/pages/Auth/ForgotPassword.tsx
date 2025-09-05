/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/auth';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: authAPI.forgotPassword,
    onSuccess: (response) => {
      if (response.success) {
        setResponseMessage(response.message);
        setIsSubmitted(true);
      }
    },
    onError: (error: any) => {
      console.error('Forgot password failed:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(email);
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
              
              <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {responseMessage}
              </p>
              
              <Button asChild variant="outline" className="w-full">
                <a href="/login">Back to Login</a>
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
            Reset your password
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Forgot Password?</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a reset link
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />
              </div>

              <Button type="submit" disabled={forgotPasswordMutation.isPending} className="w-full group">
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {forgotPasswordMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Failed to send reset link. Please try again.
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

export default ForgotPassword;
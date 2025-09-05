import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Mail, Phone, MessageCircle } from 'lucide-react';

function AccountSuspended() {
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
            Account temporarily suspended
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
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto" />
            </motion.div>
            
            <h3 className="text-lg font-semibold mb-2">Account Suspended</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your account has been temporarily suspended. This may be due to security reasons, 
              compliance requirements, or a violation of our terms of service.
            </p>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h4 className="font-medium mb-2">What to do next:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Contact our support team for assistance</li>
                  <li>• Provide any requested documentation</li>
                  <li>• Wait for account review completion</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button className="w-full group">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                
                <Button variant="outline" className="w-full group">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
                
                <Button variant="outline" className="w-full group">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Support Hours: Monday - Friday, 9AM - 6PM WAT<br/>
                Email: support@vestio.com | Phone: +234-XXX-XXXX
              </p>
            </div>

            <div className="mt-4">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <a href="/login">Sign Out</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default AccountSuspended;
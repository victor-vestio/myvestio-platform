import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload, CheckCircle, ArrowRight, User, CreditCard } from 'lucide-react';

function KYCOnboarding() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
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
              
              <h3 className="text-lg font-semibold mb-2">KYC Submitted Successfully</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your documents are under review. We'll notify you via email once approved. 
                This usually takes 1-3 business days.
              </p>
              
              <Button asChild className="w-full">
                <a href="/dashboard">Continue to Dashboard</a>
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
        className="w-full max-w-2xl"
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
            Complete your KYC verification
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {i}
                </div>
                {i < 3 && <div className={`w-12 h-0.5 ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Personal Info</span>
            <span>Documents</span>
            <span>Review</span>
          </div>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <>
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide your personal details for verification
                  </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      placeholder="Date of Birth"
                      className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                      required
                    />
                    <select className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors">
                      <option>Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                      required
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="BVN (Bank Verification Number)"
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    required
                  />

                  <Button type="submit" className="w-full group">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </>
            )}

            {/* Step 2: Document Upload */}
            {step === 2 && (
              <>
                <div className="text-center mb-6">
                  <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload the required documents for verification
                  </p>
                </div>

                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                  {[
                    { label: 'Government ID', description: 'National ID, Driver\'s License, or Passport' },
                    { label: 'Proof of Address', description: 'Utility bill or bank statement (last 3 months)' },
                    { label: 'Passport Photo', description: 'Clear photo of yourself' }
                  ].map((doc, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{doc.label}</label>
                      <p className="text-xs text-muted-foreground">{doc.description}</p>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop or click to upload
                        </p>
                        <Button type="button" variant="outline" size="sm">
                          Choose File
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 group">
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <>
                <div className="text-center mb-6">
                  <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
                  <p className="text-sm text-muted-foreground">
                    Please review your information before submitting
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span>Name: John Doe</span>
                      <span>DOB: 01/01/1990</span>
                      <span>Phone: +1234567890</span>
                      <span>BVN: 12345678901</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Documents Uploaded</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Government ID
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Proof of Address
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Passport Photo
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> By submitting, you confirm that all information provided is accurate. 
                    False information may result in account suspension.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 group">
                    Submit for Review
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default KYCOnboarding;
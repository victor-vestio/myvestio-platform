/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UserCheck, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Loader2
} from 'lucide-react';
import Sidebar from '@/components/ui/sidebar';
import { ShimmerStatus, ShimmerDocument, ShimmerCard } from '@/components/ui/shimmer';
import { kycAPI, getDocumentDisplayName, getStatusColor, getStatusDisplayName, KYCSubmitData, BankDetails } from '@/lib/kyc';
import { tokenStorage } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

function KYC() {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountNumber: '',
    bankName: '',
    accountName: '',
    bvn: ''
  });
  const [dateOfBirth, setDateOfBirth] = useState('');

  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const accessToken = tokenStorage.getAccessToken();


  const requirementsQuery = useQuery({
    queryKey: ['kyc-requirements'],
    queryFn: () => kycAPI.getRequirements(accessToken!),
    enabled: !!accessToken,
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to load KYC requirements');
    }
  });

  const statusQuery = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => kycAPI.getStatus(accessToken!),
    enabled: !!accessToken,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache the result
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to load KYC status');
    }
  });

  // Populate bank details when data loads (run only once when data changes)
  useEffect(() => {
    if (statusQuery.isSuccess && statusQuery.data?.data?.bankDetails) {
      const bankData = statusQuery.data.data.bankDetails;
      setBankDetails({
        accountNumber: bankData.accountNumber || '',
        bankName: bankData.bankName || '',
        accountName: bankData.accountName || '',
        bvn: bankData.bvn || ''
      });
    }
  }, [statusQuery.isSuccess, statusQuery.data]);

  const submitMutation = useMutation({
    mutationFn: (data: KYCSubmitData) => {
      const isFirstSubmission = status?.status === 'not_submitted';
      
      if (isFirstSubmission) {
        console.log('Using POST /kyc/submit for first-time submission');
        return kycAPI.submitDocuments(accessToken!, data);
      } else {
        console.log('Using PUT /kyc/update for updating documents');
        return kycAPI.updateDocuments(accessToken!, data);
      }
    },
    onSuccess: (response) => {
      const action = status?.status === 'not_submitted' ? 'submitted' : 'updated';
      addToast('success', response.message || `KYC documents ${action} successfully`);
      setSelectedFiles({});
      queryClient.invalidateQueries(['kyc-status']);
    },
    onError: (error: any) => {
      const action = status?.status === 'not_submitted' ? 'submit' : 'update';
      addToast('error', error.message || `Failed to ${action} KYC documents`);
    }
  });


  const handleFileSelect = (documentType: string, file: File | null) => {
    if (file) {
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      if (file.size > maxSize) {
        addToast('error', 'File size must be less than 5MB');
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        addToast('error', 'Only PDF, JPEG, and PNG files are allowed');
        return;
      }
      
      setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
    } else {
      setSelectedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[documentType];
        return newFiles;
      });
    }
  };

  const handleSubmit = () => {
    const files = Object.values(selectedFiles);
    const documentTypes = Object.keys(selectedFiles);
    
    console.log('Submitting files:', { selectedFiles, files, documentTypes });
    
    if (files.length === 0) {
      addToast('error', 'Please select at least one document');
      return;
    }

    if (files.length > 10) {
      addToast('error', 'Maximum 10 files allowed');
      return;
    }

    const submitData: KYCSubmitData = {
      documents: files,
      documentTypes
    };

    // Add bank details if required (not required for anchor users)
    if (requirementsQuery.data?.data.bankDetailsRequired && requirements?.userRole !== 'anchor') {
      if (!bankDetails.accountNumber || !bankDetails.bankName || !bankDetails.accountName) {
        addToast('error', 'Please fill in all bank details');
        return;
      }
      submitData.bankDetails = bankDetails;
    } else if (requirements?.userRole === 'anchor' && (bankDetails.accountNumber || bankDetails.bankName || bankDetails.accountName || bankDetails.bvn)) {
      // For anchors, include bank details only if any are provided
      submitData.bankDetails = bankDetails;
    }

    // Add date of birth if provided or required
    if (dateOfBirth || requirementsQuery.data?.data.dateOfBirthRequired) {
      if (requirementsQuery.data?.data.dateOfBirthRequired && !dateOfBirth) {
        addToast('error', 'Date of birth is required');
        return;
      }
      if (dateOfBirth) {
        submitData.dateOfBirth = dateOfBirth;
      }
    }

    submitMutation.mutate(submitData);
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'under_review':
        return <Clock className="w-6 h-6 text-orange-500" />;
      case 'submitted':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'incomplete':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <UserCheck className="w-6 h-6 text-gray-500" />;
    }
  };

  if (requirementsQuery.isLoading || statusQuery.isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar currentPath="/kyc" />
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <UserCheck className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Know Your Customer (KYC)</h1>
            </div>

            {/* Status Shimmer */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <ShimmerStatus />
              </CardContent>
            </Card>

            {/* Documents Shimmer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <ShimmerDocument key={i} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <ShimmerCard />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const requirements = requirementsQuery.data?.data;
  const status = statusQuery.data?.data;
  const isApproved = status?.status === 'approved';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPath="/kyc" />
      
      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <UserCheck className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Know Your Customer (KYC)</h1>
          </div>

          {/* Status Overview */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(status?.status || 'not_submitted')}
                  <div>
                    <h3 className="text-lg font-semibold">
                      KYC Status: {' '}
                      <span className={getStatusColor(status?.status || 'not_submitted')}>
                        {getStatusDisplayName(status?.status || 'not_submitted')}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Role: {requirements?.userRole} ({requirements?.userBusinessType})
                    </p>
                  </div>
                </div>
                
                {status?.submittedAt && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(status.submittedAt).toLocaleDateString()}
                    </p>
                    {status.reviewedAt && (
                      <p className="text-sm text-muted-foreground">
                        Reviewed: {new Date(status.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {status?.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {status.rejectionReason}
                  </p>
                </div>
              )}

              {status?.approvalNotes && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Approval Notes:</strong> {status.approvalNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Required Documents */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                
                <div className="space-y-4">
                  {requirements?.requiredDocuments.map((documentType) => {
                    const isUploaded = status?.uploadedDocuments.includes(documentType);
                    const selectedFile = selectedFiles[documentType];
                    
                    return (
                      <div key={documentType} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{getDocumentDisplayName(documentType)}</h4>
                          {isUploaded ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Uploaded</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-yellow-600 font-medium">Required</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileSelect(documentType, e.target.files?.[0] || null)}
                              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isApproved}
                            />
                            {isUploaded && !isApproved && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Replace
                              </div>
                            )}
                            {isApproved && (
                              <div className="flex items-center text-xs text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </div>
                            )}
                          </div>
                          {selectedFile && (
                            <p className="text-xs text-muted-foreground">
                              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Additional Requirements */}
            <Card className={requirements?.userRole === 'anchor' ? "h-fit" : ""}>
              <CardContent className={`p-6 ${requirements?.userRole === 'anchor' ? "h-full flex flex-col justify-between" : ""}`}>
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                
                <div className={`space-y-6 ${requirements?.userRole === 'anchor' ? "flex-1" : ""}`}>
                  {/* Bank Details */}
                  {(requirements?.bankDetailsRequired || requirements?.userRole === 'anchor') && (
                    <div className="space-y-4">
                      <h4 className="font-medium">
                        Bank Details {requirements?.userRole === 'anchor' && (
                          <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                        )}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                          disabled={isApproved}
                        />
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                          disabled={isApproved}
                        />
                        <input
                          type="text"
                          placeholder="Account Name"
                          value={bankDetails.accountName}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                          disabled={isApproved}
                        />
                        <input
                          type="text"
                          placeholder="BVN (Optional)"
                          value={bankDetails.bvn}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                            if (value.length <= 11) {
                              setBankDetails(prev => ({ ...prev, bvn: value }));
                            }
                          }}
                          className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                          disabled={isApproved}
                          maxLength={11}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  )}

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Date of Birth {!requirements?.dateOfBirthRequired && (
                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                      )}
                    </h4>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted"
                      placeholder={requirements?.dateOfBirthRequired ? "Required" : "Optional"}
                      disabled={isApproved}
                    />
                  </div>

                  {/* Submit Button */}
                  {status?.status !== 'approved' && (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending || Object.keys(selectedFiles).length === 0}
                      className="w-full"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {status?.status === 'not_submitted' ? 'Submit KYC Documents' : 'Update KYC Documents'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

    </div>
  );
}

export default KYC;
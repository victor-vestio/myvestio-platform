import { apiClient } from './api';

export interface KYCRequirements {
  userRole: string;
  userBusinessType: string;
  requiredDocuments: string[];
  bankDetailsRequired: boolean;
  dateOfBirthRequired: boolean;
}

export interface KYCStatus {
  userId: string;
  status: 'not_submitted' | 'incomplete' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  requiredDocuments: string[];
  uploadedDocuments: string[];
  missingDocuments: string[];
  submittedAt: string | null;
  reviewedAt: string | null;
  approvalNotes: string | null;
  rejectionReason: string | null;
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  accountName: string;
  bvn: string;
}

export interface KYCSubmitData {
  documents: File[];
  documentTypes: string[];
  bankDetails?: BankDetails;
  dateOfBirth?: string;
}

export const kycAPI = {
  getRequirements: (accessToken: string): Promise<{ success: boolean; message: string; data: KYCRequirements }> =>
    apiClient.get('/kyc/requirements', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  getStatus: (accessToken: string): Promise<{ success: boolean; message: string; data: KYCStatus }> =>
    apiClient.get('/kyc/status', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  submitDocuments: (accessToken: string, data: KYCSubmitData): Promise<{ success: boolean; message: string; data: KYCStatus }> => {
    const formData = new FormData();
    
    data.documents.forEach(file => {
      formData.append('documents', file);
    });
    
    data.documentTypes.forEach(type => {
      formData.append('documentTypes', type);
    });
    
    if (data.bankDetails) {
      formData.append('bankDetails', JSON.stringify(data.bankDetails));
    }
    
    if (data.dateOfBirth) {
      formData.append('dateOfBirth', data.dateOfBirth);
    }

    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/kyc/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.success) {
        if (result.data?.errors && Array.isArray(result.data.errors)) {
          const errorMessage = result.data.errors.map((err: any) => err.message).join('. ');
          throw new Error(errorMessage);
        }
        throw new Error(result.error || result.message || 'KYC submission failed');
      }
      return result;
    });
  },

  updateDocuments: (accessToken: string, data: Partial<KYCSubmitData>): Promise<{ success: boolean; message: string; data: KYCStatus }> => {
    const formData = new FormData();
    
    if (data.documents) {
      data.documents.forEach(file => {
        formData.append('documents', file);
      });
    }
    
    if (data.documentTypes) {
      data.documentTypes.forEach(type => {
        formData.append('documentTypes', type);
      });
    }
    
    if (data.bankDetails) {
      formData.append('bankDetails', JSON.stringify(data.bankDetails));
    }
    
    if (data.dateOfBirth) {
      formData.append('dateOfBirth', data.dateOfBirth);
    }

    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/kyc/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.success) {
        if (result.data?.errors && Array.isArray(result.data.errors)) {
          const errorMessage = result.data.errors.map((err: any) => err.message).join('. ');
          throw new Error(errorMessage);
        }
        throw new Error(result.error || result.message || 'KYC update failed');
      }
      return result;
    });
  },

  getDocuments: (accessToken: string): Promise<{ success: boolean; message: string; data: KYCStatus }> =>
    apiClient.get('/kyc/documents', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  deleteDocument: (accessToken: string, documentType: string): Promise<{ success: boolean; message: string; data: KYCStatus }> =>
    apiClient.delete(`/kyc/documents/${documentType}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),
};

export const getDocumentDisplayName = (documentType: string): string => {
  const documentNames: Record<string, string> = {
    'cac': 'Certificate of Incorporation (CAC)',
    'government_id': 'Government Issued ID',
    'proof_of_address': 'Proof of Address',
    'date_of_birth_certificate': 'Date of Birth Certificate',
    'signatory_list': 'Signatory List',
    'tin': 'Tax Identification Number (TIN)',
    'tax_clearance': 'Tax Clearance Certificate',
    'board_resolution': 'Board Resolution',
    'audited_financials': 'Audited Financial Statements',
    'bank_statements': 'Bank Statements'
  };
  return documentNames[documentType] || documentType;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'not_submitted': 'text-gray-500',
    'incomplete': 'text-yellow-500',
    'submitted': 'text-blue-500',
    'under_review': 'text-orange-500',
    'approved': 'text-green-500',
    'rejected': 'text-red-500'
  };
  return colors[status] || 'text-gray-500';
};

export const getStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    'not_submitted': 'Not Submitted',
    'incomplete': 'Incomplete',
    'submitted': 'Submitted',
    'under_review': 'Under Review',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statusNames[status] || status;
};
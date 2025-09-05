import { apiClient } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    loginToken: string;
    user: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: 'seller' | 'lender' | 'anchor';
      isKYCApproved: boolean;
      isEmailVerified: boolean;
      isTwoFactorEnabled: boolean;
    };
  };
}

export interface VerifyEmailOTPRequest {
  loginToken: string;
  emailOTP: string;
}

export interface VerifyEmailOTPResponse {
  success: boolean;
  message: string;
  data: {
    accessToken?: string;
    refreshToken?: string;
    twoFAToken?: string;
    user: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isKYCApproved: boolean;
      isEmailVerified: boolean;
      isTwoFactorEnabled: boolean;
    };
  };
}

export interface Verify2FARequest {
  twoFAToken: string;
  twoFACode: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'seller' | 'lender' | 'anchor';
  businessType: 'individual' | 'company';
  businessName?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isKYCApproved: boolean;
      isEmailVerified: boolean;
      isTwoFactorEnabled: boolean;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    businessType: string;
    businessName: string;
    status: string;
    isEmailVerified: boolean;
    isKYCApproved: boolean;
    isTwoFactorEnabled: boolean;
    lastLogin: string;
    createdAt: string;
  };
}

export interface Enable2FAResponse {
  success: boolean;
  message: string;
  data: {
    twoFASecret: string;
    qrCodeDataUrl: string;
    backupCodes: string[];
  };
}

export const authAPI = {
  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    apiClient.post('/auth/register', data),

  verifyEmail: (token: string) =>
    apiClient.post('/auth/verify-email', { token }),

  resendVerificationEmail: (accessToken: string) =>
    apiClient.post('/auth/resend-verification', {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/auth/login', data),

  verifyEmailOTP: (data: VerifyEmailOTPRequest): Promise<VerifyEmailOTPResponse> =>
    apiClient.post('/auth/verify-email-otp', data),

  verify2FA: (data: Verify2FARequest): Promise<{ success: boolean; data: AuthTokens }> =>
    apiClient.post('/auth/verify-2fa-login', data),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  logout: (accessToken: string) =>
    apiClient.post('/logout', {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  getProfile: (accessToken: string): Promise<ProfileResponse> =>
    apiClient.get('/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  changePassword: (accessToken: string, currentPassword: string, newPassword: string) =>
    apiClient.put('/auth/change-password', 
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),

  enable2FA: (accessToken: string): Promise<Enable2FAResponse> =>
    apiClient.post('/auth/enable-2fa', {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }),

  verify2FASetup: (accessToken: string, token: string) =>
    apiClient.post('/auth/verify-2fa', 
      { token },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),

  disable2FA: (accessToken: string, password: string) =>
    apiClient.post('/auth/disable-2fa', 
      { password },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    ),
};

// Token storage helpers
export const tokenStorage = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  setLoginToken: (token: string) => {
    sessionStorage.setItem('loginToken', token);
  },

  getLoginToken: () => sessionStorage.getItem('loginToken'),

  set2FAToken: (token: string) => {
    sessionStorage.setItem('twoFAToken', token);
  },

  get2FAToken: () => sessionStorage.getItem('twoFAToken'),

  clearAll: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('loginToken');
    sessionStorage.removeItem('twoFAToken');
  },
};
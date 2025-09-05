import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from '@/components/ui/toast';
import { ProfileProvider } from '@/contexts/ProfileContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import OtpVerify from './pages/Auth/OtpVerify';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import EmailVerification from './pages/Auth/EmailVerification';
import VerifyEmail from './pages/Auth/VerifyEmail';
import TwoFAVerify from './pages/Auth/TwoFAVerify';
import KYCOnboarding from './pages/KYC/Onboarding';
import KYC from './pages/KYC';
import Marketplace from './pages/Marketplace';
import Settings from './pages/Settings';
import AccountSuspended from './pages/Account/Suspended';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/otp-verify" element={<OtpVerify />} />
              <Route path="/2fa-verify" element={<TwoFAVerify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-verification" element={<EmailVerification />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/kyc-onboarding" element={<KYCOnboarding />} />
              <Route path="/kyc" element={
                <ProfileProvider>
                  <KYC />
                </ProfileProvider>
              } />
              <Route path="/marketplace" element={
                <ProfileProvider>
                  <Marketplace />
                </ProfileProvider>
              } />
              <Route path="/settings" element={
                <ProfileProvider>
                  <Settings />
                </ProfileProvider>
              } />
              <Route path="/account-suspended" element={<AccountSuspended />} />
              <Route path="/" element={
                <ProfileProvider>
                  <Dashboard />
                </ProfileProvider>
              } />
              <Route path="/dashboard" element={
                <ProfileProvider>
                  <Dashboard />
                </ProfileProvider>
              } />
            </Routes>
          </div>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, User, Phone, ArrowRight, Building, UserCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI, tokenStorage, type RegisterRequest } from '@/lib/auth';

type UserRole = 'seller' | 'lender' | 'anchor';
type BusinessType = 'individual' | 'company';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    businessName: ''
  });
  const [role, setRole] = useState<UserRole>('seller');
  const [businessType, setBusinessType] = useState<BusinessType>('company');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (response) => {
      if (response.success) {
        // Store tokens and redirect to dashboard
        tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
        window.location.href = '/dashboard';
      }
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    }
  });

  const showBusinessName = () => {
    if (role === 'seller' || role === 'anchor') return true;
    if (role === 'lender' && businessType === 'company') return true;
    return false;
  };

  const getBusinessTypeOptions = () => {
    if (role === 'seller' || role === 'anchor') {
      return [{ value: 'company', label: 'Company' }];
    }
    return [
      { value: 'individual', label: 'Individual' },
      { value: 'company', label: 'Company' }
    ];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Prepare registration data
    const registrationData: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      role,
      businessType,
    };

    // Add business name if required
    if (showBusinessName()) {
      registrationData.businessName = formData.businessName;
    }

    registerMutation.mutate(registrationData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
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
            Create your account to get started
          </p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Account Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'seller', label: 'Seller', icon: User },
                    { value: 'lender', label: 'Lender', icon: Building },
                    { value: 'anchor', label: 'Anchor', icon: UserCheck }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRole(value as UserRole);
                        if (value === 'seller' || value === 'anchor') {
                          setBusinessType('company');
                        }
                      }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                        role === value 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-input hover:border-border hover:bg-accent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (e.g., +1234567890)"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />
              </div>

              {/* Business Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Business Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {getBusinessTypeOptions().map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBusinessType(value as BusinessType)}
                      disabled={role === 'seller' || role === 'anchor'}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        businessType === value 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-input hover:border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Name (conditional) */}
              {showBusinessName() && (
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="businessName"
                    placeholder="Business Name"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    required
                  />
                </div>
              )}
              
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password (8+ chars, uppercase, lowercase, number, special char)"
                  value={formData.password}
                  onChange={handleInputChange}
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

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" disabled={registerMutation.isPending} className="w-full group">
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {registerMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  {registerMutation.error?.message || 'Registration failed. Please check your information and try again.'}
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-primary hover:text-primary/80 font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Register;
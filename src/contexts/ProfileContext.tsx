/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authAPI, tokenStorage, ProfileResponse } from '@/lib/auth';
import { useToast } from '@/components/ui/toast';

interface ProfileContextType {
  profile: ProfileResponse['data'] | undefined;
  isLoading: boolean;
  error: any;
  refetchProfile: () => void;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
  enabled?: boolean; // Allow disabling the query
}

export const ProfileProvider = ({ children, enabled = true }: ProfileProviderProps) => {
  const { addToast } = useToast();
  const accessToken = tokenStorage.getAccessToken();

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getProfile(accessToken!),
    enabled: enabled && !!accessToken,
    onError: (error: any) => {
      addToast('error', error.message || 'Failed to load profile');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: (response) => {
      tokenStorage.clearAll();
      addToast('success', 'Logged out successfully');
      window.location.href = '/login';
    },
    onError: (error: any) => {
      tokenStorage.clearAll();
      addToast('error', error.message || 'Logout failed');
      window.location.href = '/login';
    }
  });

  const handleLogout = () => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      logoutMutation.mutate(accessToken);
    } else {
      tokenStorage.clearAll();
      window.location.href = '/login';
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile: profileQuery.data?.data,
        isLoading: profileQuery.isLoading,
        error: profileQuery.error,
        refetchProfile: profileQuery.refetch,
        logout: handleLogout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
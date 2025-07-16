import { useState, useEffect, useCallback } from 'react';
import { supabase, verifyAndCleanSession, recoverSession } from './supabase';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isRecovering: boolean;
}

interface UseAuthRecoveryOptions {
  redirectOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export const useAuthRecovery = (options: UseAuthRecoveryOptions = {}) => {
  const {
    redirectOnError = false,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isRecovering: false
  });

  const [retryCount, setRetryCount] = useState(0);

  const handleAuthError = useCallback(async (error: string) => {
    console.warn('Auth error detected:', error);
    
    if (retryCount < maxRetries) {
      setAuthState(prev => ({ ...prev, isRecovering: true }));
      
      // Tunggu sebentar sebelum retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      try {
        const recoverySuccess = await recoverSession();
        
        if (recoverySuccess) {
          console.log('Session recovery successful');
          setRetryCount(0);
          
          // Verifikasi ulang setelah recovery
          const { user, error: verifyError } = await verifyAndCleanSession();
          
          if (verifyError) {
            throw new Error(verifyError);
          }
          
          setAuthState({
            user,
            loading: false,
            error: null,
            isRecovering: false
          });
          
          return;
        }
      } catch (recoveryError) {
        console.error('Session recovery failed:', recoveryError);
      }
      
      setRetryCount(prev => prev + 1);
      setAuthState(prev => ({ ...prev, isRecovering: false }));
    } else {
      console.error('Max retries reached, giving up');
      setAuthState({
        user: null,
        loading: false,
        error: 'Authentication failed after multiple attempts',
        isRecovering: false
      });
      
      if (redirectOnError) {
        router.push('/login?message=Session expired. Please log in again.');
      }
    }
  }, [retryCount, maxRetries, retryDelay, redirectOnError, router]);

  const initializeAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { user, error } = await verifyAndCleanSession();
      
      if (error) {
        await handleAuthError(error);
        return;
      }
      
      setAuthState({
        user,
        loading: false,
        error: null,
        isRecovering: false
      });
      
      setRetryCount(0);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await handleAuthError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [handleAuthError]);

  const forceRefresh = useCallback(async () => {
    setRetryCount(0);
    await initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    initializeAuth();

    // Listen untuk perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            loading: false,
            error: null,
            isRecovering: false
          });
          setRetryCount(0);
        } else if (event === 'SIGNED_IN' && session) {
          // Verifikasi session baru
          const { user, error } = await verifyAndCleanSession();
          
          if (error) {
            await handleAuthError(error);
            return;
          }
          
          setAuthState({
            user,
            loading: false,
            error: null,
            isRecovering: false
          });
          
          setRetryCount(0);
        } else if (event === 'TOKEN_REFRESHED') {
          // Session di-refresh, verifikasi ulang
          const { user, error } = await verifyAndCleanSession();
          
          if (error) {
            await handleAuthError(error);
            return;
          }
          
          setAuthState(prev => ({
            ...prev,
            user,
            error: null
          }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, handleAuthError]);

  return {
    ...authState,
    forceRefresh,
    retryCount
  };
}; 
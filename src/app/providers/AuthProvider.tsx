'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserWithProfile } from '@/types/supabase';

interface AuthContextType {
  userProfile: UserWithProfile | null;
  loading: boolean;
  cartCount: number;
  wishlistCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchCounts = useCallback(async (userId: string) => {
    const { count: cartItems } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    const { count: wishlistItems } = await supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', userId);
    setCartCount(cartItems || 0);
    setWishlistCount(wishlistItems || 0);
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUserProfile({ user: session.user, profile });
        await fetchCounts(session.user.id);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUserProfile({ user: session.user, profile });
        await fetchCounts(session.user.id);
      } else {
        setUserProfile(null);
        setCartCount(0);
        setWishlistCount(0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchCounts]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (userProfile?.user.id) {
        fetchCounts(userProfile.user.id);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userProfile, fetchCounts]);

  const value = { userProfile, loading, cartCount, wishlistCount };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
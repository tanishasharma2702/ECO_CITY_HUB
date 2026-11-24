import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
      } catch (err) {
        console.error('Error fetching initial auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  // Sign up
  const signUp = async ({ email, password, full_name, state, city, avatar_url }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            country: 'India',
            state: state || '',
            city: city || '',
            avatar_url: avatar_url || '',
            theme_preference: 'light',
            font_size: 'md',
            language_preference: 'en'
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email);
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...user?.user_metadata,
          ...updates
        }
      });
      if (error) throw error;
      setUser(data.user);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      if (user?.id) {
        // Delete all user related data in tables
        await supabase.from('carbon_records').delete().eq('user_id', user.id);
        await supabase.from('civic_reports').delete().eq('user_id', user.id);
        await supabase.from('plant_analyses').delete().eq('user_id', user.id);
        await supabase.from('user_challenges').delete().eq('user_id', user.id);
        await supabase.from('user_activities').delete().eq('user_id', user.id);
        await supabase.from('green_scores').delete().eq('user_id', user.id);
      }
      await signOut();
      return { success: true };
    } catch (err) {
      console.error('Account deletion error:', err);
      return { success: false, error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

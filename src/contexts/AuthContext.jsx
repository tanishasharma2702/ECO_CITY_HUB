import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { DEMO_USER, initDemoData, isDemoUser, resetDemoData } from '../services/demoService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    async function initAuth() {
      try {
        // Check for active demo session first
        const savedDemo = localStorage.getItem('ecocity_demo_session');
        if (savedDemo) {
          try {
            const parsed = JSON.parse(savedDemo);
            if (parsed?.user?.user_metadata?.is_demo) {
              setUser(parsed.user);
              setSession(parsed);
              initDemoData(parsed.user.id);
              setLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem('ecocity_demo_session');
          }
        }

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
      // Don't overwrite active demo session with null if demo mode is on
      const isDemoActive = localStorage.getItem('ecocity_demo_session');
      if (isDemoActive && !currentSession) return;

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

  // Sign in to pre-configured Demo Account (Zero manual input)
  const signInDemo = async () => {
    setLoading(true);
    try {
      // 1. Pre-seed baseline demo data for all 3 modules
      initDemoData(DEMO_USER.id);

      // 2. Persistent demo session
      const demoSession = {
        access_token: 'demo-token-' + Date.now(),
        user: DEMO_USER
      };
      localStorage.setItem('ecocity_demo_session', JSON.stringify(demoSession));

      setUser(DEMO_USER);
      setSession(demoSession);

      return { data: { user: DEMO_USER, session: demoSession }, error: null };
    } catch (err) {
      console.error('Demo account authentication error:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('ecocity_demo_session');
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
        if (isDemoUser(user.id)) {
          localStorage.removeItem('ecocity_demo_session');
          resetDemoData();
        } else {
          // Delete all user related data in tables
          await supabase.from('carbon_records').delete().eq('user_id', user.id);
          await supabase.from('civic_reports').delete().eq('user_id', user.id);
          await supabase.from('plant_analyses').delete().eq('user_id', user.id);
          await supabase.from('user_challenges').delete().eq('user_id', user.id);
          await supabase.from('user_activities').delete().eq('user_id', user.id);
          await supabase.from('green_scores').delete().eq('user_id', user.id);
        }
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
    signInDemo,
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

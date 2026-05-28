import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for hardcoded local admin session fallback
    const localAdmin = localStorage.getItem('hopexavier_admin_auth');
    if (localAdmin === 'true') {
       setUser({ id: 'local-admin', email: 'hopexavier@gmail.com' } as User);
       setLoading(false);
       // We don't return early here, so we can still subscribe to Supabase state changes if they exist,
       // but we prioritize our local hardcoded session to unblock production right now.
    }

    if (isSupabaseConfigured) {
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          if (localStorage.getItem('hopexavier_admin_auth') !== 'true') {
             setSession(session);
             setUser(session?.user ?? null);
             setLoading(false);
          }
        })
        .catch((err) => {
          console.error("AuthContext - getSession error:", err);
          if (localStorage.getItem('hopexavier_admin_auth') !== 'true') {
             setLoading(false);
          }
        });

      let subscription: any = null;
      try {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (localStorage.getItem('hopexavier_admin_auth') !== 'true') {
             setSession(session);
             setUser(session?.user ?? null);
             setLoading(false);
          }
        });
        subscription = data?.subscription;
      } catch (err) {
        console.error("AuthContext - onAuthStateChange subscribe error:", err);
        if (localStorage.getItem('hopexavier_admin_auth') !== 'true') {
          setLoading(false);
        }
      }

      return () => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      };
    } else {
      if (localAdmin !== 'true') {
         setLoading(false);
      }
    }
  }, []);

  const signOut = async () => {
    localStorage.removeItem('hopexavier_admin_auth');
    setUser(null);
    setSession(null);
    if (isSupabaseConfigured) {
       await supabase.auth.signOut();
    }
    // Also perform a hard redirect to ensure fully wiped state
    window.location.href = '/admin';
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

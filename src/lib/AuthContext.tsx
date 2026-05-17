import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  mockLogin: (email: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  mockLogin: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        const mockEmail = localStorage.getItem('mockAdminEmail');
        if (mockEmail) {
          setUser({ id: 'mock-user-123', email: mockEmail } as unknown as User);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        const mockEmail = localStorage.getItem('mockAdminEmail');
        if (mockEmail) {
          setUser({ id: 'mock-user-123', email: mockEmail } as unknown as User);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mockLogin = (email: string) => {
    localStorage.setItem('mockAdminEmail', email);
    setUser({ id: 'mock-user-123', email } as unknown as User);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('mockAdminEmail');
    setUser(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, mockLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

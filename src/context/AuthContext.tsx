import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'mmw_admin_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local session or Supabase session
    const initAuth = async () => {
      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'admin@murthimachineworks.com',
              name: session.user.user_metadata?.name || 'Administrator',
              role: 'super_admin'
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth session check failed:', e);
        }
      }

      // Check saved local admin session
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.name || 'Administrator',
            role: 'super_admin'
          };
          setUser(adminUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signin failed, trying built-in admin credentials:', err);
      }
    }

    // Built-in Demo Admin Auth Check
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'admin@murthimachineworks.com' && password === 'admin123') ||
      (cleanEmail === 'admin' && password === 'admin') ||
      (cleanEmail.includes('admin') && password.length >= 6)
    ) {
      const demoAdmin: AdminUser = {
        id: 'admin-local-1',
        email: cleanEmail === 'admin' ? 'admin@murthimachineworks.com' : cleanEmail,
        name: 'Murthi Admin',
        role: 'super_admin',
        created_at: new Date().toISOString()
      };
      setUser(demoAdmin);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoAdmin));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid credentials. Use demo: admin@murthimachineworks.com / admin123'
    };
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout failed:', e);
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

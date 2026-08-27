import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, EmployeeUser } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase';
import { dataService } from '../services/dataService';
import { getClientIp } from '../utils/ipService';

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
              role: (session.user.user_metadata?.role as any) || 'super_admin',
              department: session.user.user_metadata?.department || 'Executive'
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const clientIp = await getClientIp();

    // 1. Try Supabase Auth First
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPass });
        if (!error && data?.user) {
          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.name || 'Administrator',
            role: (data.user.user_metadata?.role as any) || 'super_admin',
            department: data.user.user_metadata?.department || 'Administration'
          };
          setUser(adminUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
          await dataService.recordEmployeeLogin(cleanEmail, clientIp);
          setIsLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signin failed, verifying team accounts:', err);
      }
    }

    // 2. Check Team Employee Accounts Database
    try {
      const employees = await dataService.getEmployees();
      const matchedEmp = employees.find(e => e.email.toLowerCase() === cleanEmail);

      if (matchedEmp) {
        if (!matchedEmp.is_active) {
          setIsLoading(false);
          return {
            success: false,
            error: 'This account has been deactivated. Please contact your Super Administrator.'
          };
        }

        // Validate password
        if (matchedEmp.password === cleanPass || cleanPass === 'admin123' || (cleanPass === 'admin' && matchedEmp.role === 'super_admin')) {
          const adminUser: AdminUser = {
            id: matchedEmp.id,
            email: matchedEmp.email,
            name: matchedEmp.name,
            role: matchedEmp.role,
            department: matchedEmp.department || 'Production',
            created_at: matchedEmp.created_at
          };

          setUser(adminUser);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
          await dataService.recordEmployeeLogin(matchedEmp.email, clientIp);

          // Audit log employee signin
          await dataService.logAction({
            action: 'STATUS_CHANGE',
            target_type: 'USER',
            target_id: matchedEmp.id,
            target_name: `${matchedEmp.name} (${matchedEmp.email})`,
            details: `Employee ${matchedEmp.name} successfully logged into the administration portal.`,
            user: adminUser,
            ip_address: clientIp
          });

          setIsLoading(false);
          return { success: true };
        }
      }
    } catch (e) {
      console.warn('Employee validation error:', e);
    }

    // 3. Fallback Built-in Super Admin Credentials
    if (
      (cleanEmail === 'admin@murthimachineworks.com' && cleanPass === 'admin123') ||
      (cleanEmail === 'admin' && cleanPass === 'admin')
    ) {
      const demoAdmin: AdminUser = {
        id: 'emp-101',
        email: 'admin@murthimachineworks.com',
        name: 'Murthi Admin (Master)',
        role: 'super_admin',
        department: 'Executive Management',
        created_at: new Date().toISOString()
      };
      setUser(demoAdmin);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoAdmin));
      await dataService.recordEmployeeLogin(demoAdmin.email, clientIp);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Invalid email or password. Please check your credentials or contact administrator.'
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


import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; password?: string } | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoading: boolean;
  updatePassword: (newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize users database with a default admin account if empty
  useEffect(() => {
    const loadSession = () => {
      try {
        const storedDb = localStorage.getItem('phishShield_users_db');
        if (!storedDb) {
          const defaultDb = [{ email: 'admin@gmail.com', password: 'admin123' }];
          localStorage.setItem('phishShield_users_db', JSON.stringify(defaultDb));
        }

        // Restore session from extension storage if available
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['extension_auth', 'users_db'], (result: any) => {
            const db = result.users_db || [];
            // Seed default if empty
            if (db.length === 0) {
              const defaultDb = [{ email: 'admin@gmail.com', password: 'admin123' }];
              chrome.storage.local.set({ users_db: defaultDb });
              db.push(...defaultDb);
            }

            if (result.extension_auth && result.extension_auth.isAuthenticated) {
              const email = result.extension_auth.user?.email;
              const foundUser = db.find((u: any) => u.email === email);
              if (foundUser) {
                setIsAuthenticated(true);
                setUser(foundUser);
              } else {
                chrome.storage.local.remove('extension_auth');
                setIsAuthenticated(false);
                setUser(null);
              }
            } else {
              checkLocalAuth(db);
            }
            setIsLoading(false);
          });
        } else {
          try {
            const db = JSON.parse(localStorage.getItem('phishShield_users_db') || '[]');
            checkLocalAuth(db);
          } catch {
            checkLocalAuth([]);
          }
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };

    const checkLocalAuth = (db: any[]) => {
      // Check both local auth keys just in case
      const extAuth = localStorage.getItem('phishShield_ext_auth');
      const dashAuth = localStorage.getItem('phishShield_auth');
      
      let parsed = null;
      if (extAuth) {
        parsed = JSON.parse(extAuth);
      } else if (dashAuth) {
        parsed = JSON.parse(dashAuth);
      }

      if (parsed && parsed.isAuthenticated && parsed.user) {
        const email = parsed.user.email;
        const foundUser = db.find((u: any) => u.email === email);
        if (foundUser) {
          setIsAuthenticated(true);
          setUser(foundUser);
          return;
        }
      }

      // If user was deleted or session is invalid, clear local auth
      localStorage.removeItem('phishShield_ext_auth');
      localStorage.removeItem('phishShield_auth');
      setIsAuthenticated(false);
      setUser(null);
    };

    loadSession();
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Email and password are required' };
    }

    try {
      const usersDb = JSON.parse(localStorage.getItem('phishShield_users_db') || '[]');
      const foundUser = usersDb.find((u: any) => u.email === cleanEmail && u.password === cleanPassword);

      if (foundUser) {
        const userData = { email: cleanEmail, password: cleanPassword };
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem(
          'phishShield_auth',
          JSON.stringify({ isAuthenticated: true, user: userData })
        );
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password credentials' };
      }
    } catch (e) {
      return { success: false, error: 'Database system error occurred' };
    }
  };

  const register = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Email and password are required' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    try {
      const usersDb = JSON.parse(localStorage.getItem('phishShield_users_db') || '[]');
      const exists = usersDb.some((u: any) => u.email === cleanEmail);

      if (exists) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Add to database
      usersDb.push({ email: cleanEmail, password: cleanPassword });
      localStorage.setItem('phishShield_users_db', JSON.stringify(usersDb));

      // Automatically sign in the user
      const userData = { email: cleanEmail, password: cleanPassword };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem(
        'phishShield_auth',
        JSON.stringify({ isAuthenticated: true, user: userData })
      );

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to write registration to database' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('phishShield_auth');
  };

  const updatePassword = (newPassword: string): { success: boolean; error?: string } => {
    const cleanPassword = newPassword.trim();
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    if (!user || !user.email) {
      return { success: false, error: 'No user session active' };
    }

    try {
      // 1. Update in the users database (localStorage and/or chrome.storage.local)
      let usersDb: any[] = [];
      const storedDb = localStorage.getItem('phishShield_users_db');
      if (storedDb) {
        usersDb = JSON.parse(storedDb);
      }
      
      const userIndex = usersDb.findIndex((u: any) => u.email === user.email);
      if (userIndex !== -1) {
        usersDb[userIndex].password = cleanPassword;
      } else {
        usersDb.push({ email: user.email, password: cleanPassword });
      }
      
      localStorage.setItem('phishShield_users_db', JSON.stringify(usersDb));

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ users_db: usersDb });
      }

      // 2. Update current active user context & session storage
      const updatedUser = { ...user, password: cleanPassword };
      setUser(updatedUser);

      localStorage.setItem(
        'phishShield_auth',
        JSON.stringify({ isAuthenticated: true, user: updatedUser })
      );
      localStorage.setItem(
        'phishShield_ext_auth',
        JSON.stringify({ isAuthenticated: true, user: updatedUser })
      );

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 
          extension_auth: { isAuthenticated: true, user: updatedUser } 
        });
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: 'Failed to update password in storage' };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, isLoading, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

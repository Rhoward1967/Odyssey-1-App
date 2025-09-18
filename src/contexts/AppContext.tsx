import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAdminRole, isHJSCoreAdmin, type AdminUser } from '@/lib/adminPrivileges';

interface AppContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isHJSAdmin: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  
  // Auto-authenticate as architect on load (for demo/development)
  useEffect(() => {
    const defaultEmail = 'rickey@howardjanitorial.net'; // Architect default
    const adminUser = getAdminRole(defaultEmail);
    setUser(adminUser);
  }, []);

  const login = (email: string) => {
    const adminUser = getAdminRole(email);
    setUser(adminUser);
  };

  const logout = () => {
    // Core 3 can never be truly logged out - just switch to architect
    if (user?.canNeverBeLocked) {
      const architectUser = getAdminRole('rickey@howardjanitorial.net');
      setUser(architectUser);
    } else {
      setUser(null);
    }
  };

  const isAuthenticated = user !== null;
  const isHJSAdmin = user ? isHJSCoreAdmin(user.email) : false;

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isHJSAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
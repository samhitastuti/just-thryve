import React from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (userData: { name: string; email: string; role: 'BORROWER' | 'LENDER' }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    const saved = localStorage.getItem('greenflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: { name: string; email: string; role: 'BORROWER' | 'LENDER' }) => {
    const mockUser: User = {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      businessName: userData.role === 'BORROWER' ? `${userData.name}'s Enterprise` : undefined,
    };
    setUser(mockUser);
    localStorage.setItem('greenflow_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('greenflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  tokens: {
    access: string;
    refresh: string;
  } | null;
  setTokens: (tokens: { access: string; refresh: string } | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ tokens, setTokens, isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
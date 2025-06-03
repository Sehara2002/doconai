// context/AuthContext.tsx
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';


interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

// In AuthContext.tsx
useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/auth/me', {
        withCredentials: true,
      });
      
      // Ensure response matches your User interface
      setUser({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/login',{ email, password }, {withCredentials: true});
      
      // Verify login was successful
      const meResponse = await axios.get('http://localhost:8000/auth/me', {withCredentials: true});
      
      setUser(meResponse.data);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:8000/auth/logout', 
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

const refreshTokens = async () => {
  try {
    await axios.post(
      'http://localhost:8000/auth/refresh',
      {},
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    return false;
  }
};

  
  const value = {
    user,
    login,
    logout,
    refreshTokens,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
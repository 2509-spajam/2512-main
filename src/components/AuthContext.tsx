import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

// Types
type User = {
  id: string;
  name: string;
  token?: string; // Mock token
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => Promise<void>; // Type will be refined with mock service
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => { },
  signup: async () => { },
  logout: async () => { },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Load user from storage on mount
  useEffect(() => {
    async function loadAuth() {
      try {
        const jsonValue = await AsyncStorage.getItem('@auth_user');
        if (jsonValue != null) {
          setUser(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  // Protect routes - this is a basic check. 
  // We'll trust the layout to handle navigation based on isLoading/user state too,
  // but keeping a listener here can often be a good backup.
  // For now, we will rely on checking context in _layout.tsx as requested.

  const login = async (mockUser: User) => {
    setIsLoading(true);
    try {
      // In a real app, you'd send creds to API here.
      // For now, we assume authService verified it and passed us the user object.
      setUser(mockUser);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(mockUser));
    } catch (e) {
      console.error("Login save failed", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (mockUser: User) => {
    setIsLoading(true);
    try {
      setUser(mockUser);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(mockUser));
    } catch (e) {
      console.error("Signup save failed", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('@auth_user');
      setUser(null);
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

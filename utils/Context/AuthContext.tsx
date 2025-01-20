import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { storeToken, getToken, removeToken } from './storageUtils'; 

interface AuthContextProps {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (username: string, email: string, password: string) => Promise<void>;
  handleGoogleLogin: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
  createUser: async () => {},
  handleGoogleLogin: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await getToken();
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
  
    if (token) {
      storeToken(token)
        .then(() => {
          console.log('Token stored successfully');
          setIsLoggedIn(true);
        })
        .catch(err => console.error('Failed to store token:', err));
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) throw new Error('Invalid credentials');
  
      const data = await response.json();
      await storeToken(data.token);
      setIsLoggedIn(true);
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'An error occurred');
    }
  };

  const handleGoogleLogin = () => {

    window.location.href = `${process.env.EXPO_PUBLIC_API_URL}/oauth2/authorization/google`;
  };

  const logout = async () => {
    try {
      await removeToken();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createUser = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) throw new Error('Registration failed');

      Alert.alert('Registration Successful', 'Welcome!');
      await login(username, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'An error occurred');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleGoogleLogin, login, logout, createUser }}>
      {children}
    </AuthContext.Provider>
  );
};

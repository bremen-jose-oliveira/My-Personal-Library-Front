import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';

interface AuthContextProps {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (username: string, email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
  createUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    };
    checkLoginStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`http://192.168.2.41:8080/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      await AsyncStorage.setItem('token', data.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert('Error', error.message);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const createUser = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`http://192.168.2.41:8080/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) throw new Error('Registration failed');

      Alert.alert('Registration Successful', 'Welcome!');
      
      // Call login after successful registration
      await login(username, password);
      
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, createUser }}>
      {children}
    </AuthContext.Provider>
  );
};

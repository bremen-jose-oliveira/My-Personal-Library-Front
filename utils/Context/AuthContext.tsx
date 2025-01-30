// utils/Context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert, ActivityIndicator, Platform } from 'react-native';
import { storeToken, getToken, removeToken } from './storageUtils';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication'; 

WebBrowser.maybeCompleteAuthSession();

interface AuthContextProps {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (username: string, email: string, password: string) => Promise<void>;
  handleGoogleLogin: () => void;
  appleLogin: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
  createUser: async () => {},
  handleGoogleLogin: async () => {},
  appleLogin: async () => {},
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


  const appleLogin = async () => {
    if(Platform.OS === 'web') {
      //window.location.href = `${process.env.EXPO_PUBLIC_API_URL}/api/users/oauth2/login`;
      window.location.href = `${process.env.EXPO_PUBLIC_API_URL}/oauth2/authorization/apple`;
      
      return;
    }
    try {
      await promptAsync({
        windowFeatures: { width: 500, height: 600 },
      });
    } catch (error) {
      console.error('Google Login Error:', error);
      Alert.alert('Google Login Failed', 'An error occurred during Google login.');
    }
  };


/*
  const appleLogin = async () => {
    try {

      if (Platform.OS === 'web') {
        const clientId = process.env.EXPO_PUBLIC_APPLE_CLIENT_ID; // You should store this securely in env files
        const redirectUri = process.env.EXPO_PUBLIC_REDIRECT_URI_APPLE; // Your redirect URI
        const scope = 'name email'; // Request user name and email
        const responseType = 'code'; // We are requesting an authorization code
    
        // Generate the authorization URL
        //https://3038-2003-c4-74e-55e5-70e2-5388-c415-2192.ngrok-free.app/oauth2/authorization/apple

        const authUrl = `https://appleid.apple.com/auth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_mode=form_post`;

        // Redirect the user to the Apple OAuth authorization page
        window.location.href = authUrl;
      }
    
      console.log("Attempting to sign in with Apple...");
  
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
  
      console.log("Apple sign-in successful:", credential);
      // Do something with the credential, like sending it to the backend for further processing
  
    } catch (e: any) {
      console.log("Error during Apple sign-in:", e);
      if (e.code === 'ERR_CANCELED') {
        console.log('User cancelled Apple Sign in');
      } else {
        Alert.alert('Apple Sign In Error', e.message || 'An error occurred during Apple login.');
      }
    }
  };*/

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Platform.select({ 
      ios: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      android: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
      web: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    }),
    redirectUri: Platform.select({
      web: `${process.env.EXPO_PUBLIC_API_URL}/login/oauth2/code/google`,
      
      default: makeRedirectUri({
       
        native:  `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_IOS_CLIENT_ID}:'/oauthredirect'`,
      ///  native: `${process.env.EXPO_PUBLIC_REDIRECT_URI}`,
      }),
    }),
  });



  const fetchGoogleUser = async (accessToken: string) => {
    if (!accessToken) return;
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      await storeToken(data.token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      fetchGoogleUser(response.authentication?.accessToken || '');
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    if(Platform.OS === 'web') {
      window.location.href = `${process.env.EXPO_PUBLIC_API_URL}/oauth2/authorization/google`;
      return;
    }
    try {
      await promptAsync({
        windowFeatures: { width: 500, height: 600 },
      });
    } catch (error) {
      console.error('Google Login Error:', error);
      Alert.alert('Google Login Failed', 'An error occurred during Google login.');
    }
  };

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
  
  
  /*
  const handleGoogleLogin = () => {

    window.location.href = `${process.env.EXPO_PUBLIC_API_URL}/oauth2/authorization/google`;
  }*/
  
if(Platform.OS === 'web') {
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

}
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
    <AuthContext.Provider
      value={{ isLoggedIn,appleLogin, handleGoogleLogin, login, logout, createUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// utils/Context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert, ActivityIndicator, Platform } from 'react-native';
import { storeToken, getToken, removeToken } from './storageUtils';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router'; 

WebBrowser.maybeCompleteAuthSession();

interface AuthContextProps {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
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
        // On web, check URL for token first (OAuth redirect)
        if (Platform.OS === 'web') {
          const urlParams = new URLSearchParams(window.location.search);
          const urlToken = urlParams.get('token');
          const error = urlParams.get('error');
          const hasOAuthParams = urlParams.has('token') || urlParams.has('error') || urlParams.has('state') || urlParams.has('code');
          
          // If there's an error in URL, handle it immediately
          if (error) {
            console.log('🔍 OAuth error detected in URL - processing error...');
            // The OAuth redirect handler will process this and set loading to false
            return;
          }
          
          // If there are OAuth parameters in URL, let the OAuth handler process them first
          // Don't check AsyncStorage yet - wait for OAuth handler to finish
          if (hasOAuthParams && urlToken) {
            console.log('🔍 OAuth token detected in URL - waiting for OAuth handler to process...');
            // The OAuth redirect handler (below) will process this and set loading to false
            return;
          }
        }
        
        // No OAuth params in URL, check AsyncStorage for stored token
        const token = await getToken();
        console.log('🔍 Checking stored token - found:', !!token);
        setIsLoggedIn(!!token);
        setLoading(false);
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);


  const appleLogin = async () => {
    if (Platform.OS === 'web') {
      const baseURL = process.env.EXPO_PUBLIC_API_URL;
      if (!baseURL) {
        console.error("EXPO_PUBLIC_API_URL is not defined");
        return;
      }
  
      const redirectURL = `${baseURL}/oauth2/authorization/apple`;
      console.log("Redirecting to:", redirectURL);
      window.location.href = redirectURL;
      return;
    }
  
    try {
      await promptAsync({
        windowFeatures: { width: 500, height: 600 },
      });
    } catch (error) {
      console.error('Apple Login Error:', error);
      Alert.alert('Apple Login Failed', 'An error occurred during Apple login.');
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

  if(Platform.OS !== 'web') {
  useEffect(() => {
    if (response?.type === 'success') {
      fetchGoogleUser(response.authentication?.accessToken || '');
    }
  }, [response]);

  }

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

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      const state = urlParams.get('state');
      const code = urlParams.get('code');
    
      console.log('🔍 Checking OAuth redirect - token:', !!token, 'error:', error, 'state:', !!state, 'code:', !!code);
      
      // If no OAuth parameters, just check stored token and finish loading
      if (!token && !error && !state && !code) {
        const storedToken = await getToken();
        setIsLoggedIn(!!storedToken);
        setLoading(false);
        return;
      }
    
      // Handle OAuth errors - if there's an error parameter, login failed
      if (error) {
        console.error('❌ OAuth login error:', error);
        const errorMessage = error === 'oauth_failed' 
          ? 'Authentication failed. Please try again.' 
          : 'An error occurred during login. Please try again.';
        // Clear any existing token
        await removeToken();
        setIsLoggedIn(false);
        setLoading(false); // IMPORTANT: Stop loading spinner
        // Clean up URL by removing query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        // Redirect to welcome/login screen
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
        // Show alert after a brief delay to avoid blocking redirect
        setTimeout(() => {
          Alert.alert('Login Failed', errorMessage);
        }, 200);
        return;
      }
    
      // Only store token if it exists and has valid JWT format
      if (token) {
        // Validate token format (JWT has 3 parts separated by dots)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('❌ Invalid token format');
          Alert.alert('Login Failed', 'Invalid authentication token.');
          await removeToken();
          setIsLoggedIn(false);
          setLoading(false); // IMPORTANT: Stop loading spinner
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        // Store the token - if it's invalid, API calls will fail and user will be logged out
        try {
          await storeToken(token);
          console.log('✅ Token stored successfully - user logged in');
          setIsLoggedIn(true);
          setLoading(false); // Finish loading after token is stored
          // Clean up URL by removing token parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('❌ Failed to store token:', err);
          await removeToken();
          setIsLoggedIn(false);
          setLoading(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        // No token, no error - check stored token and finish loading
        const storedToken = await getToken();
        setIsLoggedIn(!!storedToken);
        setLoading(false);
        // Clean up any stale OAuth parameters if present
        if (state || code) {
          console.log('⚠️ OAuth parameters present but no token - cleaning up URL');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    // Check on mount
    handleOAuthRedirect();

    // Also listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      handleOAuthRedirect();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Only run once on mount

}

  const logout = async () => {
    try {
      await removeToken();
      setIsLoggedIn(false);
      
      // On web, clean up URL parameters to ensure clean state for next login
      if (Platform.OS === 'web') {
        // Remove any query parameters from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('Logout: Cleared URL parameters');
      }
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
      await login(email, password);
      
    } catch (error: any) {
      console.log("email", email);
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

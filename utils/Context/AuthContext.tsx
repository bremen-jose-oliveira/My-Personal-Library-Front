// utils/Context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Alert, ActivityIndicator, Platform } from "react-native";
import { storeToken, getToken, removeToken } from "./storageUtils";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextProps {
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  createUser: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  handleGoogleLogin: () => void;
  appleLogin: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  loading: false,
  login: async () => {},
  logout: () => {},
  createUser: async () => {},
  handleGoogleLogin: async () => {},
  appleLogin: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Validate token with backend by making a lightweight authenticated request
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      // Use /api/books endpoint to validate token (any authenticated endpoint works)
      // This endpoint requires authentication, so it will return 401 if token is invalid
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/books`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If token is valid, backend will return 200 (even if empty array)
      // If token is invalid/expired, backend will return 401
      if (response.ok) {
        console.log("✅ Token is valid");
        return true;
      } else if (response.status === 401) {
        console.log("❌ Token is invalid or expired");
        await removeToken();
        return false;
      } else {
        console.warn(
          "⚠️ Unexpected response when validating token:",
          response.status
        );
        // On unexpected errors, don't automatically log out
        // But don't set logged in if we can't verify
        return false;
      }
    } catch (error: any) {
      console.error("❌ Error validating token:", error.message || error);
      // On network errors, don't automatically log out (might be offline)
      // But don't set logged in if we can't verify
      return false;
    }
  };

  // On web, the OAuth handler below will handle everything
  // On mobile, check stored token and validate it
  useEffect(() => {
    if (Platform.OS !== "web") {
      const checkLoginStatus = async () => {
        try {
          const token = await getToken();
          console.log("🔍 [Mobile] Checking stored token - found:", !!token);

          if (!token) {
            console.log("❌ [Mobile] No token found");
            setIsLoggedIn(false);
            setLoading(false);
            return;
          }

          // Validate token format (JWT has 3 parts)
          const tokenParts = token.split(".");
          if (tokenParts.length !== 3) {
            console.log("❌ [Mobile] Invalid token format");
            await removeToken();
            setIsLoggedIn(false);
            setLoading(false);
            return;
          }

          // Validate token with backend
          const isValid = await validateToken(token);
          setIsLoggedIn(isValid);
          setLoading(false);
        } catch (error) {
          console.error("Error checking login status:", error);
          setIsLoggedIn(false);
          setLoading(false);
        }
      };
      checkLoginStatus();
    }
  }, []);

  const appleLogin = async () => {
    if (Platform.OS === "web") {
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
      // Check if Apple Authentication is available (iOS only)
      if (!AppleAuthentication.isAvailableAsync()) {
        Alert.alert(
          "Apple Sign In Not Available",
          "Apple Sign In is only available on iOS devices."
        );
        return;
      }

      console.log("Attempting to sign in with Apple...");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("Apple sign-in successful:", credential);

      // Send credential to backend for token exchange
      if (credential.identityToken) {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/apple`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identityToken: credential.identityToken,
              authorizationCode: credential.authorizationCode,
              user: credential.user,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          // Clear any existing token
          await removeToken();
          setIsLoggedIn(false);
          throw new Error(errorText || "Failed to authenticate with backend");
        }

        const data = await response.json();
        if (!data.token) {
          await removeToken();
          setIsLoggedIn(false);
          throw new Error("No token received from backend");
        }

        // Validate token format
        const tokenParts = data.token.split(".");
        if (tokenParts.length !== 3) {
          await removeToken();
          setIsLoggedIn(false);
          throw new Error("Invalid token format received from backend");
        }

        await storeToken(data.token);
        setIsLoggedIn(true);
        console.log("✅ Apple authentication successful");
      } else {
        throw new Error("No identity token received from Apple");
      }
    } catch (e: any) {
      console.log("Error during Apple sign-in:", e);
      if (e.code === "ERR_CANCELED") {
        console.log("User cancelled Apple Sign in");
        // Don't show alert for user cancellation
      } else {
        Alert.alert(
          "Apple Sign In Error",
          e.message || "An error occurred during Apple login."
        );
      }
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
      ios: process.env.EXPO_PUBLIC_IOS_URL_SCHEME
        ? makeRedirectUri({
            scheme: process.env.EXPO_PUBLIC_IOS_URL_SCHEME,
            path: "oauth2redirect/google",
          })
        : makeRedirectUri({
            scheme:
              "com.googleusercontent.apps.958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g",
            path: "oauth2redirect/google",
          }),
      default: makeRedirectUri({
        scheme:
          process.env.EXPO_PUBLIC_IOS_URL_SCHEME ||
          "com.googleusercontent.apps.958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g",
        path: "oauth2redirect/google",
      }),
    }),
  });

  const fetchGoogleUser = async (accessToken: string) => {
    if (!accessToken) {
      console.error("❌ No access token provided");
      return;
    }
    try {
      // Send Google access token to backend to exchange for JWT
      const backendResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: accessToken,
          }),
        }
      );

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        // Clear any existing token
        await removeToken();
        setIsLoggedIn(false);
        throw new Error(errorText || "Failed to authenticate with backend");
      }

      const data = await backendResponse.json();
      if (!data.token) {
        await removeToken();
        setIsLoggedIn(false);
        throw new Error("No token received from backend");
      }

      // Validate token format
      const tokenParts = data.token.split(".");
      if (tokenParts.length !== 3) {
        await removeToken();
        setIsLoggedIn(false);
        throw new Error("Invalid token format received from backend");
      }

      await storeToken(data.token);
      setIsLoggedIn(true);
      console.log("✅ Google authentication successful");
    } catch (error: any) {
      console.error("❌ Error authenticating with Google:", error);
      // Ensure we're logged out on error
      await removeToken();
      setIsLoggedIn(false);
      Alert.alert(
        "Authentication Failed",
        error.message || "Failed to authenticate with Google. Please try again."
      );
    }
  };

  if (Platform.OS !== "web") {
    useEffect(() => {
      if (response?.type === "success") {
        fetchGoogleUser(response.authentication?.accessToken || "");
      }
    }, [response]);
  }

  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      window.location.href = `${process.env.EXPO_PUBLIC_API_URL}/oauth2/authorization/google`;
      return;
    }
    try {
      await promptAsync({
        windowFeatures: { width: 500, height: 600 },
      });
    } catch (error) {
      console.error("Google Login Error:", error);
      Alert.alert(
        "Google Login Failed",
        "An error occurred during Google login."
      );
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        // Clear any existing invalid token
        await removeToken();
        setIsLoggedIn(false);
        const errorText = await response.text();
        throw new Error(errorText || "Invalid credentials");
      }

      const data = await response.json();

      // Validate token format before storing
      if (!data.token) {
        throw new Error("No token received from server");
      }

      const tokenParts = data.token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format received from server");
      }

      await storeToken(data.token);
      setIsLoggedIn(true);
      console.log("✅ Login successful");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      // Ensure we're logged out on error
      await removeToken();
      setIsLoggedIn(false);
      Alert.alert("Login Failed", error.message || "An error occurred");
      // Re-throw so calling code knows login failed
      throw error;
    }
  };

  /*
  const handleGoogleLogin = () => {

    window.location.href = `${process.env.EXPO_PUBLIC_API_URL}/oauth2/authorization/google`;
  }*/

  if (Platform.OS === "web") {
    useEffect(() => {
      const handleOAuthRedirect = async () => {
        // Get current path and search params
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const error = urlParams.get("error");
        const state = urlParams.get("state");
        const code = urlParams.get("code");

        console.log(
          "🔍 [Web] Checking OAuth redirect - path:",
          currentPath,
          "token:",
          !!token,
          "error:",
          error,
          "state:",
          !!state,
          "code:",
          !!code
        );

        // If no OAuth parameters, check stored token (normal page load/refresh)
        if (!token && !error && !state && !code) {
          console.log("🔍 [Web] No OAuth params - checking stored token...");
          try {
            const storedToken = await getToken();
            console.log("🔍 [Web] Stored token found:", !!storedToken);
            if (storedToken) {
              // Validate token format before setting logged in
              const tokenParts = storedToken.split(".");
              if (tokenParts.length === 3) {
                console.log(
                  "✅ [Web] Valid token exists, setting isLoggedIn = true"
                );
                setIsLoggedIn(true);
              } else {
                console.log("❌ [Web] Invalid token format, removing token");
                await removeToken();
                setIsLoggedIn(false);
              }
            } else {
              console.log(
                "❌ [Web] No token found, setting isLoggedIn = false"
              );
              setIsLoggedIn(false);
            }
          } catch (err) {
            console.error("❌ [Web] Error checking stored token:", err);
            setIsLoggedIn(false);
          }
          setLoading(false);
          return;
        }

        // Handle OAuth errors - if there's an error parameter, login failed
        if (error) {
          console.error("❌ OAuth login error:", error);
          const errorMessage =
            error === "oauth_failed"
              ? "Authentication failed. Please try again."
              : "An error occurred during login. Please try again.";
          // Clear any existing token
          await removeToken();
          setIsLoggedIn(false);
          setLoading(false); // IMPORTANT: Stop loading spinner
          // Clean up URL by removing query parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          // Redirect to welcome/login screen
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
          // Show alert after a brief delay to avoid blocking redirect
          setTimeout(() => {
            Alert.alert("Login Failed", errorMessage);
          }, 200);
          return;
        }

        // Only store token if it exists and has valid JWT format
        if (token) {
          // Validate token format (JWT has 3 parts separated by dots)
          const tokenParts = token.split(".");
          if (tokenParts.length !== 3) {
            console.error("❌ Invalid token format");
            Alert.alert("Login Failed", "Invalid authentication token.");
            await removeToken();
            setIsLoggedIn(false);
            setLoading(false); // IMPORTANT: Stop loading spinner
            // Clean up URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            return;
          }

          // Store the token - if it's invalid, API calls will fail and user will be logged out
          try {
            await storeToken(token);
            console.log("✅ Token stored successfully - user logged in");
            setIsLoggedIn(true);
            setLoading(false); // Finish loading after token is stored

            // Clean up URL by removing token parameter
            const currentPath = window.location.pathname;
            window.history.replaceState({}, document.title, currentPath);

            // If we're on /(tabs) or any route other than /, we're good - just stay there
            // If we're on /, the Redirect component will handle navigation
            if (currentPath === "/" || currentPath === "/index.html") {
              console.log(
                "🔄 Token stored on welcome screen, Redirect component will handle navigation"
              );
            } else {
              console.log(
                "✅ Token stored, user is on route:",
                currentPath,
                "- staying here"
              );
            }
          } catch (err) {
            console.error("❌ Failed to store token:", err);
            await removeToken();
            setIsLoggedIn(false);
            setLoading(false);
            // Clean up URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        } else {
          // No token, no error - check stored token and finish loading
          console.log("🔍 [Web] No token in URL - checking stored token...");
          try {
            const storedToken = await getToken();
            console.log("🔍 [Web] Stored token result:", !!storedToken);
            if (storedToken) {
              // Validate token format
              const tokenParts = storedToken.split(".");
              if (tokenParts.length === 3) {
                setIsLoggedIn(true);
              } else {
                console.log("❌ [Web] Invalid token format, removing");
                await removeToken();
                setIsLoggedIn(false);
              }
            } else {
              setIsLoggedIn(false);
            }
          } catch (err) {
            console.error("❌ [Web] Error checking stored token:", err);
            setIsLoggedIn(false);
          }
          setLoading(false);
          // Clean up any stale OAuth parameters if present
          if (state || code) {
            console.log(
              "⚠️ OAuth parameters present but no token - cleaning up URL"
            );
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        }
      };

      // Check on mount - this handles both OAuth redirects and normal page loads
      handleOAuthRedirect();

      // Also listen for popstate events (back/forward navigation)
      const handlePopState = () => {
        handleOAuthRedirect();
      };
      window.addEventListener("popstate", handlePopState);

      // Also check periodically in case URL changes without popstate (like OAuth redirects)
      // This is especially important for OAuth redirects that go directly to /(tabs)
      let checkCount = 0;
      const maxChecks = 10; // Check 10 times (5 seconds total)
      const intervalId = setInterval(() => {
        checkCount++;
        // Only check if we have a token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        if (token) {
          console.log(
            "🔄 Found token in URL during interval check, processing..."
          );
          handleOAuthRedirect();
          clearInterval(intervalId); // Stop checking once we found and processed the token
          return;
        }
        if (checkCount >= maxChecks) {
          // Stop checking after max attempts
          clearInterval(intervalId);
        }
      }, 500); // Check every 500ms

      return () => {
        window.removeEventListener("popstate", handlePopState);
        clearInterval(intervalId);
      };
    }, []); // Only run once on mount
  }

  const logout = async () => {
    try {
      await removeToken();
      setIsLoggedIn(false);

      // On web, clean up URL parameters to ensure clean state for next login
      if (Platform.OS === "web") {
        // Remove any query parameters from URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        console.log("Logout: Cleared URL parameters");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const createUser = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );

      if (!response.ok) throw new Error("Registration failed");

      Alert.alert("Registration Successful", "Welcome!");
      await login(email, password);
    } catch (error: any) {
      console.log("email", email);
      console.error("Registration error:", error);
      Alert.alert("Error", error.message || "An error occurred");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        appleLogin,
        handleGoogleLogin,
        login,
        logout,
        createUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

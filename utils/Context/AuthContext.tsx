// utils/Context/AuthContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Alert, ActivityIndicator, Platform } from "react-native";
import { storeToken, getToken, removeToken } from "./storageUtils";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter, router } from "expo-router";

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

  const validateToken = async (token: string): Promise<boolean> => {
    try {
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
        return true;
      } else if (response.status === 401) {
        await removeToken();
        return false;
      } else {
        // On unexpected errors, don't automatically log out
        // But don't set logged in if we can't verify
        return false;
      }
    } catch (error: any) {
      console.error("Error validating token:", error.message || error);
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

          if (!token) {
            setIsLoggedIn(false);
            setLoading(false);
            return;
          }

          const tokenParts = token.split(".");
          if (tokenParts.length !== 3) {
            await removeToken();
            setIsLoggedIn(false);
            setLoading(false);
            return;
          }

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
      window.location.href = redirectURL;
      return;
    }

    try {
      // Check if Apple Authentication is available (iOS only)
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          "Apple Sign In Not Available",
          "Apple Sign In is only available on iOS devices."
        );
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send credential to backend for token exchange
      if (credential.identityToken) {
        const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/apple`;

        const requestBody = {
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
          user: credential.user,
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend authentication failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            url: apiUrl,
          });
          // Clear any existing token
          await removeToken();
          setIsLoggedIn(false);
          throw new Error(
            errorText ||
              `Failed to authenticate with backend (${response.status})`
          );
        }

        const data = await response.json();
        if (!data.token) {
          await removeToken();
          setIsLoggedIn(false);
          throw new Error("No token received from backend");
        }

        const tokenParts = data.token.split(".");
        if (tokenParts.length !== 3) {
          await removeToken();
          setIsLoggedIn(false);
          throw new Error("Invalid token format received from backend");
        }

        await storeToken(data.token);
        setIsLoggedIn(true);
      } else {
        throw new Error("No identity token received from Apple");
      }
    } catch (e: any) {
      console.error("Error during Apple sign-in:", {
        code: e.code,
        message: e.message,
        error: e,
      });

      if (e.code === "ERR_CANCELED") {
        // Don't show alert for user cancellation
        return;
      } else if (e.code === "ERR_INVALID_RESPONSE") {
        console.error("Invalid response from Apple");
        Alert.alert(
          "Apple Sign In Error",
          "Invalid response from Apple. Please try again."
        );
      } else if (e.code === "ERR_REQUEST_FAILED") {
        console.error("Request failed - check network connection");
        Alert.alert(
          "Network Error",
          "Failed to connect to server. Please check your internet connection and try again."
        );
      } else {
        const errorMessage =
          e.message || "An error occurred during Apple login.";
        console.error("Apple Sign In Error:", errorMessage);
        Alert.alert("Apple Sign In Error", errorMessage);
      }

      // Ensure we're logged out on any error
      await removeToken();
      setIsLoggedIn(false);
    }
  };

  /*
  const appleLogin = async () => {
    try {

      if (Platform.OS === 'web') {
        const clientId = process.env.EXPO_PUBLIC_APPLE_CLIENT_ID; // You should store this securely in env files
        const redirectUri = process.env.EXPO_PUBLIC_REDIRECT_URI_APPLE; // Your redirect URI
        const scope = 'name email'; // Request user name and email
        const responseType = 'code';

        const authUrl = `https://appleid.apple.com/auth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_mode=form_post`;

        window.location.href = authUrl;
      }
  
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
  
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
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
      ios: (() => {
        // Manually construct redirect URI to prevent truncation
        // Use :/ format (single colon, single slash) for iOS native apps
        const scheme =
          process.env.EXPO_PUBLIC_IOS_URL_SCHEME ||
          "com.googleusercontent.apps.958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g";

        const redirectUri = `${scheme}:/oauth2redirect/google`;
        return redirectUri;
      })(),
      default: (() => {
        const scheme =
          process.env.EXPO_PUBLIC_IOS_URL_SCHEME ||
          "com.googleusercontent.apps.958080376950-ov7dgq16sggjncpa7u5p4edesradrr0g";

        const redirectUri = `${scheme}:/oauth2redirect/google`;
        return redirectUri;
      })(),
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
    } catch (error: any) {
      console.error("Error authenticating with Google:", error);
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
    const trimmedEmail = email?.trim() ?? "";
    const trimmedPassword = password?.trim() ?? "";
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
        }
      );

      if (!response.ok) {
        // Clear any existing invalid token
        await removeToken();
        setIsLoggedIn(false);
        const text = await response.text();
        let message = "Invalid email or password";
        if (text) {
          try {
            const body = JSON.parse(text);
            message = body?.message ?? message;
          } catch {
            message = text || message;
          }
        }
        throw new Error(message);
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error("No token received from server");
      }

      const tokenParts = data.token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format received from server");
      }

      await storeToken(data.token);
      setIsLoggedIn(true);
    } catch (error: any) {
      console.error("Login error:", error);
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
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const error = urlParams.get("error");
        const state = urlParams.get("state");
        const code = urlParams.get("code");

        if (!token && !error && !state && !code) {
          try {
            const storedToken = await getToken();
            if (storedToken) {
              const tokenParts = storedToken.split(".");
              if (tokenParts.length === 3) {
                setIsLoggedIn(true);
              } else {
                await removeToken();
                setIsLoggedIn(false);
              }
            } else {
              setIsLoggedIn(false);
            }
          } catch (err) {
            console.error("Error checking stored token:", err);
            setIsLoggedIn(false);
          }
          setLoading(false);
          return;
        }

        if (error) {
          console.error("OAuth login error:", error);
          const errorMessage =
            error === "oauth_failed"
              ? "Authentication failed. Please try again."
              : "An error occurred during login. Please try again.";
          await removeToken();
          setIsLoggedIn(false);
          setLoading(false);
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
          setTimeout(() => {
            Alert.alert("Login Failed", errorMessage);
          }, 200);
          return;
        }

        if (token) {
          const tokenParts = token.split(".");
          if (tokenParts.length !== 3) {
            console.error("Invalid token format");
            Alert.alert("Login Failed", "Invalid authentication token.");
            await removeToken();
            setIsLoggedIn(false);
            setLoading(false);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            return;
          }

          try {
            await storeToken(token);
            setIsLoggedIn(true);
            setLoading(false);

            const currentPath = window.location.pathname;
            window.history.replaceState({}, document.title, currentPath);
          } catch (err) {
            console.error("Failed to store token:", err);
            await removeToken();
            setIsLoggedIn(false);
            setLoading(false);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        } else {
          try {
            const storedToken = await getToken();
            if (storedToken) {
              const tokenParts = storedToken.split(".");
              if (tokenParts.length === 3) {
                setIsLoggedIn(true);
              } else {
                await removeToken();
                setIsLoggedIn(false);
              }
            } else {
              setIsLoggedIn(false);
            }
          } catch (err) {
            console.error("Error checking stored token:", err);
            setIsLoggedIn(false);
          }
          setLoading(false);
          if (state || code) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        }
      };

      handleOAuthRedirect();

      const handlePopState = () => {
        handleOAuthRedirect();
      };
      window.addEventListener("popstate", handlePopState);

      let checkCount = 0;
      const maxChecks = 10;
      const intervalId = setInterval(() => {
        checkCount++;
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        if (token) {
          handleOAuthRedirect();
          clearInterval(intervalId);
          return;
        }
        if (checkCount >= maxChecks) {
          clearInterval(intervalId);
        }
      }, 500);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        clearInterval(intervalId);
      };
    }, []);
  }

  const logout = useCallback(async () => {
    try {
      setIsLoggedIn(false);
      setLoading(false);

      await removeToken();

      if (Platform.OS === "web") {
        window.history.replaceState({}, document.title, "/");
        window.location.href = "/";
      } else {
        try {
          setTimeout(() => {
            router.replace("/Logout");
          }, 100);
        } catch (navError) {
          console.error("Navigation error during logout:", navError);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggedIn(false);
      setLoading(false);
      if (Platform.OS !== "web") {
        try {
          setTimeout(() => {
            router.replace("/Logout");
          }, 100);
        } catch (navError) {
          console.error("Navigation error in logout catch:", navError);
        }
      }
    }
  }, []);

  const createUser = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const payload = {
        username: username?.trim() ?? "",
        email: email?.trim() ?? "",
        password: password?.trim() ?? "",
      };
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Registration failed");

      Alert.alert("Registration Successful", "Welcome!");
      await login(payload.email, payload.password);
    } catch (error: any) {
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

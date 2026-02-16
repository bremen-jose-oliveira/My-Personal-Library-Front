import "react-native-reanimated";

import { Link, Stack, Redirect, useRouter, useSegments } from "expo-router";
import "../global.css";
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext, useEffect } from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Colors } from "@/constants/Colors";

// Only import dev-client in development builds (prevents TestFlight crashes)
if (__DEV__) {
  require("expo-dev-client");
}

export default function WelcomeScreen() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();
  const [loadingTimeout, setLoadingTimeout] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Safety check - if AuthContext is not available, show welcome screen
  if (!authContext) {
    console.error("❌ AuthContext is not available!");
    // Still show the welcome screen
  }

  const { isLoggedIn, loading } = authContext || {
    isLoggedIn: false,
    loading: false,
  };

  // Force re-render when logout happens by watching isLoggedIn change to false
  // Use a ref to prevent multiple updates
  const prevIsLoggedInRef = React.useRef(isLoggedIn);
  useEffect(() => {
    // Only update refreshKey when transitioning from logged in to logged out
    if (
      !loading &&
      prevIsLoggedInRef.current === true &&
      isLoggedIn === false
    ) {
      // When user logs out, increment refresh key to force component re-render
      // Use a longer delay to ensure navigation and app reload have completed
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 600);
    }
    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, loading]);

  const hasNavigatedRef = React.useRef(false);
  useEffect(() => {
    if (
      !loading &&
      !isLoggedIn &&
      segments.length > 0 &&
      segments[0] === "(tabs)" &&
      !hasNavigatedRef.current
    ) {
      hasNavigatedRef.current = true;
      setTimeout(() => {
        try {
          router.replace("/");
        } catch (error) {
          console.error("Navigation error:", error);
          hasNavigatedRef.current = false;
        }
      }, 100);
    } else if (isLoggedIn) {
      hasNavigatedRef.current = false;
    }
  }, [isLoggedIn, loading, segments, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  if (!loading && isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  if (loading && !loadingTimeout) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isLoggedIn) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        key={refreshKey}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.heroGradient}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={56}
              color={Colors.white}
            />
          </View>
          <Text style={styles.heroTitle}>My Library</Text>
          <Text style={styles.heroSubtitle}>
            Your Personal Book Collection
          </Text>
        </LinearGradient>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <SocialLoginButtons emailHref="/Register" />

            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Have an Account?{" "}</Text>
              <Link href="/Login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkAction}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Forgot Password?{" "}</Text>
              <Link href="/ForgotPassword" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkAction}>Reset Password</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroGradient: {
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: Colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  cardContainer: {
    flex: 1,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    alignItems: "center",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  linkLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkAction: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
});

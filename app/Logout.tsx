import "react-native-reanimated";

import { Link, Stack, Redirect } from "expo-router";
import "../global.css";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Colors } from "@/constants/Colors";

export default function LogoutScreen() {
  const authContext = useContext(AuthContext);
  const { isLoggedIn, loading } = authContext || {
    isLoggedIn: false,
    loading: false,
  };

  // If user logs in from this screen, redirect to tabs
  if (!loading && isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.header}
        >
          <Ionicons name="book" size={48} color={Colors.white} style={styles.icon} />
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSubtitle}>Your Own Private Book Collection</Text>
        </LinearGradient>

        <View style={styles.card}>
          <SocialLoginButtons emailHref="/Register" />

          <Text style={styles.linkRow}>
            Have an Account?{" "}
            <Link href="/Login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </Text>

          <Text style={styles.linkRow}>
            Forgot Password?{" "}
            <Link href="/ForgotPassword" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Reset Password</Text>
              </TouchableOpacity>
            </Link>
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
  },
  icon: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
    color: Colors.white,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    color: Colors.primaryLight,
    textAlign: "center",
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  linkRow: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
  linkText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});

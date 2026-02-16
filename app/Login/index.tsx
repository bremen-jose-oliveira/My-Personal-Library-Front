import { useContext, useState } from "react";
import { Alert, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Colors } from "@/constants/Colors";
import React from "react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [secureText, setSecureText] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      await login(email, password);
      router.dismissAll();
      router.push("/(tabs)");
    } catch (error: any) {
      console.error("Login failed, staying on login screen");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Sign In",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign in to your Account</Text>

          <InputField
            value={email}
            onChangeText={setEmail}
            placeholder="Enter Email..."
            placeholderTextColor={Colors.placeholder}
            autoCapitalize="none"
          />

          <InputField
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Password..."
            placeholderTextColor={Colors.placeholder}
          />

          <TouchableOpacity
            style={styles.togglePassword}
            onPress={() => setSecureText(!secureText)}
          >
            <Text style={styles.togglePasswordText}>
              {secureText ? "Show Password" : "Hide Password"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.signUpRow}>
            <Text style={styles.signUpLabel}>Don't have an Account? </Text>
            <Link href="/Register" asChild>
              <TouchableOpacity>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.divider} />

          <SocialLoginButtons emailHref="/Register" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  togglePassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  togglePasswordText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    borderRadius: 12,
    alignSelf: "stretch",
    paddingVertical: 15,
    marginBottom: 24,
  },
  signInButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "700",
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  signUpLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    alignSelf: "center",
    width: "40%",
    marginBottom: 24,
  },
});

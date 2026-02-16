import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Colors } from "@/constants/Colors";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";

export default function Register() {
  const { createUser } = useContext(AuthContext);
  const [secureText, setSecureText] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return; // Prevent further action if passwords don't match
    }

    try {
      await createUser(username, email, password);
      router.dismissAll();
      router.push("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Failed to register");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Sign Up",
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text, fontWeight: "600" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create an Account</Text>

          <InputField
            value={username}
            onChangeText={setUsername}
            placeholder="Enter a Username"
            placeholderTextColor={Colors.placeholder}
            autoCapitalize="none"
          />

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

          <InputField
            secureTextEntry={secureText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password..."
            placeholderTextColor={Colors.placeholder}
          />

          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Text style={styles.togglePassword}>
              {secureText ? "Show Password" : "Hide Password"}
            </Text>
          </TouchableOpacity>

          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <Text style={styles.signInPrompt}>
            Have an Account?{" "}
            <Link href="/Login" asChild>
              <TouchableOpacity>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </Text>

          <View style={styles.divider} />

          <SocialLoginButtons emailHref="/Login" />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 24,
  },
  togglePassword: {
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    borderRadius: 12,
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 30,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  signInPrompt: {
    marginBottom: 20,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: "33%",
    marginBottom: 24,
  },
});

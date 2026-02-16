import React, { useState, useEffect } from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import InputField from "@/components/inputField";
import { Colors } from "@/constants/Colors";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams(); // Get token from deep link
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords

  useEffect(() => {
    if (!token) {
      Alert.alert("Error", "Invalid password reset link.");
      router.push("/");
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
  }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),

      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reset failed");

      Alert.alert("Success", "Password updated successfully!");
      router.push("/");
    } catch (error:any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <>
    <Stack.Screen
      options={{
       headerTitle: "Reset Password",
      }}
    />

    <View style={styles.container}>
      <Text style={styles.title}>
        Update Password
      </Text>

      <InputField
        secureTextEntry={secureText}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter New Password..."
        placeholderTextColor={Colors.placeholder}
      />

      <InputField
        secureTextEntry={secureText}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm New Password..."
        placeholderTextColor={Colors.placeholder}
      />

      <TouchableOpacity onPress={() => setSecureText(!secureText)}>
        <Text style={styles.toggleText}>
          {secureText ? "Show Password" : "Hide Password"}
        </Text>
      </TouchableOpacity>

      {passwordError && (
        <Text style={styles.errorText}>{passwordError}</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
      >
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: Colors.text,
    marginBottom: 48,
  },
  toggleText: {
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 20,
  },
  errorText: {
    color: Colors.error,
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    borderRadius: 12,
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 30,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

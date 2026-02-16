import InputField from "@/components/inputField";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();  
        Alert.alert("Check your email", data.message);
    } catch (error) {
      
        Alert.alert("Error", "Failed to send reset email");
    }
};

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Forgot Password",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}>
          Reset Password
        </Text>

        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="Enter Email..."
          placeholderTextColor={Colors.placeholder}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleForgotPassword}
        >
          <Text style={styles.buttonText}>Reset</Text>
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

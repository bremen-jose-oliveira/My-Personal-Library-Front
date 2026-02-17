import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";

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
    } catch {
      Alert.alert("Error", "Failed to register");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Sign Up",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ioicons name="close" size={24} color="#667eea" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerTintColor: "#667eea",
          headerShadowVisible: true,
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: "#f8f9fa",
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 30,
            paddingVertical: 40,
          }}
        >
          {/* Title Section */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#667eea",
                marginBottom: 8,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                textAlign: "center",
              }}
            >
              Join us to start building your library
            </Text>
          </View>

          {/* Input Fields */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
              marginBottom: 20,
            }}
          >
            <InputField
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />

            <InputField
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />

            <InputField
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#999"
            />

            <InputField
              secureTextEntry={secureText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              onPress={() => setSecureText(!secureText)}
              style={{ marginBottom: 10 }}
            >
              <Text
                style={{
                  color: "#667eea",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                {secureText ? "Show Password" : "Hide Password"}
              </Text>
            </TouchableOpacity>

            {passwordError && (
              <Text
                style={{
                  color: "#dc3545",
                  fontSize: 14,
                  marginBottom: 10,
                }}
              >
                {passwordError}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleRegister}
              style={{
                backgroundColor: "#667eea",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 16,
                marginTop: 10,
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 25,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#e0e0e0" }} />
            <Text style={{ marginHorizontal: 10, color: "#666", fontSize: 14 }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#e0e0e0" }} />
          </View>

          {/* Social Login */}
          <SocialLoginButtons emailHref="/Login" />

          {/* Footer Links */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: "#666" }}>
              Already have an account?{" "}
              <Link href="/Login" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "#667eea", fontWeight: "600" }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

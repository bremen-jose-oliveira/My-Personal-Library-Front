import { useContext, useState } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { AuthContext } from "@/utils/Context/AuthContext";
import Ioicons from "react-native-vector-icons/Ionicons";
import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
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
      // Only navigate if login was successful (no exception thrown)
      // The AuthContext will set isLoggedIn=true, and the app will redirect automatically
      router.dismissAll();
      router.push("/(tabs)");
    } catch {
      // Login failed - don't navigate, stay on login screen
      // Alert is already shown in AuthContext.login()
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
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                textAlign: "center",
              }}
            >
              Sign in to continue to your library
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

            <TouchableOpacity
              onPress={handleLogin}
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
                Sign In
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
          <SocialLoginButtons emailHref="/Register" />

          {/* Footer Links */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: "#666" }}>
              Don't have an account?{" "}
              <Link href="/Register" asChild>
                <TouchableOpacity>
                  <Text style={{ color: "#667eea", fontWeight: "600" }}>
                    Sign Up
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

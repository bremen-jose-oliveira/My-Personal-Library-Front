import { useContext, useState } from "react";
import { Alert, TouchableOpacity, View, Text } from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { AuthContext } from "@/utils/Context/AuthContext";
import Ioicons from "react-native-vector-icons/Ionicons";
import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";

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
    } catch (error: any) {
      // Login failed - don't navigate, stay on login screen
      // Alert is already shown in AuthContext.login()
      console.error("Login failed, staying on login screen");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
              }}
            >
              <Ioicons name="close" size={24} color="#171717" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#ff6b35", "#ff9166"] as any}
          style={{
            height: 200,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 60,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 8,
            }}
          >
            Welcome Back
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: "500",
            }}
          >
            Sign in to continue
          </Text>
        </LinearGradient>

        {/* Login Card */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -32,
            paddingHorizontal: 24,
            paddingTop: 32,
          }}
        >
          <InputField
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#a3a3a3"
            autoCapitalize="none"
          />

          <InputField
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#a3a3a3"
          />

          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={{ alignSelf: "flex-end", marginBottom: 24 }}
          >
            <Text
              style={{
                color: "#ff6b35",
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
              backgroundColor: "#ff6b35",
              alignItems: "center",
              borderRadius: 16,
              alignSelf: "stretch",
              paddingVertical: 16,
              marginBottom: 24,
              shadowColor: "#ff6b35",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e5e5" }} />
            <Text
              style={{
                marginHorizontal: 12,
                fontSize: 14,
                color: "#a3a3a3",
                fontWeight: "500",
              }}
            >
              or continue with
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e5e5" }} />
          </View>

          <SocialLoginButtons emailHref="/Register" />

          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              color: "#525252",
              textAlign: "center",
            }}
          >
            Don't have an account?{" "}
            <Link href="/Register" asChild>
              <TouchableOpacity>
                <Text style={{ color: "#ff6b35", fontWeight: "600" }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </Text>
        </View>
      </View>
    </>
  );
}

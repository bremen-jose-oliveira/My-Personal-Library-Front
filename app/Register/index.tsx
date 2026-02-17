import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import { Alert, TouchableOpacity, View, Text, ScrollView } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

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
            height: 180,
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
            Create Account
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: "500",
            }}
          >
            Join us today
          </Text>
        </LinearGradient>

        {/* Registration Form */}
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -32,
          }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: 40,
          }}
        >
          <InputField
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#a3a3a3"
            autoCapitalize="none"
          />

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

          <InputField
            secureTextEntry={secureText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="#a3a3a3"
          />

          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            style={{ alignSelf: "flex-end", marginBottom: 16 }}
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

          {passwordError && (
            <Text
              style={{
                color: "#ef4444",
                fontSize: 14,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              {passwordError}
            </Text>
          )}

          <TouchableOpacity
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
            onPress={handleRegister}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: "700",
              }}
            >
              Create Account
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
              or sign up with
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#e5e5e5" }} />
          </View>

          <SocialLoginButtons emailHref="/Login" />

          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              color: "#525252",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <Link href="/Login" asChild>
              <TouchableOpacity>
                <Text style={{ color: "#ff6b35", fontWeight: "600" }}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

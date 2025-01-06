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
    if (!username || !email || !password || !confirmPassword) {
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
      router.push("/");
    } catch (error) {
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
              <Ioicons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-1 justify-center items-center px-5 bg-gray-100">
        <Text className="text-2xl font-semibold tracking-wide text-black mb-12">
          Create an Account
        </Text>

        <InputField
          value={username}
          onChangeText={setUsername}
          placeholder="Enter a Username"
          placeholderTextColor="gray"
          autoCapitalize="none"
        />

        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="Enter Email..."
          placeholderTextColor="gray"
          autoCapitalize="none"
        />

        <InputField
          secureTextEntry={secureText}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter Password..."
          placeholderTextColor="gray"
        />

        <InputField
          secureTextEntry={secureText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password..."
          placeholderTextColor="gray"
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Text
            style={{
              color: "#bf471b",
              fontWeight: "600",
              marginBottom: 20,
            }}
          >
            {secureText ? "Show Password" : "Hide Password"}
          </Text>
          
        </TouchableOpacity>

        {passwordError && (
          <Text className="text-red-500 mt-1 mb-2">{passwordError}</Text>
        )}

        <TouchableOpacity
         style={{  backgroundColor: "#bf471b", alignItems:"center", borderRadius: 5, alignSelf: "stretch",   paddingVertical: 14,paddingHorizontal: 18,  marginBottom: 30,}}
       
          onPress={handleRegister}
        >
          <Text className="text-white text-lg font-semibold">Register</Text>
        </TouchableOpacity>

        <Text className="mb-5 text-sm text-black">
          Have an Account?{" "}
          <Link href="/Login" asChild>
            <TouchableOpacity>
              <Text  style={{  color: "#bf471b"}}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </Text>

        <View className="border-t border-gray-300 w-1/3 mb-8"></View>
        <SocialLoginButtons emailHref="/Login" />
      </View>
    </>
  );
}

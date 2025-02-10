import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import InputField from "@/components/inputField";





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

    <View className="flex-1 justify-center items-center px-5 bg-gray-100">

<Text className="text-2xl font-semibold tracking-wide text-black mb-12">
       Update Password
      </Text>

         <InputField
     secureTextEntry={secureText}
      value={password}
        onChangeText={setPassword}
        placeholder="Enter New Password..."
        placeholderTextColor="gray"
      />


      <InputField
       secureTextEntry={secureText}
       value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm New Password..."
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
style={{ backgroundColor: "#bf471b", alignItems: "center", borderRadius: 5, alignSelf: "stretch", paddingVertical: 14, paddingHorizontal: 18, marginBottom: 30 }}
onPress={handleResetPassword}
>
<Text className="text-white text-lg font-semibold">Update Password</Text>
</TouchableOpacity>

 
    </View>
  </>
  );
}

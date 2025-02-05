import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, TouchableOpacity, View, Text } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";
import { getToken } from "@/utils/Context/storageUtils";

const UserProfile = () => {


  const [secureText, setSecureText] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords




   
  const handleUpdateUsername = async () => {
    try {
        // Validate username input
        if (!username.trim()) {
            Alert.alert("Error", "Username cannot be empty");
            return;
        }

        // Get the token
       const token = await getToken();
        if (!token) {
            throw new Error('Token is missing or expired');
        }

        // Make API request
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/current/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ username}),
        });

        // Parse response
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || "Failed to update username");
        }

        // Success feedback
        Alert.alert("Success", "Username updated successfully!");
        console.log("Updated User:", responseData);
        
    } catch (error:any) {
        console.error("Error updating username:", error);
        Alert.alert("Error", error.message || "Something went wrong.");
    }
};




const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
    }

    try {
        const token = await getToken();
        if (!token) {
            throw new Error('Token is missing or expired');
        }

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/current/update/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ oldPassword: oldPassword, newPassword: confirmPassword }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || "Failed to update password");
        }

        Alert.alert("Success", "Password updated successfully!");
    } catch (error:any) {
        console.error("Error updating password:", error);
        Alert.alert("Error", error.message || "Something went wrong.");
    }
};



    return (
        <>
          <Stack.Screen
            options={{
             headerTitle: "Profile",
            }}
          />
    
          <View className="flex-1 justify-center items-center px-5 bg-gray-100">
            <Text className="text-2xl font-semibold tracking-wide text-black mb-12">
             Change Username
            </Text>
    
            <InputField
             value={username}
             onChangeText={setUsername}
              placeholder="Enter a Username"
              placeholderTextColor="gray"
              autoCapitalize="none"
            />
       <TouchableOpacity
             style={{  backgroundColor: "#bf471b", alignItems:"center", borderRadius: 5, alignSelf: "stretch",   paddingVertical: 14,paddingHorizontal: 18,  marginBottom: 30,}}
           
            onPress={handleUpdateUsername}
            >
              <Text className="text-white text-lg font-semibold">Safe</Text>
            </TouchableOpacity>
         
     <Text className="text-2xl font-semibold tracking-wide text-black mb-12">
              Change Password
            </Text>
            <InputField
           secureTextEntry={secureText}
            value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter Old Password..."
              placeholderTextColor="gray"
            />
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
    onPress={handleUpdatePassword}
>
    <Text className="text-white text-lg font-semibold">Update Password</Text>
</TouchableOpacity>
 
       
          </View>
        </>
      );
};

export default UserProfile;
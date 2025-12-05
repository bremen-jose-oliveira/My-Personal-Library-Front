import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { AuthContext } from "@/utils/Context/AuthContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, TouchableOpacity, View, Text, Platform, ScrollView } from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";
import { getToken, removeToken } from "@/utils/Context/storageUtils";

const AccountSettings = () => {
  const { logout } = useContext(AuthContext);
  const { currentUser, refreshCurrentUser } = useUserContext();

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
        // Refresh current user to show updated username
        await refreshCurrentUser();
        setUsername(""); // Clear the input field
        
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

  const handleDeleteAccount = async () => {
  // Show warning dialog
  const showWarning = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        '⚠️ WARNING: This action is PERMANENT and cannot be undone!\n\n' +
        'Deleting your account will permanently remove:\n' +
        '• All your books\n' +
        '• All your reviews\n' +
        '• All your exchanges\n' +
        '• All your friendships\n' +
        '• All your notifications\n' +
        '• Your account data\n\n' +
        'Are you absolutely sure you want to delete your account?'
      );
      
      if (confirmed) {
        // Second confirmation
        const doubleConfirmed = window.confirm(
          'This is your LAST chance to cancel.\n\n' +
          'Click OK to permanently delete your account, or Cancel to keep it.'
        );
        
        if (doubleConfirmed) {
          performDelete();
        }
      }
    } else {
      Alert.alert(
        '⚠️ Delete Account',
        'This action is PERMANENT and cannot be undone!\n\n' +
        'Deleting your account will permanently remove:\n' +
        '• All your books\n' +
        '• All your reviews\n' +
        '• All your exchanges\n' +
        '• All your friendships\n' +
        '• All your notifications\n' +
        '• Your account data',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              // Second confirmation
              Alert.alert(
                '⚠️ Final Confirmation',
                'This is your LAST chance to cancel.\n\n' +
                'Are you absolutely sure you want to permanently delete your account?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Yes, Delete Forever',
                    style: 'destructive',
                    onPress: performDelete,
                  },
                ]
              );
            },
          },
        ]
      );
    }
  };

  const performDelete = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('You must be logged in to delete your account');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/current`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }

      // Account deleted successfully
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted. We\'re sorry to see you go!',
        [
          {
            text: 'OK',
            onPress: async () => {
              // Clear token and logout
              await removeToken();
              logout();
              router.replace('/');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
    }
  };

  showWarning();
};



    return (
        <>
          <Stack.Screen
            options={{
             headerTitle: "AccountSettings",
            }}
          />
    
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#f3f4f6' }}>
            <ScrollView 
              style={{ width: '100%', maxWidth: 600 }}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Current User Information */}
              <View style={{ 
                backgroundColor: '#fff', 
                borderRadius: 8, 
                padding: 16, 
                marginBottom: 24, 
                width: '100%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
                  Current Account Information
                </Text>
                {currentUser ? (
                  <>
                    {currentUser.username && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>Username</Text>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>{currentUser.username}</Text>
                      </View>
                    )}
                    {currentUser.email && (
                      <View>
                        <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 4 }}>Email</Text>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>{currentUser.email}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={{ fontSize: 14, color: '#9ca3af' }}>Loading user information...</Text>
                )}
              </View>

              <Text style={{ fontSize: 24, fontWeight: '600', letterSpacing: 0.5, color: '#000', marginBottom: 24, marginTop: 10, textAlign: 'center' }}>
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
                style={{ 
                  backgroundColor: "#bf471b", 
                  alignItems: "center", 
                  borderRadius: 5, 
                  alignSelf: "stretch", 
                  paddingVertical: 14,
                  paddingHorizontal: 18, 
                  marginBottom: 30,
                  minHeight: 48
                }}
                onPress={handleUpdateUsername}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Update Username</Text>
              </TouchableOpacity>
         
              <Text style={{ fontSize: 24, fontWeight: '600', letterSpacing: 0.5, color: '#000', marginBottom: 24, marginTop: 10, textAlign: 'center' }}>
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
                    fontSize: 14,
                  }}
                >
                  {secureText ? "Show Password" : "Hide Password"}
                </Text>
              </TouchableOpacity>
    
              {passwordError && (
                <Text style={{ color: '#ef4444', marginTop: 4, marginBottom: 8, fontSize: 14 }}>{passwordError}</Text>
              )}
    
              <TouchableOpacity
                style={{ 
                  backgroundColor: "#bf471b", 
                  alignItems: "center", 
                  borderRadius: 5, 
                  alignSelf: "stretch", 
                  paddingVertical: 14, 
                  paddingHorizontal: 18, 
                  marginBottom: 30,
                  minHeight: 48
                }}
                onPress={handleUpdatePassword}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Update Password</Text>
              </TouchableOpacity>

              <View style={{ marginTop: 40, paddingTop: 30, borderTopWidth: 1, borderTopColor: "#e0e0e0", width: "100%" }}>
                <Text style={{ fontSize: 20, fontWeight: '600', letterSpacing: 0.5, color: '#dc2626', marginBottom: 16, textAlign: 'center' }}>
                  Danger Zone
                </Text>
                <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 24, textAlign: 'center', paddingHorizontal: 16, lineHeight: 20 }}>
                  Deleting your account will permanently remove all your data including books, reviews, exchanges, and friendships. This action cannot be undone.
                </Text>
                <TouchableOpacity
                  style={{ 
                    backgroundColor: "#dc2626", 
                    alignItems: "center", 
                    borderRadius: 5, 
                    alignSelf: "stretch", 
                    paddingVertical: 14, 
                    paddingHorizontal: 18,
                    marginBottom: 20,
                    minHeight: 48
                  }}
                  onPress={handleDeleteAccount}
                >
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Delete Account</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </>
      );
};

export default AccountSettings;
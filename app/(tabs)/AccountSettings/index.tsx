import InputField from "@/components/inputField";
import { AuthContext } from "@/utils/Context/AuthContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import {
  Alert,
  TouchableOpacity,
  View,
  Text,
  Platform,
  ScrollView,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getToken, removeToken } from "@/utils/Context/storageUtils";

const AccountSettings = () => {
  const { logout } = useContext(AuthContext);
  const { currentUser, refreshCurrentUser, logoutUserLocally } =
    useUserContext();

  const [secureText, setSecureText] = useState(true);

  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords

  const handleUpdateUsername = async () => {
    try {
      if (!username.trim()) {
        Alert.alert("Error", "Username cannot be empty");
        return;
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Token is missing or expired");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/current/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update username");
      }

      Alert.alert("Success", "Username updated successfully!");
      await refreshCurrentUser();
      setUsername(""); // Clear the input field
    } catch (error: any) {
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
        throw new Error("Token is missing or expired");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/current/update/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: confirmPassword,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update password");
      }

      Alert.alert("Success", "Password updated successfully!");
    } catch (error: any) {
      console.error("Error updating password:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    }
  };

  const handleDeleteAccount = async () => {
    const showWarning = () => {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          "⚠️ WARNING: This action is PERMANENT and cannot be undone!\n\n" +
            "Deleting your account will permanently remove:\n" +
            "• All your books\n" +
            "• All your reviews\n" +
            "• All your exchanges\n" +
            "• All your friendships\n" +
            "• All your notifications\n" +
            "• Your account data\n\n" +
            "Are you absolutely sure you want to delete your account?"
        );

        if (confirmed) {
          const doubleConfirmed = window.confirm(
            "This is your LAST chance to cancel.\n\n" +
              "Click OK to permanently delete your account, or Cancel to keep it."
          );

          if (doubleConfirmed) {
            performDelete();
          }
        }
      } else {
        Alert.alert(
          "⚠️ Delete Account",
          "This action is PERMANENT and cannot be undone!\n\n" +
            "Deleting your account will permanently remove:\n" +
            "• All your books\n" +
            "• All your reviews\n" +
            "• All your exchanges\n" +
            "• All your friendships\n" +
            "• All your notifications\n" +
            "• Your account data",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                Alert.alert(
                  "⚠️ Final Confirmation",
                  "This is your LAST chance to cancel.\n\n" +
                    "Are you absolutely sure you want to permanently delete your account?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Yes, Delete Forever",
                      style: "destructive",
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
          throw new Error("You must be logged in to delete your account");
        }

        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/users/current`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete account");
        }

        await removeToken();
        await logoutUserLocally();
        await logout();

        router.replace("/");
        router.dismissAll();

        setTimeout(() => {
          if (Platform.OS === "web") {
            alert(
              "Your account has been permanently deleted. We're sorry to see you go!"
            );
          } else {
            Alert.alert(
              "Account Deleted",
              "Your account has been permanently deleted. We're sorry to see you go!"
            );
          }
        }, 500);
      } catch (error: any) {
        console.error("Error deleting account:", error);
        Alert.alert(
          "Error",
          error.message || "Failed to delete account. Please try again."
        );
      }
    };

    showWarning();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Account Settings",
        }}
      />

      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={{
          flex: 1,
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Current User Information */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#667eea",
                marginBottom: 12,
              }}
            >
              Current Account Information
            </Text>
            {currentUser ? (
              <>
                {currentUser.username && (
                  <View style={{ marginBottom: 12 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#666",
                        marginBottom: 4,
                      }}
                    >
                      Username
                    </Text>
                    <Text
                      style={{ fontSize: 18, fontWeight: "600", color: "#333" }}
                    >
                      {currentUser.username}
                    </Text>
                  </View>
                )}
                {currentUser.email && (
                  <View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#666",
                        marginBottom: 4,
                      }}
                    >
                      Email
                    </Text>
                    <Text
                      style={{ fontSize: 18, fontWeight: "600", color: "#333" }}
                    >
                      {currentUser.email}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={{ fontSize: 14, color: "#666" }}>
                Loading user information...
              </Text>
            )}
          </View>

          {/* Update Username Section */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#333",
                marginBottom: 16,
              }}
            >
              Change Username
            </Text>

            <InputField
              value={username}
              onChangeText={setUsername}
              placeholder="Enter a Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#667eea",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 14,
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={handleUpdateUsername}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Update Username
              </Text>
            </TouchableOpacity>
          </View>

          {/* Update Password Section */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#333",
                marginBottom: 16,
              }}
            >
              Change Password
            </Text>
            <InputField
              secureTextEntry={secureText}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter Old Password..."
              placeholderTextColor="#999"
            />
            <InputField
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter New Password..."
              placeholderTextColor="#999"
            />

            <InputField
              secureTextEntry={secureText}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Text
              style={{
                color: "#667eea",
                fontWeight: "600",
                marginBottom: 16,
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
                marginBottom: 12,
                fontSize: 14,
              }}
            >
              {passwordError}
            </Text>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: "#667eea",
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 14,
              shadowColor: "#667eea",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={handleUpdatePassword}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Update Password
            </Text>
          </TouchableOpacity>
        </View>

          {/* Legal & Support Section */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#333",
                marginBottom: 16,
              }}
            >
              Legal & Support
            </Text>

            {/* Privacy Policy Link */}
            <TouchableOpacity
              style={{
                backgroundColor: "#667eea",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 14,
                marginBottom: 12,
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => {
                // @ts-ignore
                router.push("/PrivacyPolicy");
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                📄 Privacy Policy
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 14,
                color: "#666",
                marginTop: 12,
                marginBottom: 12,
                lineHeight: 20,
              }}
            >
              If you enjoy using My Library, consider supporting its
              development. Every contribution helps the server to stay online!
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#0070ba",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 14,
                marginBottom: 16,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                shadowColor: "#0070ba",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={async () => {
                const paypalUrl = "https://paypal.me/MyPersonalLibrary";
                try {
                  const canOpen = await Linking.canOpenURL(paypalUrl);
                  if (canOpen) {
                    await Linking.openURL(paypalUrl);
                  } else {
                    Alert.alert(
                      "Error",
                      "Unable to open PayPal. Please check your PayPal link."
                    );
                  }
                } catch (error) {
                  console.error("Error opening PayPal:", error);
                  Alert.alert("Error", "Unable to open PayPal link.");
                }
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                💙 Support with PayPal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
              borderWidth: 2,
              borderColor: "#dc2626",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#dc2626",
                marginBottom: 12,
              }}
            >
              Danger Zone
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 16,
                lineHeight: 20,
              }}
            >
              Deleting your account will permanently remove all your data
              including books, reviews, exchanges, and friendships. This action
              cannot be undone.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#dc2626",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 14,
                shadowColor: "#dc2626",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={handleDeleteAccount}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

export default AccountSettings;

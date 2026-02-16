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
  StyleSheet,
} from "react-native";
import { getToken, removeToken } from "@/utils/Context/storageUtils";
import { Colors } from "@/constants/Colors";

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
          headerTitle: "AccountSettings",
        }}
      />

      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current User Information */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Account Information</Text>
            {currentUser ? (
              <>
                {currentUser.username && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoValue}>
                      {currentUser.username}
                    </Text>
                  </View>
                )}
                {currentUser.email && (
                  <View>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>
                      {currentUser.email}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.loadingText}>
                Loading user information...
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Change Username</Text>

          <InputField
            value={username}
            onChangeText={setUsername}
            placeholder="Enter a Username"
            placeholderTextColor="gray"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleUpdateUsername}
          >
            <Text style={styles.primaryButtonText}>Update Username</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Change Password</Text>
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
            <Text style={styles.togglePasswordText}>
              {secureText ? "Show Password" : "Hide Password"}
            </Text>
          </TouchableOpacity>

          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleUpdatePassword}
          >
            <Text style={styles.primaryButtonText}>Update Password</Text>
          </TouchableOpacity>

          {/* Legal & Support Section */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionHeading}>Legal & Support</Text>

            {/* Privacy Policy Link */}
            <TouchableOpacity
              style={styles.privacyButton}
              onPress={() => {
                // @ts-ignore
                router.push("/PrivacyPolicy");
              }}
            >
              <Text style={styles.privacyButtonText}>📄 Privacy Policy</Text>
            </TouchableOpacity>

            <Text style={styles.supportText}>
              If you enjoy using My Library, consider supporting its
              development. Every contribution helps the server to stay online!
            </Text>
            <TouchableOpacity
              style={styles.paypalButton}
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
              <Text style={styles.paypalButtonText}>
                💙 Support with PayPal
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerDescription}>
              Deleting your account will permanently remove all your data
              including books, reviews, exchanges, and friendships. This action
              cannot be undone.
            </Text>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.background,
  },
  scrollView: {
    width: "100%",
    maxWidth: 600,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: "100%",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.placeholder,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.placeholder,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: Colors.text,
    marginBottom: 24,
    marginTop: 10,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    borderRadius: 12,
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 30,
    minHeight: 48,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  togglePasswordText: {
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 20,
    fontSize: 14,
  },
  errorText: {
    color: Colors.error,
    marginTop: 4,
    marginBottom: 8,
    fontSize: 14,
  },
  sectionDivider: {
    marginTop: 40,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: "100%",
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  privacyButton: {
    backgroundColor: Colors.textSecondary,
    alignItems: "center",
    borderRadius: 12,
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    minHeight: 48,
  },
  privacyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  supportText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  paypalButton: {
    backgroundColor: "#0070ba",
    alignItems: "center",
    borderRadius: 12,
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 30,
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  paypalButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  dangerSection: {
    marginTop: 40,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.error,
    width: "100%",
  },
  dangerTitle: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: Colors.error,
    marginBottom: 16,
    textAlign: "center",
  },
  dangerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: Colors.error,
    alignItems: "center",
    borderRadius: 12,
    alignSelf: "stretch",
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
    minHeight: 48,
  },
  dangerButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AccountSettings;

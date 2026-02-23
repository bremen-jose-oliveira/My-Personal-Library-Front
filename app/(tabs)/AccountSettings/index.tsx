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
import { apiClient } from "@/utils/apiClient";
import { getToken, removeToken } from "@/utils/Context/storageUtils";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", labelKey: "account.english" as const },
  { code: "pt-PT", labelKey: "account.portuguese" as const },
  { code: "de", labelKey: "account.german" as const },
] as const;

const AccountSettings = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useContext(AuthContext);
  const currentLang = i18n.language?.startsWith("pt") ? "pt-PT" : i18n.language?.startsWith("de") ? "de" : "en";
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
        Alert.alert(t("common.error"), t("account.usernameCannotBeEmpty"));
        return;
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Token is missing or expired");
      }

      const response = await apiClient.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/current/update`,
        { username }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update username");
      }

      Alert.alert(t("common.success"), t("account.usernameUpdated"));
      await refreshCurrentUser();
      setUsername(""); // Clear the input field
    } catch (error: any) {
      console.error("Error updating username:", error);
      Alert.alert(t("common.error"), error.message || t("account.somethingWentWrong"));
    }
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      setPasswordError(t("account.passwordsDoNotMatch"));
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Token is missing or expired");
      }

      const response = await apiClient.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/users/current/update/password`,
        {
          oldPassword: oldPassword,
          newPassword: confirmPassword,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update password");
      }

      Alert.alert(t("common.success"), t("account.passwordUpdated"));
    } catch (error: any) {
      console.error("Error updating password:", error);
      Alert.alert(t("common.error"), error.message || t("account.somethingWentWrong"));
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
          "⚠️ " + t("account.deleteAccountConfirmTitle"),
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
              text: t("common.delete"),
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
                      text: t("account.yesDeleteForever"),
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

        const response = await apiClient.delete(
          `${process.env.EXPO_PUBLIC_API_URL}/api/users/current`
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
              t("account.accountDeleted"),
              "Your account has been permanently deleted. We're sorry to see you go!"
            );
          }
        }, 500);
      } catch (error: any) {
        console.error("Error deleting account:", error);
Alert.alert(
              t("common.error"),
              error.message || t("account.failedToDeleteAccount")
            );
      }
    };

    showWarning();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("tabs.accountSettings"),
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 20,
          backgroundColor: "#f3f4f6",
        }}
      >
        <ScrollView
          style={{ width: "100%", maxWidth: 600 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Language */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: 12,
              }}
            >
              {t("account.language")}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {LANGUAGES.map(({ code, labelKey }) => (
                <TouchableOpacity
                  key={code}
                  onPress={() => i18n.changeLanguage(code)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: currentLang === code ? "#bf471b" : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      color: currentLang === code ? "#fff" : "#374151",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {t(labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Current User Information */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
              width: "100%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#6b7280",
                marginBottom: 8,
              }}
            >
              {t("account.currentAccountInfo")}
            </Text>
            {currentUser ? (
              <>
                {currentUser.username && (
                  <View style={{ marginBottom: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      {t("account.username")}
                    </Text>
                    <Text
                      style={{ fontSize: 18, fontWeight: "600", color: "#000" }}
                    >
                      {currentUser.username}
                    </Text>
                  </View>
                )}
                {currentUser.email && (
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      {t("account.email")}
                    </Text>
                    <Text
                      style={{ fontSize: 18, fontWeight: "600", color: "#000" }}
                    >
                      {currentUser.email}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                {t("account.loadingUserInfo")}
              </Text>
            )}
          </View>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              letterSpacing: 0.5,
              color: "#000",
              marginBottom: 24,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            {t("account.changeUsername")}
          </Text>

          <InputField
            value={username}
            onChangeText={setUsername}
            placeholder={t("account.enterUsername")}
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
              minHeight: 48,
            }}
            onPress={handleUpdateUsername}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
              {t("account.updateUsername")}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              letterSpacing: 0.5,
              color: "#000",
              marginBottom: 24,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            {t("account.changePassword")}
          </Text>
          <InputField
            secureTextEntry={secureText}
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder={t("account.enterOldPassword")}
            placeholderTextColor="gray"
          />
          <InputField
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            placeholder={t("account.enterNewPassword")}
            placeholderTextColor="gray"
          />

          <InputField
            secureTextEntry={secureText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("account.confirmNewPassword")}
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
              {secureText ? t("auth.showPassword") : t("auth.hidePassword")}
            </Text>
          </TouchableOpacity>

          {passwordError && (
            <Text
              style={{
                color: "#ef4444",
                marginTop: 4,
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              {passwordError}
            </Text>
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
              minHeight: 48,
            }}
            onPress={handleUpdatePassword}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
              {t("account.updatePassword")}
            </Text>
          </TouchableOpacity>

          {/* Legal & Support Section */}
          <View
            style={{
              marginTop: 40,
              paddingTop: 30,
              borderTopWidth: 1,
              borderTopColor: "#e0e0e0",
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                letterSpacing: 0.5,
                color: "#000",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {t("account.legalAndSupport")}
            </Text>

            {/* Privacy Policy Link */}
            <TouchableOpacity
              style={{
                backgroundColor: "#6b7280",
                alignItems: "center",
                borderRadius: 5,
                alignSelf: "stretch",
                paddingVertical: 14,
                paddingHorizontal: 18,
                marginBottom: 12,
                minHeight: 48,
              }}
              onPress={() => {
                // @ts-ignore
                router.push("/PrivacyPolicy");
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                📄 {t("account.privacyPolicyLink")}
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 14,
                color: "#4b5563",
                marginTop: 20,
                marginBottom: 12,
                textAlign: "center",
                paddingHorizontal: 16,
                lineHeight: 20,
              }}
            >
              {t("account.supportMessage")}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#0070ba",
                alignItems: "center",
                borderRadius: 5,
                alignSelf: "stretch",
                paddingVertical: 14,
                paddingHorizontal: 18,
                marginBottom: 30,
                minHeight: 48,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
              onPress={async () => {
                const paypalUrl = "https://paypal.me/MyPersonalLibrary";
                try {
                  const canOpen = await Linking.canOpenURL(paypalUrl);
                  if (canOpen) {
                    await Linking.openURL(paypalUrl);
                  } else {
                    Alert.alert(
                      t("common.error"),
                      t("account.unableToOpenPayPal")
                    );
                  }
                } catch (error) {
                  console.error("Error opening PayPal:", error);
                  Alert.alert(t("common.error"), t("account.unableToOpenPayPal"));
                }
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
                💙 {t("account.supportPayPal")}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 40,
              paddingTop: 30,
              borderTopWidth: 1,
              borderTopColor: "#e0e0e0",
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                letterSpacing: 0.5,
                color: "#dc2626",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Danger Zone
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#4b5563",
                marginBottom: 24,
                textAlign: "center",
                paddingHorizontal: 16,
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
                borderRadius: 5,
                alignSelf: "stretch",
                paddingVertical: 14,
                paddingHorizontal: 18,
                marginBottom: 20,
                minHeight: 48,
              }}
              onPress={handleDeleteAccount}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
                {t("account.deleteAccount")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default AccountSettings;

import React, { useContext, useCallback, useRef } from "react";
import { Platform, Alert, Button } from "react-native";
import { useTranslation } from "react-i18next";
import "../../global.css";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import NotificationBell from "@/components/NotificationBell";

function AppTabs() {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { logout, isLoggedIn } = authContext || {
    logout: () => {},
    isLoggedIn: false,
  };
  const isLoggingOutRef = useRef(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOutRef.current) {
      return;
    }

    isLoggingOutRef.current = true;

    try {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(t("auth.confirmLogoutMessage"));
        if (confirmed) {
          await logout();
        }
      } else {
        Alert.alert(t("auth.confirmLogout"), t("auth.confirmLogoutMessage"), [
          {
            text: t("common.cancel"),
            style: "cancel",
            onPress: () => {
              isLoggingOutRef.current = false;
            },
          },
          {
            text: t("common.yes"),
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                console.error("Logout error in handleLogout:", error);
                isLoggingOutRef.current = false;
              }
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Logout error in handleLogout:", error);
      isLoggingOutRef.current = false;
    }
  }, [logout]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: t("home.title"),
          headerRight: () => <NotificationBell />,
          tabBarLabel: t("home.title"),
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons name="home" size={24} color="black" />
          ),
        }}
      />

      <Tabs.Screen
        name="Friends"
        options={{
          headerShown: false,
          tabBarLabel: t("home.friends"),
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color="black"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="AccountSettings/index"
        options={{
          headerRight: () => (
            <Button title={t("auth.logout")} onPress={handleLogout} color="#bf471b" />
          ),

          headerTitle: t("tabs.accountSettings"),
          tabBarLabel: t("tabs.settings"),
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <Ionicons name="settings-sharp" size={24} color="black" />
          ),
        }}
      />

      {/* Hidden tabs - accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="Library"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="BrowseBooks/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: t("tabs.browseBooks"),
        }}
      />

      <Tabs.Screen
        name="Borrowed/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: t("tabs.borrowedBooks"),
          headerRight: () => <NotificationBell />,
        }}
      />

      <Tabs.Screen
        name="Lending/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: t("tabs.lendingBooks"),
          headerRight: () => <NotificationBell />,
        }}
      />

      <Tabs.Screen
        name="MyReviews/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: t("tabs.myReviews"),
        }}
      />

      <Tabs.Screen
        name="ReadingList/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: t("tabs.readingList"),
        }}
      />
    </Tabs>
  );
}

export default function _Layout() {
  return <AppTabs />;
}

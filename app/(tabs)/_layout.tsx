import React, { useContext, useCallback, useRef } from "react";
import { Platform, Alert, TouchableOpacity } from "react-native";
import "../../global.css";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import NotificationBell from "@/components/NotificationBell";
import { Colors } from "@/constants/Colors";

function AppTabs() {
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
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (confirmed) {
          await logout();
        }
      } else {
        Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              isLoggingOutRef.current = false;
            },
          },
          {
            text: "Yes",
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          paddingBottom: 4,
          paddingTop: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: Colors.white,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: "700",
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Home",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Library"
        options={{
          headerTitle: "Library",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Library",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="bank-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Borrowed/index"
        options={{
          headerTitle: "Borrowed",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Borrowed",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-arrow-down"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Lending/index"
        options={{
          headerTitle: "Lending",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Lending",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-arrow-up"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="MyReviews/index"
        options={{
          headerTitle: "My Reviews",
          tabBarLabel: "Reviews",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="star-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ReadingList/index"
        options={{
          headerTitle: "Reading List",
          tabBarLabel: "Reading",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="BrowseBooks/index"
        options={{
          headerTitle: "Browse Books",
          tabBarLabel: "Browse",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-search"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Friends"
        options={{
          headerTitle: "Friends",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Friends",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="AccountSettings/index"
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16, padding: 4 }}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          ),
          headerTitle: "Account Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function _Layout() {
  return <AppTabs />;
}

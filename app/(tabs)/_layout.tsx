// app/(tabs)/_layout.tsx

import React, { useContext, useCallback, useRef } from "react";
import { Platform, Alert, Button } from "react-native";
import "../../global.css";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Tabs, Redirect } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import NotificationBell from "@/components/NotificationBell";

function AppTabs() {
  // CRITICAL: All hooks must be called before any conditional returns
  // This ensures React hooks are called in the same order every render
  const authContext = useContext(AuthContext);
  const { logout, isLoggedIn } = authContext || {
    logout: () => {},
    isLoggedIn: false,
  };
  const isLoggingOutRef = useRef(false);

  const handleLogout = useCallback(async () => {
    // Prevent multiple simultaneous logout calls
    if (isLoggingOutRef.current) {
      console.log("⏳ Logout already in progress, skipping...");
      return;
    }

    isLoggingOutRef.current = true;

    try {
      if (Platform.OS === "web") {
        const confirmed = window.confirm("Are you sure you want to log out?");
        if (confirmed) {
          // logout() handles navigation internally
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
                // logout() handles navigation internally
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

  // After all hooks are called, check if logged in
  // If not logged in, return null to prevent Tabs from rendering
  // This prevents the "Maximum update depth exceeded" error
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Home",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Home",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="Library"
        options={{
          headerTitle: "Library",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Library",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="bank-outline"
              size={24}
              color="black"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Exchanges/index"
        options={{
          headerTitle: "Exchanges",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Exchanges",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={24}
              color="black"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="MyReviews/index"
        options={{
          headerTitle: "My Reviews",
          tabBarLabel: "My Reviews",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="star-outline"
              size={24}
              color="black"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ReadingList/index"
        options={{
          headerTitle: "Reading List",
          tabBarLabel: "Reading List",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color="black"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="BrowseBooks/index"
        options={{
          headerTitle: "Browse Books",
          tabBarLabel: "Browse",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="book-search"
              size={24}
              color="black"
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
            <Button title="Logout" onPress={handleLogout} color="#bf471b" />
          ),

          headerTitle: "Account Settings",
          tabBarLabel: "",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <Ionicons name="settings-sharp" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}

export default function _Layout() {
  // This layout is only rendered when the (tabs) route is active
  // The HomeScreen redirect will handle navigation away when logged out
  // We don't check auth here to avoid re-render loops
  return <AppTabs />;
}

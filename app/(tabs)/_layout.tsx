import React, { useContext, useCallback, useRef } from "react";
import { Platform, Alert, Button } from "react-native";
import "../../global.css";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Tabs, Redirect } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import NotificationBell from "@/components/NotificationBell";
import { theme } from "@/constants/theme";

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

  const tabBarColor = theme.colors.primary[500];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarColor,
        tabBarInactiveTintColor: theme.colors.neutral[500],
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          backgroundColor: "#fff",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: "Home",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "home" : "home-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Library"
        options={{
          headerTitle: "My Library",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Library",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "bookshelf" : "book-outline"}
              size={28}
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "book-search" : "book-search-outline"}
              size={28}
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account-group" : "account-group-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="AccountSettings/index"
        options={{
          headerRight: () => (
            <Button title="Logout" onPress={handleLogout} color={tabBarColor} />
          ),
          headerTitle: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden tabs - accessible through navigation but not visible in tab bar */}
      <Tabs.Screen
        name="Borrowed/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: "Borrowed Books",
          headerRight: () => <NotificationBell />,
        }}
      />

      <Tabs.Screen
        name="Lending/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: "Lending Books",
          headerRight: () => <NotificationBell />,
        }}
      />

      <Tabs.Screen
        name="MyReviews/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: "My Reviews",
        }}
      />

      <Tabs.Screen
        name="ReadingList/index"
        options={{
          href: null, // Hide from tab bar
          headerTitle: "Reading List",
        }}
      />
    </Tabs>
  );
}

export default function _Layout() {
  return <AppTabs />;
}

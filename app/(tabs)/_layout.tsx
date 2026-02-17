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
        tabBarActiveTintColor: "#667eea",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 4,
        },
        headerTintColor: "#333",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
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
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Library"
        options={{
          headerTitle: "Library",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Library",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "library" : "library-outline"}
              size={26}
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "book-arrow-down" : "book-arrow-down-outline"}
              size={26}
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "book-arrow-up" : "book-arrow-up-outline"}
              size={26}
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "star" : "star-outline"}
              size={26}
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
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "book-open-page-variant" : "book-open-variant"}
              size={26}
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
              size={26}
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
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="AccountSettings/index"
        options={{
          headerRight: () => (
            <Button title="Logout" onPress={handleLogout} color="#667eea" />
          ),
          headerTitle: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function _Layout() {
  return <AppTabs />;
}

import React, { useContext, useCallback, useRef } from "react";
import { Platform, Alert, Button } from "react-native";
import "../../global.css";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Tabs } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
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
          headerShown: false,
          tabBarLabel: "Library",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="bookshelf"
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
          headerShown: false,
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
          tabBarLabel: "Settings",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <Ionicons name="settings-sharp" size={24} color="black" />
          ),
        }}
      />

      {/* Hidden tabs - accessible via navigation but not in tab bar */}
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

import React, { useContext, useCallback, useRef } from "react";
import { Platform, Alert, Button, TouchableOpacity, View } from "react-native";
import "../../global.css";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Tabs, Redirect } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
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
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.lightGray,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomColor: Colors.lightGray,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Library"
        options={{
          headerTitle: "My Library",
          headerRight: () => <NotificationBell />,
          tabBarLabel: "Library",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="bookshelf"
              size={size}
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="book-search"
              size={size}
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
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={size}
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
              style={{
                marginRight: 16,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: Colors.primary,
                borderRadius: 8,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.surface} />
            </TouchableOpacity>
          ),

          headerTitle: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden tabs - still accessible via navigation but not in tab bar */}
      <Tabs.Screen
        name="Borrowed/index"
        options={{
          href: null, // Hides from tab bar
          headerTitle: "Borrowed Books",
          headerRight: () => <NotificationBell />,
        }}
      />

      <Tabs.Screen
        name="Lending/index"
        options={{
          href: null, // Hides from tab bar
          headerTitle: "Lending Books",
          headerRight: () => <NotificationBell />,
        }}
      />

      <Tabs.Screen
        name="MyReviews/index"
        options={{
          href: null, // Hides from tab bar
          headerTitle: "My Reviews",
        }}
      />

      <Tabs.Screen
        name="ReadingList/index"
        options={{
          href: null, // Hides from tab bar
          headerTitle: "Reading List",
        }}
      />
    </Tabs>
  );
}

export default function _Layout() {
  return <AppTabs />;
}

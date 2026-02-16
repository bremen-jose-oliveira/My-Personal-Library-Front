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
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#bf471b',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
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
          tabBarIcon: ({ focused, color }) => (
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
          tabBarIcon: ({ focused, color }) => (
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
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name="book-arrow-down"
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
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name="book-arrow-up"
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
          tabBarIcon: ({ focused, color }) => (
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
          tabBarIcon: ({ focused, color }) => (
            <MaterialCommunityIcons
              name="book-open-variant"
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
          tabBarIcon: ({ focused, color }) => (
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
          tabBarIcon: ({ focused, color }) => (
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
            <Button title="Logout" onPress={handleLogout} color="#bf471b" />
          ),

          headerTitle: "Account Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ focused, color }) => (
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

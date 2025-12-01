// app/_layout.tsx

import React, { useContext } from "react";
import { Platform, Alert, Button } from "react-native";
import "../../global.css";
import { AuthContext, AuthProvider } from "@/utils/Context/AuthContext";
import { BookProvider } from "@/utils/Context/BookContext";
import { Tabs, router } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import NotificationBell from "@/components/NotificationBell";

function AppTabs() {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        logout();
        router.push("/Login");
      }
    } else {
      Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            logout();
            router.push("/Login");
            router.dismissAll();
          },
        },
      ]);
    }
  };

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
            <MaterialCommunityIcons name="bank-outline" size={24} color="black" />
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
          tabBarIcon: () => <MaterialCommunityIcons name="swap-horizontal" size={24} color="black" />,
        }}
      />

      <Tabs.Screen
        name="MyReviews/index"
        options={{
          headerTitle: "My Reviews",
          tabBarLabel: "My Reviews",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => <MaterialCommunityIcons name="star-outline" size={24} color="black" />,
        }}
      />

      <Tabs.Screen
        name="ReadingList/index"
        options={{
          headerTitle: "Reading List",
          tabBarLabel: "Reading List",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => <MaterialCommunityIcons name="book-open-variant" size={24} color="black" />,
        }}
      />

      <Tabs.Screen
        name="BrowseBooks/index"
        options={{
          headerTitle: "Browse Books",
          tabBarLabel: "Browse",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => <MaterialCommunityIcons name="book-search" size={24} color="black" />,
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
            <MaterialCommunityIcons name="account-group" size={24} color="black" />
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
  return <AppTabs />;
}

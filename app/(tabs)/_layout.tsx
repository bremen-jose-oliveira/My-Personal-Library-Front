// app/_layout.tsx

import React, { useContext } from "react";
import { Platform, Alert, Button } from "react-native";
import "../../global.css";
import { AuthContext, AuthProvider } from "@/utils/Context/AuthContext";
import { BookProvider } from "@/utils/Context/BookContext";
import { Tabs, router } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

function AppTabs() {
  const { logout } = useContext(AuthContext); // Use context here after it's properly initialized

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
          tabBarLabel: "Home",
          tabBarActiveTintColor: "#bf471b",
          headerRight: () => (
            <Button title="Logout" onPress={handleLogout} color="#bf471b" />
          ),
          tabBarIcon: () => (
            <MaterialCommunityIcons name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="DisplayBooks/index"
        options={{
          headerTitle: "My books",
          tabBarLabel: "My Books",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons name="bookshelf" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="AddBookForm/index"
        options={{
          headerTitle: "Add a book",
          tabBarLabel: "Add a Book",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons name="book-plus-multiple" size={24} color="black" />
          ),
        }}
      />
          <Tabs.Screen
        name="UserProfile/index"
        options={{
          headerTitle: "Profile",
          tabBarLabel: "Profile",
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <FontAwesome name="user" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
    
  );
}

export default function _Layout() {
  return <AppTabs />;
}

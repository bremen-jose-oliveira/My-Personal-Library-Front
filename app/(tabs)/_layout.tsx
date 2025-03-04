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
        name="Library"
        options={{
          headerTitle: "Library", 
          tabBarLabel: "Library", 
          tabBarActiveTintColor: "#bf471b",
          tabBarIcon: () => (
            <MaterialCommunityIcons name="bank-outline" size={24} color="black" />
          ),
        }}
      />
  
            <Tabs.Screen
        name="Friends"
        options={{
          headerTitle: "Friends",
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

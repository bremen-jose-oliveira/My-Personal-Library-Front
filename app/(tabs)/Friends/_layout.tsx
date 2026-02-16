import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function FriendsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="FriendList/index"
        options={{
          tabBarLabel: "Friend List",
          headerTitle: "Friend List",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AddFriend/index"
        options={{
          tabBarLabel: "Add Friend",
          headerTitle: "Add Friend",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-plus" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="FriendRequests/index"
        options={{
          tabBarLabel: "Requests",
          headerTitle: "Requests",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="envelope-o" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

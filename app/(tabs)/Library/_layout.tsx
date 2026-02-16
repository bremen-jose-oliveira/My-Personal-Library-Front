import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function BooksLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="DisplayBooks/index"
        options={{
          tabBarLabel: "My Books",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bookshelf" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="AddBookForm/index"
        options={{
          tabBarLabel: "Add a Book",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="book-plus-multiple"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

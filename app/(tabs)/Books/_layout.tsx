import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";

export default function BooksLayout() {
  return (
       <Tabs>
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
            <MaterialCommunityIcons
              name="book-plus-multiple"
              size={24}
              color="black"
            />
          ),
        }}
      />
    </Tabs>
  );
}

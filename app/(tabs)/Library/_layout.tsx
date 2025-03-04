import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DisplayBooks from "./DisplayBooks/index";
import AddBookForm from "./AddBookForm/index";
import { Stack, Tabs } from "expo-router";



export default function BooksLayout() {
  return (

       
    <Tabs screenOptions={{ headerShown: false }}>
         <Tabs.Screen
        name="DisplayBooks/index"
     
        options={{
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

          tabBarActiveTintColor: "#bf471b",
          tabBarLabel: "Add a Book",
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

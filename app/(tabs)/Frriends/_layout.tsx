import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";

export default function FriendsLayout() {
  return (
       <Tabs>
         <Tabs.Screen
        name="Friends/index"
        options={{
          title: "Friend List",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      

       </Tabs>
  );
}

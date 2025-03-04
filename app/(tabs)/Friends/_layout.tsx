import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FriendList from "./FriendList/index";



export default function FriendsLayout() {
  return (

    

     

    <Tabs screenOptions={{ headerShown: false }}>
         <Tabs.Screen
        name="FriendList/index"
        
        options={{
          tabBarLabel: "Friend List",
          headerTitle: "Friend List",
         
          tabBarActiveTintColor: "#bf471b",
         
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
               <Tabs.Screen
        name="AddFriend/index"
        
        options={{
          tabBarLabel: "Add Friend ",
          headerTitle: "Add Friend",
         
          tabBarActiveTintColor: "#bf471b",
         
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-plus" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="FriendRequests/index"
        
        options={{
          tabBarLabel: "Requests",
          headerTitle: "Requests",
   
         
          tabBarActiveTintColor: "#bf471b",
         
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-plus" size={size} color={color} />
          ),
        }}
      />
      

       </Tabs>
  );
}

// app/_layout.tsx

import React, { useContext } from 'react';
import { Platform } from 'react-native';
import "../../global.css";
import { AuthContext, AuthProvider } from '@/utils/Context/AuthContext';
import { BookProvider } from '@/utils/Context/BookContext';
import { router, Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Alert, Button } from 'react-native';


export default function _Layout() {
  const authContext = useContext(AuthContext);

  const { logout } = authContext;


  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        logout();
        router.push("/Login");
      }
    } else {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Yes", 
            onPress: () => {
              logout();
              router.push("/Login");
            } 
          }
        ]
      );
    }
  };

  return (
    <AuthProvider>
      <BookProvider>
        <Tabs >
        <Tabs.Screen name='index' 
            options={{
              headerTitle:"Home",
              tabBarLabel:"Home",
              headerRight: ()=> <Button title="Logout" onPress={handleLogout} />
           
              }} 
  
          />

        <Tabs.Screen name='DisplayBooks/index' 
        options={{
          headerTitle:"My books",

          tabBarLabel:"My Books",
          tabBarIcon: ()=> (<MaterialCommunityIcons name="bookshelf" size={24} color="black" />),
         

          }} 
          />

        <Tabs.Screen name='AddBookForm/index' 
        options={{
          headerTitle:"Add a book",
          tabBarLabel:"Add a Book",
          tabBarIcon: ()=> (<Entypo name="add-to-list" size={24} color="black" />)
          }} />
        </Tabs>
      </BookProvider>
    </AuthProvider>
  );
}
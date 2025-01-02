import { useContext, useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Make sure this import is correct
import React from 'react';
import { Link, useRouter } from 'expo-router';
import "../../global.css";
import { AuthContext } from '@/utils/Context/AuthContext';




export default function Login({ navigation }: any) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); 

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    try {
      await login(username, password);
       router.push("/(tabs)")

    } catch (error) {
      Alert.alert('Error', 'Failed to log in');
    }
  };

  return (
  <>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',  backgroundColor:"white"}}>
      <View className='mt-5 mx-5'>
        <View>
          <Text className='text-gray-400'>Username:</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder='Enter Username...'
            className='border border-dotted p-2 text-gray-500 border-blue-400 mt-1'
          />
        </View>
        <View className='mt-3'>
          <Text className='text-gray-400'>PASSWORD:</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder='Enter Password...'
            className='border text-gray-500 border-dotted p-2 border-blue-400 mt-1'
          />
        </View>

        <TouchableOpacity 
          className='bg-blue-300 p-3 mt-4'
          onPress={handleLogin} // Call the login function on press
        >
          <Text className='text-center text-base text-white'>Login</Text>
        </TouchableOpacity>

    

        <View className='mt-6 flex-row justify-center'>
          <Text className=''>New to the Library ? </Text>
          
            

          <Link href="/Register">
          <Text className='text-blue-500' >Create an Account</Text>
          </Link>
        </View>
      </View>
      </View>
      </>
  );
}

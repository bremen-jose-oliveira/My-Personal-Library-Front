import { AuthContext } from '@/utils/Context/AuthContext';
import { router } from 'expo-router';
import React, { useState, useContext } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';


export default function Register() {
  const { createUser } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    try {
      await createUser(username, email, password);
      router.push("/")
    } catch (error) {
      Alert.alert('Error', 'Failed to register');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',  backgroundColor:"white"}}>
    <View className='mt-5 mx-5'>
      <Text className='text-gray-400'>Username:</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder='Enter Username...'
        className='border p-2 text-gray-500 border-blue-400 mt-1'
      />
      <Text className='text-gray-400 mt-3'>Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder='Enter Email...'
        className='border p-2 text-gray-500 border-blue-400 mt-1'
      />
      <Text className='text-gray-400 mt-3'>Password:</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder='Enter Password...'
        className='border p-2 text-gray-500 border-blue-400 mt-1'
      />
      <TouchableOpacity className='bg-blue-300 p-3 mt-4' onPress={handleRegister}>
        <Text className='text-center text-base text-white'>Register</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

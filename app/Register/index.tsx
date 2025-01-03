import { AuthContext } from '@/utils/Context/AuthContext';
import { router } from 'expo-router';
import React, { useState, useContext } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

export default function Register() {
  const { createUser } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(''); // for confirming passwords

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return; // Prevent further action if passwords don't match
    }

    try {
      await createUser(username, email, password);
      router.push("/"); // Redirect to home after successful registration
    } catch (error) {
      Alert.alert('Error', 'Failed to register');
    }
  };

  return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <View style={{ margin: 20, width: '80%' }}>
        <Text>Choose a Username:</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder='Enter Username...'
          style={{ borderWidth: 1, padding: 10, marginTop: 5, borderColor: '#ccc' }}
        />

        <Text>Email:</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder='Enter Email...'
          style={{ borderWidth: 1, padding: 10, marginTop: 5, borderColor: '#ccc' }}
        />

        <Text>Password:</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder='Enter Password...'
          style={{ borderWidth: 1, padding: 10, marginTop: 5, borderColor: '#ccc' }}
        />

        <Text>Confirm Password:</Text>
        <TextInput
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder='Confirm Password...'
          style={{ 
            borderWidth: 1, 
            padding: 10, 
            marginTop: 5, 
            borderColor: passwordError ? 'red' : '#ccc' 
          }}
        />
        {passwordError ? (
          <Text style={{ color: 'red', marginTop: 5 }}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity
          style={{ backgroundColor: 'blue', padding: 15, marginTop: 20 }}
          onPress={handleRegister}
        >
          <Text style={{ textAlign: 'center', color: 'white' }}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

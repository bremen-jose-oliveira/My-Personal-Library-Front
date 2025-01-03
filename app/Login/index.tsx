import { useContext, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '@/utils/Context/AuthContext';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const router = useRouter();

  const handleLogin = async () => {
 
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    try {
      await login(username, password);
      router.push('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'Failed to log in');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
 <View style={{ margin: 20, width: '80%' }}>
          <Text>Username:</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder='Enter Username...'
            style={{ borderWidth: 1, padding: 10, marginTop: 5 }}
          />

          <Text style={{ marginTop: 20 }}>Password:</Text>
          <TextInput
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            placeholder='Enter Password...'
            style={{ borderWidth: 1, padding: 10, marginTop: 5 }}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Text>{secureText ? 'Show Password' : 'Hide Password'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: 'blue', padding: 15, marginTop: 20 }}
            onPress={handleLogin}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Login</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text>New to the Library? </Text>
            <TouchableOpacity onPress={() => router.push('/Register')}>
              <Text style={{ color: 'blue' }}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

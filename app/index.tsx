// app/index.tsx
import { Link } from 'expo-router';
import { View, Text, Button } from 'react-native';
import "../global.css";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Welcome to the Book Collection App!</Text>
    </View>
  );
}
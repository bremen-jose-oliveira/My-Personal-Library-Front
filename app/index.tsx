// app/index.tsx
import { Link } from 'expo-router';
import { View, Text, Button } from 'react-native';

export default function HomeScreen() {
  return (
    <View >
      <Text >Welcome to the Library App</Text>
      <Link href="/AddBookForm">
        <Button title="Add a New Book" color="#1E40AF" />
      </Link>
      <Link href="/DisplayBooks">
        <Button title="View Book List" color="#1E40AF"  />
      </Link>
    </View>
  );
}

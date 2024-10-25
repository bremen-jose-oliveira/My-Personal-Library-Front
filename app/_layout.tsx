import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <Stack>
   <Stack.Screen name="index" options={{ title: 'Home' }} />
   <Stack.Screen name="/AddBookForm" options={{ title: 'AddBookForm' }} />
   <Stack.Screen name="/DisplayBooks" options={{ title: 'DisplayBooks' }} />
  </Stack>
  );
}

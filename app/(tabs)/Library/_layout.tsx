import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="DisplayBooks/index"
        options={{
          headerTitle: "My Books",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="AddBookForm/index"
        options={{
          headerTitle: "Add a Book",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

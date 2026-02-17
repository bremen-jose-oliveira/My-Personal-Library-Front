import { Stack } from "expo-router";

export default function FriendsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="FriendList/index"
        options={{
          headerTitle: "Friend List",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="AddFriend/index"
        options={{
          headerTitle: "Add Friend",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="FriendRequests/index"
        options={{
          headerTitle: "Friend Requests",
          headerShown: true,
        }}
      />
    </Stack>
  );
}

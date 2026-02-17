import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Button,
  RefreshControl,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

export default function FriendList() {
  const { friends, removeFriend, fetchCurrentUserFriends } = useFriendContext();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCurrentUserFriends();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUserFriends();
    } catch (error) {
      console.error("Error refreshing books:", error);
    }
    setRefreshing(false); // Ensure this happens last
  };
  const handleRemoveFriend = (id: number) => {
    if (Platform.OS === "web") {
      // Web-specific alert
      if (window.confirm("Are you sure you want to delete this book?")) {
        removeFriend(id);
      }
    } else {
      Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => removeFriend(id),
          style: "destructive",
        },
      ]);
    }
  };

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
        <FlatList
          data={friends}
          keyExtractor={(friend) =>
            friend.id ? friend.id.toString() : Math.random().toString()
          }
          renderItem={({ item: friend }) => (
            <View
              style={{
                flexDirection: "row",
                marginTop: 3,
                padding: 1,
                borderRadius: 12,
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.95)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {friend.profilePicture ? (
                <Image
                  style={{ width: 100, height: 144 }}
                  source={{ uri: friend.profilePicture }}
                />
              ) : (
                <View
                  style={{
                    width: 100,
                    height: 144,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                    backgroundColor: "#d1d5db",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#666",
                      fontSize: 12,
                      lineHeight: 16,
                      textAlign: "center",
                    }}
                  >
                    No Image Available
                  </Text>
                </View>
              )}

              <View style={{ flex: 1, justifyContent: "space-around" }}>
                <TouchableOpacity
                  onPress={() => {
                    const friendEmail = friend.email || friend.friendEmail;
                    if (friendEmail) {
                      router.push(
                        `/FriendBooks/${encodeURIComponent(friendEmail)}`
                      );
                    } else {
                      Alert.alert("Error", "Friend email not available");
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    Name:{" "}
                    {friend.name
                      ? friend.name
                      : friend.email || friend.friendEmail}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    Email:{" "}
                    {friend.email || friend.friendEmail || "No Email Provided"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#667eea",
                      marginTop: 8,
                      textDecorationLine: "underline",
                    }}
                  >
                    View{" "}
                    {friend.name ||
                      friend.email ||
                      friend.friendEmail ||
                      "Friend"}
                    's Books →
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Remove Friend"
                  onPress={() => handleRemoveFriend(friend.id)}
                  color="#667eea"
                />
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
              colors={["#ffffff"]}
            />
          }
          keyboardShouldPersistTaps="handled"
        />
    </LinearGradient>
  );
}

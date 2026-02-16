import { useFriendContext } from "@/utils/Context/FriendContext";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

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
    setRefreshing(false);
  };
  const handleRemoveFriend = (id: number) => {
    if (Platform.OS === "web") {
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
    <View style={styles.container}>
      <FlatList
        data={friends}
        contentContainerStyle={styles.listContent}
        keyExtractor={(friend) =>
          friend.id ? friend.id.toString() : Math.random().toString()
        }
        renderItem={({ item: friend }) => (
          <View style={styles.card}>
            {friend.profilePicture ? (
              <Image
                style={styles.profileImage}
                source={{ uri: friend.profilePicture }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image Available</Text>
              </View>
            )}

            <View style={styles.cardContent}>
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
                <Text style={styles.nameText}>
                  Name:{" "}
                  {friend.name
                    ? friend.name
                    : friend.email || friend.friendEmail}
                </Text>
                <Text style={styles.emailText}>
                  Email:{" "}
                  {friend.email || friend.friendEmail || "No Email Provided"}
                </Text>
                <Text style={styles.linkText}>
                  View{" "}
                  {friend.name ||
                    friend.email ||
                    friend.friendEmail ||
                    "Friend"}
                  's Books →
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFriend(friend.id)}
              >
                <Text style={styles.removeButtonText}>Remove Friend</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 144,
  },
  placeholderImage: {
    width: 100,
    height: 144,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-around",
    padding: 12,
  },
  nameText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 8,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: Colors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  removeButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});

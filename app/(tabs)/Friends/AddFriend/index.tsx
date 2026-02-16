import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";
import { useFriendContext } from "@/utils/Context/FriendContext";
import { FetchAllUsers, FetchAllUsersBySearchParam } from "@/utils/Users";
import type { UserSummary } from "@/Interfaces/user";
import { Colors } from "@/constants/Colors";

interface UserWithProfilePicture extends UserSummary {
  profilePicture?: string;
}

const AddFriend = () => {
  const { addFriend } = useFriendContext();
  const [friendEmail, setFriendEmail] = useState("");
  const [friends, setFriends] = useState<UserWithProfilePicture[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserWithProfilePicture[]>(
    []
  );
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  const handleAddFriendByEmail = async () => {
    if (!friendEmail) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    try {
      setIsAddingFriend(true);
      await addFriend(friendEmail);
      Alert.alert("Success", "Friend added successfully!");
      setFriendEmail("");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to add friend. Please try again.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleAddFriendFromSearch = async (friend: UserWithProfilePicture) => {
    try {
      setIsAddingFriend(true);
      await addFriend(friend.email);
      console.log("Payload to be sent:", JSON.stringify(friend.email));
      Alert.alert("Success", "Friend added successfully!");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to add friend. Please try again.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      if (!searchQuery) return;
      try {
        const users = await FetchAllUsersBySearchParam(searchQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    if (searchQuery.length > 2) {
      fetchFriends();
    }
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <TextInput
          value={friendEmail}
          onChangeText={setFriendEmail}
          placeholder="Enter friend's email"
          placeholderTextColor={Colors.placeholder}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleAddFriendByEmail}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Add Friend by Email</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by username or email"
          placeholderTextColor={Colors.placeholder}
          style={styles.input}
        />
        <FlatList
          data={searchResults}
          keyExtractor={(friend) =>
            friend.id ? friend.id.toString() : Math.random().toString()
          }
          renderItem={({ item: friend }) => (
            <View style={styles.resultCard}>
              {friend?.profilePicture ? (
                <Image
                  style={styles.profileImage}
                  source={{ uri: friend.profilePicture }}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Image Available</Text>
                </View>
              )}
              <View style={styles.resultContent}>
                <Text style={styles.nameText}>
                  Name: {friend?.username}
                </Text>
                <Text style={styles.emailText}>
                  Email: {friend?.email}
                </Text>
                <TouchableOpacity
                  onPress={() => handleAddFriendFromSearch(friend)}
                  style={styles.addButton}
                >
                  <Text style={styles.addButtonText}>Add Friend</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  formCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    height: 48,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
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
  resultContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: 12,
  },
  nameText: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  emailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
});

export default AddFriend;

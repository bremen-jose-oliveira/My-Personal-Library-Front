import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from "expo-linear-gradient";
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
  TextInput,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FetchAllUsersBySearchParam } from "@/utils/Users";
import type { UserSummary } from "@/Interfaces/user";

interface UserWithProfilePicture extends UserSummary {
  profilePicture?: string;
}

type TabType = "list" | "add" | "requests";

export default function FriendsScreen() {
  const {
    friends,
    friendRequests,
    removeFriend,
    addFriend,
    fetchCurrentUserFriends,
    fetchFriendRequests,
    approveFriendRequest,
    rejectFriendRequest,
  } = useFriendContext();

  const [activeTab, setActiveTab] = useState<TabType>("list");
  const [refreshing, setRefreshing] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserWithProfilePicture[]>([]);
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [processing, setProcessing] = useState<string | number | null>(null);

  useEffect(() => {
    fetchCurrentUserFriends();
    fetchFriendRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchCurrentUserFriends(), fetchFriendRequests()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    }
    setRefreshing(false);
  };

  const handleRemoveFriend = (id: number) => {
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to remove this friend?")) {
        removeFriend(id);
      }
    } else {
      Alert.alert("Remove Friend", "Are you sure you want to remove this friend?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => removeFriend(id),
          style: "destructive",
        },
      ]);
    }
  };

  const handleAddFriendByEmail = async () => {
    if (!friendEmail) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    try {
      setIsAddingFriend(true);
      await addFriend(friendEmail);
      Alert.alert("Success", "Friend request sent!");
      setFriendEmail("");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to send friend request. Please try again.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleAddFriendFromSearch = async (friend: UserWithProfilePicture) => {
    try {
      setIsAddingFriend(true);
      await addFriend(friend.email);
      Alert.alert("Success", "Friend request sent!");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to send friend request. Please try again.");
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleApprove = async (friendEmail: string) => {
    setProcessing(friendEmail);
    try {
      await approveFriendRequest(friendEmail);
      Alert.alert("Success", "Friend request approved!");
      await fetchFriendRequests();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to approve friend request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (friendEmail: string) => {
    setProcessing(friendEmail);
    try {
      await rejectFriendRequest(friendEmail);
      Alert.alert("Success", "Friend request rejected.");
      await fetchFriendRequests();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject friend request");
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery || searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }
      try {
        const users = await FetchAllUsersBySearchParam(searchQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [searchQuery]);

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Tab Selector */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "rgba(255,255,255,0.2)",
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 16,
          borderRadius: 12,
          padding: 4,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            backgroundColor: activeTab === "list" ? "rgba(255,255,255,0.95)" : "transparent",
            borderRadius: 10,
          }}
          onPress={() => setActiveTab("list")}
        >
          <Text
            style={{
              color: activeTab === "list" ? "#667eea" : "#ffffff",
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            backgroundColor: activeTab === "add" ? "rgba(255,255,255,0.95)" : "transparent",
            borderRadius: 10,
          }}
          onPress={() => setActiveTab("add")}
        >
          <Text
            style={{
              color: activeTab === "add" ? "#667eea" : "#ffffff",
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            Add Friend
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            backgroundColor: activeTab === "requests" ? "rgba(255,255,255,0.95)" : "transparent",
            borderRadius: 10,
          }}
          onPress={() => setActiveTab("requests")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text
              style={{
                color: activeTab === "requests" ? "#667eea" : "#ffffff",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Requests
            </Text>
            {friendRequests.length > 0 && (
              <View
                style={{
                  backgroundColor: "#ef4444",
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 6,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                  {friendRequests.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === "list" && (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          data={friends}
          keyExtractor={(friend) => friend.id?.toString() || Math.random().toString()}
          renderItem={({ item: friend }) => (
            <View
              style={{
                flexDirection: "row",
                marginBottom: 12,
                padding: 12,
                borderRadius: 12,
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
                  style={{ width: 80, height: 80, borderRadius: 40, marginRight: 12 }}
                  source={{ uri: friend.profilePicture }}
                />
              ) : (
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    backgroundColor: "#d1d5db",
                  }}
                >
                  <MaterialCommunityIcons name="account" size={40} color="#666" />
                </View>
              )}

              <View style={{ flex: 1, justifyContent: "center" }}>
                <TouchableOpacity
                  onPress={() => {
                    const friendEmail = friend.email || friend.friendEmail;
                    if (friendEmail) {
                      router.push(`/FriendBooks/${encodeURIComponent(friendEmail)}`);
                    } else {
                      Alert.alert("Error", "Friend email not available");
                    }
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 4 }}>
                    {friend.name || friend.email || friend.friendEmail}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                    {friend.email || friend.friendEmail || "No Email"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#667eea",
                      textDecorationLine: "underline",
                    }}
                  >
                    View Books →
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => handleRemoveFriend(friend.id)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#ef4444",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                }}
              >
                <MaterialCommunityIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
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
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                marginTop: 40,
                padding: 20,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text style={{ color: "#333", fontSize: 16, textAlign: "center" }}>
                No friends yet.{"\n"}
                Add friends to connect and share books!
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      )}

      {activeTab === "add" && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
              colors={["#ffffff"]}
            />
          }
        >
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 16 }}>
              Add Friend by Email
            </Text>
            <TextInput
              value={friendEmail}
              onChangeText={setFriendEmail}
              placeholder="Enter friend's email"
              placeholderTextColor="#999"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: 10,
                padding: 12,
                fontSize: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#e9ecef",
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={handleAddFriendByEmail}
              disabled={isAddingFriend}
              style={{
                backgroundColor: "#667eea",
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: "center",
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {isAddingFriend ? "Sending..." : "Send Friend Request"}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 16 }}>
              Search Users
            </Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by email or username (min 3 chars)"
              placeholderTextColor="#999"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: 10,
                padding: 12,
                fontSize: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#e9ecef",
              }}
              autoCapitalize="none"
            />

            {searchResults.length > 0 && (
              <View>
                {searchResults.map((user) => (
                  <View
                    key={user.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: "#f0f0f0",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
                        {user.username || user.email}
                      </Text>
                      <Text style={{ fontSize: 14, color: "#666" }}>{user.email}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddFriendFromSearch(user)}
                      disabled={isAddingFriend}
                      style={{
                        backgroundColor: "#667eea",
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === "requests" && (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ffffff"
              colors={["#ffffff"]}
            />
          }
        >
          {friendRequests.length > 0 ? (
            friendRequests.map((request) => {
              const isProcessing = processing === request.friendEmail;
              return (
                <View
                  key={request.id}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 8 }}>
                    {request.username}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                    {request.friendEmail}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#999", marginBottom: 12 }}>
                    Status: {request.friendshipStatus}
                  </Text>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: "#22c55e",
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                      onPress={() => handleApprove(request.friendEmail)}
                      disabled={isProcessing}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                        {isProcessing ? "Processing..." : "Approve"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: "#ef4444",
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: "center",
                      }}
                      onPress={() => handleReject(request.friendEmail)}
                      disabled={isProcessing}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                        {isProcessing ? "Processing..." : "Reject"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View
              style={{
                alignItems: "center",
                marginTop: 40,
                padding: 20,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text style={{ color: "#333", fontSize: 16, textAlign: "center" }}>
                No pending friend requests.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

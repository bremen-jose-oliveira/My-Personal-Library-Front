import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Image,
  FlatList,
} from "react-native";
import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from "expo-linear-gradient";
import { FetchAllUsers, FetchAllUsersBySearchParam } from "@/utils/Users";
import type { UserSummary } from "@/Interfaces/user";
import { useTranslation } from "react-i18next";

interface UserWithProfilePicture extends UserSummary {
  profilePicture?: string;
}

const AddFriend = () => {
  const { t } = useTranslation();
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
      Alert.alert(t("addFriend.validationError"), t("addFriend.enterValidEmail"));
      return;
    }

    try {
      setIsAddingFriend(true);
      await addFriend(friendEmail);
      Alert.alert(t("common.success"), t("addFriend.friendAddedSuccess"));
      setFriendEmail("");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert(t("common.error"), t("addFriend.failedToAdd"));
    } finally {
      setIsAddingFriend(false); // Reset loading state
    }
  };

  // Add friend from the search results
  const handleAddFriendFromSearch = async (friend: UserWithProfilePicture) => {
    try {
      setIsAddingFriend(true); // Set loading state
      await addFriend(friend.email);
      console.log("Payload to be sent:", JSON.stringify(friend.email));
      Alert.alert(t("common.success"), t("addFriend.friendAddedSuccess"));
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert(t("common.error"), t("addFriend.failedToAdd"));
    } finally {
      setIsAddingFriend(false);
    }
  };

  // Search for users by email or username
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
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.8)"]}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Search results display */}

        <View
          style={{
            flex: 1,
            width: "90%",
            padding: 20,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            borderRadius: 8,
          }}
        >
          {/* Email Input for adding a friend */}
          <TextInput
            value={friendEmail}
            onChangeText={setFriendEmail}
            placeholder={t("addFriend.placeholder")}
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              paddingHorizontal: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <TouchableOpacity
            onPress={handleAddFriendByEmail}
            style={{
              backgroundColor: "#bf471b",
              padding: 10,
              marginBottom: 40,
              borderRadius: 5,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>
              {t("addFriend.addByEmail")}
            </Text>
          </TouchableOpacity>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("addFriend.searchPlaceholder")}
            style={{
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              marginBottom: 20,
              paddingHorizontal: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <FlatList
            data={searchResults}
            keyExtractor={(friend) =>
              friend.id ? friend.id.toString() : Math.random().toString()
            }
            renderItem={({ item: friend }) => (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 3,
                  padding: 1,
                  borderRadius: 10,
                  width: "100%",
                  backgroundColor: "rgba(0,0,0,0.4)",
                }}
              >
                {friend?.profilePicture ? (
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
                        color: "#f0dcc7",
                        fontSize: 12,
                        lineHeight: 16,
                        textAlign: "center",
                      }}
                    >
                      {t("books.noCover")}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#f0dcc7",
                    }}
                  >
                    {t("friendList.name")} {friend?.username}
                  </Text>
                  <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                    {t("friendList.email")} {friend?.email}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleAddFriendFromSearch(friend)}
                    style={{
                      backgroundColor: "#bf471b",
                      padding: 10,
                      borderRadius: 5,
                      alignItems: "center",
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 16 }}>
                      {t("friendList.addFriend")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default AddFriend;

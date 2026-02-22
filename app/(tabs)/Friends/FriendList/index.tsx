import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Button,
  RefreshControl,
  Alert,
  Platform,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function FriendList() {
  const { t } = useTranslation();
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
      if (window.confirm(t("friendList.removeFriendConfirm"))) {
        removeFriend(id);
      }
    } else {
      Alert.alert(t("friendList.removeFriend"), t("friendList.removeFriendConfirm"), [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          onPress: () => removeFriend(id),
          style: "destructive",
        },
      ]);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={{
        flex: 1, // Take full screen
        width: "100%", // Make sure it spans full width
        height: "100%", // Make sure it spans full height
        justifyContent: "center", // Center content vertically
        alignItems: "center", // Center content horizontally
      }}
      resizeMode="cover" // Ensures the image covers the screen
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: "flex-start",
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
                borderRadius: 10,
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
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

              <View style={{ flex: 1, justifyContent: "space-around" }}>
                <TouchableOpacity
                  onPress={() => {
                    const friendEmail = friend.email || friend.friendEmail;
                    if (friendEmail) {
                      router.push(
                        `/FriendBooks/${encodeURIComponent(friendEmail)}`
                      );
                    } else {
                      Alert.alert(t("common.error"), t("friends.friendEmailNotAvailable"));
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#f0dcc7",
                    }}
                  >
                    {t("friendList.name")}{" "}
                    {friend.name
                      ? friend.name
                      : friend.email || friend.friendEmail}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#f0dcc7",
                    }}
                  >
                    {t("friendList.email")}{" "}
                    {friend.email || friend.friendEmail || t("friendList.noEmail")}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#bf471b",
                      marginTop: 8,
                      textDecorationLine: "underline",
                    }}
                  >
                    {t("friendList.viewBooks", {
                      name: friend.name || friend.email || friend.friendEmail || "Friend",
                    })}
                  </Text>
                </TouchableOpacity>

                <Button
                  title={t("friendList.removeFriend")}
                  onPress={() => handleRemoveFriend(friend.id)}
                  color="#bf471b"
                />
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#f0dcc7", fontSize: 16 }}>{t("friendList.empty")}</Text>
            </View>
          }
        />
        {/* Floating Action Buttons */}
        <View
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/Friends/FriendRequests")}
            style={{
              backgroundColor: "#2196F3",
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <MaterialCommunityIcons name="account-clock" size={28} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/Friends/AddFriend")}
            style={{
              backgroundColor: "#bf471b",
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <MaterialCommunityIcons name="account-plus" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

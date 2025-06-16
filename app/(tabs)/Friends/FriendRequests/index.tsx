import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, ImageBackground, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from "expo-linear-gradient";

export default function FriendshipRequests() {
  const { friendRequests, fetchFriendRequests, approveFriendRequest, rejectFriendRequest } = useFriendContext();
    const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFriendRequests();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    await   fetchFriendRequests();
    setRefreshing(false);
  };



  return (
    <ImageBackground
      source={require("@/assets/images/Background.jpg")}
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
    <ScrollView
  style={{ width: "100%" }}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
>
  {friendRequests.length > 0 ? (
    friendRequests.map((request) => (
      <View
        key={request.id}
        style={{
          flexDirection: "row",
          marginTop: 3,
          padding: 10,
          marginHorizontal: 10,
          borderRadius: 10,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#f0dcc7" }}>
            Request From - {request.username}
          </Text>
          <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
            With the Email - {request.friendEmail}
          </Text>
          <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
            Request is: {request.friendshipStatus}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Button
              title="Approve"
              onPress={() => approveFriendRequest(request.friendEmail)}
              color="#4CAF50"
            />
            <Button
              title="Reject"
              onPress={() => rejectFriendRequest(request.friendEmail)}
              color="#F44336"
            />
          </View>
        </View>
      </View>
    ))
  ) : (
    <Text style={{ fontSize: 20, textAlign: 'center', color: "#f0dcc7", marginTop: 20 }}>
      No pending friendship requests.
    </Text>
  )}
</ScrollView>
             
      </LinearGradient>
    </ImageBackground>
  );
}

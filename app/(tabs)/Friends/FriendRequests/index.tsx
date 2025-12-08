import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ImageBackground, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from "expo-linear-gradient";

export default function FriendshipRequests() {
  const { friendRequests, fetchFriendRequests, approveFriendRequest, rejectFriendRequest } = useFriendContext();
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriendRequests();
    setRefreshing(false);
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

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={styles.gradientOverlay}
      >
        <Text style={styles.header}>Friend Requests</Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bf471b" />
          }
        >
          {friendRequests.length > 0 ? (
            friendRequests.map((request) => {
              const isProcessing = processing === request.friendEmail;
              return (
                <View key={request.id} style={styles.requestCard}>
                  <Text style={styles.requestTitle}>
                    Request From: {request.username}
                  </Text>
                  <Text style={styles.detailText}>
                    Email: {request.friendEmail}
                  </Text>
                  <Text style={styles.detailText}>
                    Status: {request.friendshipStatus}
                  </Text>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.button, styles.approveButton]}
                      onPress={() => handleApprove(request.friendEmail)}
                      disabled={Boolean(isProcessing)}
                    >
                      <Text style={styles.buttonText}>
                        {isProcessing ? "Processing..." : "Approve"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={() => handleReject(request.friendEmail)}
                      disabled={Boolean(isProcessing)}
                    >
                      <Text style={styles.buttonText}>
                        {isProcessing ? "Processing..." : "Reject"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pending friendship requests.</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f0dcc7",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  scrollView: {
    width: "100%",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bf471b",
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0dcc7",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#f0dcc7",
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  approveButton: {
    backgroundColor: "#22c55e",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
  },
  emptyText: {
    color: "#f0dcc7",
    fontSize: 16,
    textAlign: "center",
  },
});

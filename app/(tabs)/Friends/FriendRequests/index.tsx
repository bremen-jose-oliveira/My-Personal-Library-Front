import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
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
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={styles.backgroundImage}
    >
        <Text style={styles.header}>Friend Requests</Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
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
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
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
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyText: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
});

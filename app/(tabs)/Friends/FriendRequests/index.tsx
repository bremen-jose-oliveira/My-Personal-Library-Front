import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, RefreshControl, ScrollView, TouchableOpacity } from 'react-native';
import { useFriendContext } from "@/utils/Context/FriendContext";
import { Colors } from "@/constants/Colors";

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
    <View style={styles.container}>
      <Text style={styles.header}>Friend Requests</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
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
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: 20,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
});

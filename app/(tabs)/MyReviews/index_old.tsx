import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useReviewContext } from "@/utils/Context/ReviewContext";
import { router } from "expo-router";
import type { Review } from "@/Interfaces/review";

export default function MyReviewsScreen() {
  const { myReviews, fetchMyReviews, deleteReview, updateReview, loading } = useReviewContext();
  const [refreshing, setRefreshing] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyReviews();
    setRefreshing(false);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating.toString());
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    try {
      await updateReview(editingReview.id, {
        rating: parseInt(editRating) || 5,
        comment: editComment,
      });
      Alert.alert("Success", "Review updated successfully!");
      setEditingReview(null);
      await fetchMyReviews();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    Alert.alert("Delete Review", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReview(reviewId);
            await fetchMyReviews();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete review");
          }
        },
      },
    ]);
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      <TouchableOpacity
        onPress={() => router.push(`/BookDetails/${item.bookId}`)}
        style={{ marginBottom: 8 }}
      >
        <Text style={{ color: "#bf471b", fontSize: 16, fontWeight: "600" }}>
          View Book →
        </Text>
      </TouchableOpacity>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <Text style={{ color: "#f0dcc7", fontSize: 18, fontWeight: "bold" }}>
          Rating: {item.rating}/5
        </Text>
        <Text style={{ color: "#f0dcc7", fontSize: 12 }}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
        </Text>
      </View>
      <Text style={{ color: "#f0dcc7", marginBottom: 12 }}>{item.comment}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => handleEditReview(item)}
          style={[styles.actionButton, styles.editButton]}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteReview(item.id)}
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <FlatList
          contentContainerStyle={{ padding: 16, paddingTop: 60 }}
          data={myReviews}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bf471b" />
          }
          renderItem={renderReviewItem}
          ListEmptyComponent={
            !loading ? (
              <View
                style={{
                  alignItems: "center",
                  marginTop: 40,
                  padding: 20,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: "#f0dcc7", fontSize: 16 }}>
                  You haven't written any reviews yet.
                </Text>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#bf471b" style={{ marginTop: 40 }} />
            )
          }
        />
      </LinearGradient>

      {/* Edit Review Modal */}
      <Modal
        visible={Boolean(editingReview !== null)}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingReview(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Review</Text>
            <Text style={styles.modalLabel}>Rating (1-5):</Text>
            <TextInput
              value={editRating}
              onChangeText={setEditRating}
              keyboardType="numeric"
              maxLength={1}
              style={styles.modalInput}
              placeholderTextColor="#d1d5db"
            />
            <Text style={styles.modalLabel}>Comment:</Text>
            <TextInput
              value={editComment}
              onChangeText={setEditComment}
              multiline={true}
              numberOfLines={4}
              style={[styles.modalInput, styles.modalTextArea]}
              placeholderTextColor="#d1d5db"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingReview(null)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#bf471b",
  },
  deleteButton: {
    backgroundColor: "#b91c1c",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#2d2d2d",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f0dcc7",
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: "#f0dcc7",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bf471b",
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  saveButton: {
    backgroundColor: "#bf471b",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { useReviewContext } from "@/utils/Context/ReviewContext";
import { router } from "expo-router";
import type { Review } from "@/Interfaces/review";
import { Colors } from "@/constants/Colors";

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
        style={styles.viewBookLink}
      >
        <Text style={styles.viewBookText}>View Book →</Text>
      </TouchableOpacity>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingText}>Rating: {item.rating}/5</Text>
        <Text style={styles.dateText}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
        </Text>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
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
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={myReviews}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        renderItem={renderReviewItem}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You haven't written any reviews yet.
              </Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          )
        }
      />

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
              placeholderTextColor={Colors.placeholder}
            />
            <Text style={styles.modalLabel}>Comment:</Text>
            <TextInput
              value={editComment}
              onChangeText={setEditComment}
              multiline={true}
              numberOfLines={4}
              style={[styles.modalInput, styles.modalTextArea]}
              placeholderTextColor={Colors.placeholder}
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
    paddingTop: 60,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  viewBookLink: {
    marginBottom: 8,
  },
  viewBookText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ratingText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  dateText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  commentText: {
    color: Colors.textSecondary,
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
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: Colors.surfaceAlt,
    color: Colors.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
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
    backgroundColor: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
});



import React, { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Platform,
  RefreshControl,
  Modal,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBookContext } from "@/utils/Context/BookContext";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { useReviewContext } from "@/utils/Context/ReviewContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { BookStatus } from "@/Interfaces/userBookStatus";
import { ExchangeStatus } from "@/Interfaces/exchange";

const statusLabels: Record<BookStatus, string> = {
  [BookStatus.NOT_READ]: "Not read",
  [BookStatus.READING]: "Reading",
  [BookStatus.READ]: "Finished",
};

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);

  const { currentUser } = useUserContext();
  const {
    selectedBook,
    loadingDetails,
    fetchBookById,
    deleteBook,
    updateReadingStatus,
  } = useBookContext();
  const { requestExchange } = useExchangeContext();
  const {
    reviews,
    loading: reviewsLoading,
    fetchReviewsForBook,
    createReview,
    updateReview,
    deleteReview,
  } = useReviewContext();

  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    if (!isNaN(bookId)) {
      fetchBookById(bookId);
      fetchReviewsForBook(bookId);
    }
  }, [bookId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBookById(bookId), fetchReviewsForBook(bookId)]);
    setRefreshing(false);
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;

    const confirmDelete = async () => {
      await deleteBook(selectedBook.id);
      router.push("/Library/DisplayBooks");
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this book?")) {
        await confirmDelete();
      }
    } else {
      Alert.alert("Delete Book", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: confirmDelete, style: "destructive" },
      ]);
    }
  };

  const handleRequestExchange = async () => {
    if (!selectedBook) return;
    try {
      await requestExchange(selectedBook.id);
      Alert.alert("Exchange requested", "The owner has been notified.");
    } catch (error: any) {
      Alert.alert("Exchange failed", error?.message ?? "Unable to request exchange");
    }
  };

  const handleUpdateReadingStatus = async (status: BookStatus) => {
    if (!selectedBook) return;
    try {
      await updateReadingStatus(selectedBook.id, status);
      Alert.alert("Success", "Reading status updated successfully");
    } catch (error: any) {
      Alert.alert("Update failed", error?.message ?? "Unable to update reading status");
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewComment.trim() || !selectedBook) return;
    setSubmittingReview(true);
    try {
      await createReview({
        bookId: selectedBook.id,
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });
      
      setReviewComment("");
      setReviewRating("5");
      await fetchReviewsForBook(selectedBook.id);
    } catch (error: any) {
      Alert.alert("Review failed", error?.message ?? "Unable to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const isOwner = useMemo(() => {
    if (!selectedBook || !currentUser) return false;
    return selectedBook.owner === currentUser.email;
  }, [selectedBook, currentUser]);

  if (loadingDetails || !selectedBook) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#bf471b" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#1f1f1f", "#3d2c29"]}
      style={{ flex: 1, padding: 16, paddingTop: 32 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />
        }
      >
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            gap: 16,
          }}
        >
          {selectedBook.cover ? (
            <Image
              source={{ uri: selectedBook.cover }}
              style={{ width: 120, height: 180, borderRadius: 8 }}
            />
          ) : (
            <View
              style={{
                width: 120,
                height: 180,
                borderRadius: 8,
                backgroundColor: "#d1d5db",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>No cover</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#f0dcc7", fontSize: 22, fontWeight: "bold" }}>
              {selectedBook.title}
            </Text>
            <Text style={{ color: "#f0dcc7", marginTop: 4 }}>Author: {selectedBook.author}</Text>
            <Text style={{ color: "#f0dcc7" }}>Year: {selectedBook.year}</Text>
            <Text style={{ color: "#f0dcc7" }}>Publisher: {selectedBook.publisher}</Text>
            <Text style={{ color: "#f0dcc7" }}>ISBN: {selectedBook.isbn}</Text>
            <Text style={{ color: "#f0dcc7", fontWeight: "600" }}>
              Owner: {selectedBook.ownerUsername || selectedBook.owner || "Unknown"}
            </Text>
            <Text style={{ color: "#f0dcc7" }}>
              Reading Status:{" "}
              {selectedBook.readingStatus
                ? statusLabels[selectedBook.readingStatus as BookStatus] ??
                  selectedBook.readingStatus
                : "Not set"}
            </Text>
            <Text style={{ color: "#f0dcc7" }}>
              Exchange Status: {selectedBook.exchangeStatus ?? "N/A"}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 24, gap: 12 }}>
          <Text style={{ color: "#f0dcc7", fontSize: 18, fontWeight: "600" }}>
            Update Reading Status
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {Object.values(BookStatus).map((status) => (
              <TouchableOpacity
                key={status}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor:
                    selectedBook.readingStatus === status ? "#bf471b" : "rgba(255,255,255,0.1)",
                }}
                onPress={() => handleUpdateReadingStatus(status)}
              >
                <Text style={{ color: "#fff" }}>{statusLabels[status]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 24, gap: 12 }}>
          <Text style={{ color: "#f0dcc7", fontSize: 18, fontWeight: "600" }}>Actions</Text>
          {!isOwner && (
            <TouchableOpacity
              style={{
                backgroundColor: "#bf471b",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={handleRequestExchange}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Request Exchange</Text>
            </TouchableOpacity>
          )}

          {isOwner && (
            <>
              <TouchableOpacity
                style={{
                  backgroundColor: "#bf471b",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
                onPress={() => router.push(`/Library/EditBook/${selectedBook.id}`)}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Edit Book</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "#b91c1c",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={handleDeleteBook}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Delete Book</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ marginTop: 32 }}>
          <Text style={{ color: "#f0dcc7", fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
            Reviews
          </Text>
          {reviewsLoading ? (
            <ActivityIndicator color="#bf471b" />
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                style={{
                  backgroundColor: "rgba(0,0,0,0.35)",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#f0dcc7", fontWeight: "600" }}>
                  {review.user?.username ?? "Anonymous"} • {review.rating}/5
                </Text>
                <Text style={{ color: "#f0dcc7", marginTop: 4 }}>{review.comment}</Text>
                {review.user?.email === currentUser?.email && (
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingReview(review.id);
                        setEditRating(review.rating.toString());
                        setEditComment(review.comment);
                      }}
                      style={{
                        backgroundColor: "#bf471b",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteReview(review.id)}
                      style={{
                        backgroundColor: "#b91c1c",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ color: "#f0dcc7", fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
            Add a Review
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={reviewRating}
              onChangeText={setReviewRating}
              keyboardType="numeric"
              maxLength={1}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#fff",
                padding: 10,
                borderRadius: 8,
                width: 60,
                textAlign: "center",
              }}
            />
            <TextInput
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder="Share your thoughts..."
              placeholderTextColor="#d1d5db"
              multiline
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#fff",
                padding: 10,
                borderRadius: 8,
              }}
            />
          </View>
          <TouchableOpacity
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: "#bf471b",
              borderRadius: 8,
              alignItems: "center",
            }}
            onPress={handleReviewSubmit}
            disabled={submittingReview}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Review Modal */}
      <Modal
        visible={editingReview !== null}
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
              multiline
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
                onPress={async () => {
                  if (editingReview === null) return;
                  try {
                    await updateReview(editingReview, {
                      rating: parseInt(editRating) || 5,
                      comment: editComment,
                    });
                    Alert.alert("Success", "Review updated successfully!");
                    setEditingReview(null);
                    await fetchReviewsForBook(bookId);
                  } catch (error: any) {
                    Alert.alert("Error", error.message || "Failed to update review");
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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

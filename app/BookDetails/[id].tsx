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
  KeyboardAvoidingView,
} from "react-native";
import { useBookContext } from "@/utils/Context/BookContext";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { useReviewContext } from "@/utils/Context/ReviewContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { BookStatus } from "@/Interfaces/userBookStatus";
import { ExchangeStatus } from "@/Interfaces/exchange";
import { Colors } from "@/constants/Colors";

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
    clearReviews,
  } = useReviewContext();

  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editComment, setEditComment] = useState("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    // Clear reviews and reset loading when component mounts or bookId changes
    if (!isNaN(bookId) && bookId > 0) {
      clearReviews();
      fetchBookById(bookId);
      // Small delay to ensure clearReviews completes before fetching
      const timer = setTimeout(() => {
        fetchReviewsForBook(bookId);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      clearReviews();
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
      Alert.alert(
        "Exchange failed",
        error?.message ?? "Unable to request exchange"
      );
    }
  };

  const handleUpdateReadingStatus = async (status: BookStatus) => {
    if (!selectedBook) return;
    try {
      await updateReadingStatus(selectedBook.id, status);
      Alert.alert("Success", "Reading status updated successfully");
    } catch (error: any) {
      Alert.alert(
        "Update failed",
        error?.message ?? "Unable to update reading status"
      );
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 200 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.bookInfoCard}>
            {selectedBook.cover ? (
              <Image
                source={{ uri: selectedBook.cover }}
                style={styles.coverImage}
                onError={(error) => {
                  console.error(
                    `Failed to load cover image for "${selectedBook.title}":`,
                    error.nativeEvent.error
                  );
                }}
              />
            ) : (
              <View style={styles.noCoverPlaceholder}>
                <Text style={styles.noCoverText}>No cover</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.bookTitle}>
                {selectedBook.title}
              </Text>
              <Text style={styles.bookDetail}>
                Author: {selectedBook.author}
              </Text>
              <Text style={styles.bookDetail}>
                Year: {selectedBook.year}
              </Text>
              <Text style={styles.bookDetail}>
                Publisher: {selectedBook.publisher}
              </Text>
              <Text style={styles.bookDetail}>
                ISBN: {selectedBook.isbn}
              </Text>
              <Text style={styles.bookDetailBold}>
                Owner: {selectedBook.ownerUsername || "Unknown"}
              </Text>
              <Text style={styles.bookDetail}>
                Reading Status:{" "}
                {selectedBook.readingStatus
                  ? statusLabels[selectedBook.readingStatus as BookStatus] ??
                    selectedBook.readingStatus
                  : "Not set"}
              </Text>
              <Text style={styles.bookDetail}>
                Exchange Status: {selectedBook.exchangeStatus ?? "N/A"}
              </Text>
            </View>
          </View>

          {/* Book Description - Expandable Section */}
          {selectedBook.description && (
            <View style={{ marginTop: 24 }}>
              <TouchableOpacity
                onPress={() => setDescriptionExpanded(!descriptionExpanded)}
                style={styles.descriptionHeader}
              >
                <Text style={styles.sectionTitle}>
                  Description
                </Text>
                <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>
                  {descriptionExpanded ? "▼" : "▶"}
                </Text>
              </TouchableOpacity>
              {descriptionExpanded && (
                <View style={styles.descriptionBody}>
                  <Text style={styles.descriptionText}>
                    {selectedBook.description}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={{ marginTop: 24, gap: 12 }}>
            <Text style={styles.sectionTitle}>
              Update Reading Status
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {Object.values(BookStatus).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    {
                      backgroundColor:
                        selectedBook.readingStatus === status
                          ? Colors.primary
                          : Colors.surfaceAlt,
                    },
                  ]}
                  onPress={() => handleUpdateReadingStatus(status)}
                >
                  <Text
                    style={{
                      color:
                        selectedBook.readingStatus === status
                          ? Colors.white
                          : Colors.text,
                    }}
                  >
                    {statusLabels[status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            <Text style={styles.sectionTitle}>
              Actions
            </Text>
            {!isOwner && (
              <TouchableOpacity
                style={styles.exchangeButton}
                onPress={handleRequestExchange}
              >
                <Text style={styles.actionButtonText}>
                  Request Exchange
                </Text>
              </TouchableOpacity>
            )}

            {isOwner && (
              <>
                <TouchableOpacity
                  style={styles.deleteBookButton}
                  onPress={handleDeleteBook}
                >
                  <Text style={styles.actionButtonText}>
                    Delete Book
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={{ marginTop: 32 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={styles.sectionTitle}>
                Reviews
              </Text>
              {reviewsLoading && (
                <ActivityIndicator
                  color={Colors.primary}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
            {!reviewsLoading && reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>
                No reviews yet. Be the first to review this book!
              </Text>
            ) : !reviewsLoading && reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <Text style={styles.reviewAuthor}>
                    {review.user?.username ?? "Anonymous"} • {review.rating}/5
                  </Text>
                  <Text style={styles.reviewComment}>
                    {review.comment}
                  </Text>
                  {review.user?.email === currentUser?.email && (
                    <View
                      style={{ flexDirection: "row", gap: 10, marginTop: 8 }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setEditingReview(review.id);
                          setEditRating(review.rating.toString());
                          setEditComment(review.comment);
                        }}
                        style={styles.editReviewButton}
                      >
                        <Text style={styles.actionButtonText}>
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteReview(review.id)}
                        style={styles.deleteReviewButton}
                      >
                        <Text style={styles.actionButtonText}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : null}
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
              Add a Review
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={reviewRating}
                onChangeText={setReviewRating}
                keyboardType="numeric"
                maxLength={1}
                style={styles.ratingInput}
              />
              <TextInput
                value={reviewComment}
                onChangeText={setReviewComment}
                placeholder="Share your thoughts..."
                placeholderTextColor={Colors.placeholder}
                multiline={true}
                style={styles.commentInput}
              />
            </View>
            <TouchableOpacity
              style={styles.submitReviewButton}
              onPress={handleReviewSubmit}
              disabled={Boolean(submittingReview)}
            >
              <Text style={styles.actionButtonText}>
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
                <Text style={[styles.modalButtonText, { color: Colors.text }]}>Cancel</Text>
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
                    Alert.alert(
                      "Error",
                      error.message || "Failed to update review"
                    );
                  }
                }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    paddingTop: 32,
  },
  bookInfoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  noCoverPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  noCoverText: {
    color: Colors.textSecondary,
  },
  bookTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: "bold",
  },
  bookDetail: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  bookDetailBold: {
    color: Colors.text,
    fontWeight: "600",
    marginTop: 4,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  descriptionBody: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  descriptionText: {
    color: Colors.textSecondary,
    lineHeight: 20,
    fontSize: 14,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exchangeButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteBookButton: {
    backgroundColor: Colors.error,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
  noReviewsText: {
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewAuthor: {
    color: Colors.text,
    fontWeight: "600",
  },
  reviewComment: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editReviewButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteReviewButton: {
    backgroundColor: Colors.error,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  ratingInput: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 10,
    borderRadius: 8,
    width: 60,
    textAlign: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitReviewButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: "center",
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
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.surfaceAlt,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
});

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
import { LinearGradient } from "expo-linear-gradient";
import { useBookContext } from "@/utils/Context/BookContext";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { useReviewContext } from "@/utils/Context/ReviewContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { BookStatus } from "@/Interfaces/userBookStatus";
import { ExchangeStatus } from "@/Interfaces/exchange";
import { useTranslation } from "react-i18next";

export default function BookDetails() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);

  const statusLabels: Record<BookStatus, string> = {
    [BookStatus.NOT_READ]: t("books.notRead"),
    [BookStatus.READING]: t("books.reading"),
    [BookStatus.READ]: t("books.read"),
  };

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
      if (window.confirm(t("books.deleteBookConfirm"))) {
        await confirmDelete();
      }
    } else {
      Alert.alert(t("books.deleteBook"), t("books.deleteBookConfirm"), [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.delete"), onPress: confirmDelete, style: "destructive" },
      ]);
    }
  };

  const handleRequestExchange = async () => {
    if (!selectedBook) return;
    try {
      await requestExchange(selectedBook.id);
      Alert.alert(t("books.exchangeRequested"), t("books.ownerNotified"));
    } catch (error: any) {
      Alert.alert(
        t("books.exchangeFailed"),
        error?.message ?? t("books.unableToRequestExchange")
      );
    }
  };

  const handleUpdateReadingStatus = async (status: BookStatus) => {
    if (!selectedBook) return;
    try {
      await updateReadingStatus(selectedBook.id, status);
      Alert.alert(t("common.success"), t("books.readingStatusUpdated"));
    } catch (error: any) {
      Alert.alert(
        t("books.updateFailed"),
        error?.message ?? t("books.unableToUpdateReadingStatus")
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
      Alert.alert(t("books.reviewFailed"), error?.message ?? t("books.unableToSubmitReview"));
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
              tintColor="#fff"
            />
          }
          keyboardShouldPersistTaps="handled"
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
                onError={(error) => {
                  console.error(
                    `Failed to load cover image for "${selectedBook.title}":`,
                    error.nativeEvent.error
                  );
                }}
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
                <Text>{t("books.noCover")}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#f0dcc7", fontSize: 22, fontWeight: "bold" }}
              >
                {selectedBook.title}
              </Text>
              <Text style={{ color: "#f0dcc7", marginTop: 4 }}>
                {t("books.author")}: {selectedBook.author}
              </Text>
              <Text style={{ color: "#f0dcc7" }}>
                {t("books.year")}: {selectedBook.year ?? "—"}
              </Text>
              <Text style={{ color: "#f0dcc7" }}>
                {t("books.publisher")}: {selectedBook.publisher ?? "—"}
              </Text>
              <Text style={{ color: "#f0dcc7" }}>
                {t("books.isbn")}: {selectedBook.isbn ?? "—"}
              </Text>
              <Text style={{ color: "#f0dcc7", fontWeight: "600" }}>
                {t("books.owner")}: {selectedBook.ownerUsername || t("common.unknown")}
              </Text>
              <Text style={{ color: "#f0dcc7" }}>
                {t("books.readingStatusLabel")}:{" "}
                {selectedBook.readingStatus
                  ? statusLabels[selectedBook.readingStatus as BookStatus] ??
                    selectedBook.readingStatus
                  : t("books.notSet")}
              </Text>
              <Text style={{ color: "#f0dcc7" }}>
                {t("books.exchangeStatus")}: {selectedBook.exchangeStatus ?? "N/A"}
              </Text>
            </View>
          </View>

          {/* Book Description - Expandable Section */}
          <View style={{ marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => setDescriptionExpanded(!descriptionExpanded)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 10,
                padding: 12,
                marginBottom: descriptionExpanded ? 8 : 0,
              }}
            >
              <Text
                style={{
                  color: "#f0dcc7",
                  fontSize: 18,
                  fontWeight: "600",
                  flex: 1,
                }}
              >
                {t("books.description")}
                </Text>
              <Text style={{ color: "#f0dcc7", fontSize: 16 }}>
                {descriptionExpanded ? "▼" : "▶"}
              </Text>
            </TouchableOpacity>
            {descriptionExpanded && (
              <View
                style={{
                  backgroundColor: "rgba(0,0,0,0.35)",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: "#f0dcc7",
                    lineHeight: 20,
                    fontSize: 14,
                  }}
                >
                  {selectedBook.description?.trim() || t("books.noDescription")}
                </Text>
              </View>
            )}
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            <Text style={{ color: "#f0dcc7", fontSize: 18, fontWeight: "600" }}>
              {t("books.updateReadingStatus")}
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
                      selectedBook.readingStatus === status
                        ? "#bf471b"
                        : "rgba(255,255,255,0.1)",
                  }}
                  onPress={() => handleUpdateReadingStatus(status)}
                >
                  <Text style={{ color: "#fff" }}>{statusLabels[status]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            <Text style={{ color: "#f0dcc7", fontSize: 18, fontWeight: "600" }}>
              {t("books.actions")}
            </Text>
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
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {t("books.lendingRequest")}
                </Text>
              </TouchableOpacity>
            )}

            {isOwner && (
              <>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#b91c1c",
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={handleDeleteBook}
                >
<Text style={{ color: "#fff", fontWeight: "600" }}>
                  {t("books.deleteBook")}
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
              <Text
                style={{
                  color: "#f0dcc7",
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {t("books.reviews")}
              </Text>
              {reviewsLoading && (
                <ActivityIndicator
                  color="#bf471b"
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
            {!reviewsLoading && reviews.length === 0 ? (
              <Text style={{ color: "#f0dcc7", fontStyle: "italic" }}>
                {t("books.noReviewsYet")}
              </Text>
            ) : !reviewsLoading && reviews.length > 0 ? (
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
                    {review.user?.username ?? t("books.anonymous")} • {review.rating}/5
                  </Text>
                  <Text style={{ color: "#f0dcc7", marginTop: 4 }}>
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
                        style={{
                          backgroundColor: "#bf471b",
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                          {t("common.edit")}
                        </Text>
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
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                          {t("common.delete")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            ) : null}
          </View>

          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                color: "#f0dcc7",
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              {t("books.addReview")}
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
                placeholder={t("books.shareThoughts")}
                placeholderTextColor="#d1d5db"
                multiline={true}
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
              disabled={Boolean(submittingReview)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {submittingReview ? t("books.submittingReview") : t("books.submitReview")}
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
            <Text style={styles.modalTitle}>{t("books.editReview")}</Text>
            <Text style={styles.modalLabel}>{t("myReviews.ratingLabel")}</Text>
            <TextInput
              value={editRating}
              onChangeText={setEditRating}
              keyboardType="numeric"
              maxLength={1}
              style={styles.modalInput}
              placeholderTextColor="#d1d5db"
            />
            <Text style={styles.modalLabel}>{t("myReviews.comment")}</Text>
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
                <Text style={styles.modalButtonText}>{t("common.cancel")}</Text>
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
                    Alert.alert(t("common.success"), t("books.reviewUpdated"));
                    setEditingReview(null);
                    await fetchReviewsForBook(bookId);
                  } catch (error: any) {
                    Alert.alert(
                      t("common.error"),
                      error.message || t("books.failedToUpdateReview")
                    );
                  }
                }}
              >
                <Text style={styles.modalButtonText}>{t("myReviews.save")}</Text>
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

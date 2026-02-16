import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useReviewContext } from "@/utils/Context/ReviewContext";
import { router } from "expo-router";
import type { Review } from "@/Interfaces/review";
import { ReviewCard } from "@/components/ReviewCard";
import { FontAwesome } from "@expo/vector-icons";

export default function MyReviewsScreen() {
  const { myReviews, fetchMyReviews, deleteReview, updateReview, loading } =
    useReviewContext();
  const [refreshing, setRefreshing] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
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
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    try {
      await updateReview(editingReview.id, {
        rating: editRating,
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
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
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
      ]
    );
  };

  if (loading && myReviews.length === 0) {
    return (
      <LinearGradient colors={["#f5f5f5", "#ffffff"]} className="flex-1">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#bf471b" />
          <Text className="text-gray-600 mt-3">Loading reviews...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#f5f5f5", "#ffffff"]} className="flex-1">
      {myReviews.length === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-gray-500 text-center text-lg mb-2">
            No reviews yet
          </Text>
          <Text className="text-gray-400 text-center">
            Start reviewing books from your library
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          data={myReviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ReviewCard
              review={item}
              onEdit={() => handleEditReview(item)}
              onDelete={() => handleDeleteReview(item.id)}
              onBookPress={() => router.push(`/BookDetails/${item.bookId}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#bf471b"
              colors={["#bf471b"]}
            />
          }
        />
      )}

      {/* Edit Review Modal */}
      <Modal
        visible={!!editingReview}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingReview(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-800">
                Edit Review
              </Text>
              <TouchableOpacity
                onPress={() => setEditingReview(null)}
                activeOpacity={0.7}
              >
                <FontAwesome name="times" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Book ID */}
            {editingReview && (
              <Text className="text-gray-700 font-semibold mb-4">
                Book ID: {editingReview.bookId || "Unknown"}
              </Text>
            )}

            {/* Rating Selector */}
            <Text className="text-gray-700 font-semibold mb-2">Rating</Text>
            <View className="flex-row mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setEditRating(star)}
                  activeOpacity={0.7}
                  className="mr-2"
                >
                  <FontAwesome
                    name={star <= editRating ? "star" : "star-o"}
                    size={32}
                    color="#f39c12"
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <Text className="text-gray-700 font-semibold mb-2">Comment</Text>
            <TextInput
              value={editComment}
              onChangeText={setEditComment}
              placeholder="Write your review..."
              multiline
              numberOfLines={4}
              className="bg-gray-100 rounded-xl p-4 mb-6 text-gray-800"
              style={{
                height: 100,
                textAlignVertical: "top",
              }}
            />

            {/* Action Buttons */}
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setEditingReview(null)}
                activeOpacity={0.7}
                className="flex-1 bg-gray-200 py-4 rounded-xl mr-2"
              >
                <Text className="text-gray-700 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveEdit}
                activeOpacity={0.7}
                className="flex-1 py-4 rounded-xl ml-2"
                style={{ backgroundColor: "#bf471b" }}
              >
                <Text className="text-white text-center font-semibold">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

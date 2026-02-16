import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import type { Review } from '@/Interfaces/review';

interface ReviewCardProps {
  review: Review;
  onEdit: () => void;
  onDelete: () => void;
  onBookPress: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onBookPress,
}) => {
  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <FontAwesome
            key={star}
            name={star <= rating ? 'star' : 'star-o'}
            size={16}
            color="#f39c12"
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  return (
    <View
      className="mx-4 mb-4 bg-white rounded-2xl p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Book Link */}
      <TouchableOpacity onPress={onBookPress} activeOpacity={0.7} className="mb-3">
        <Text className="text-blue-500 font-semibold">
          View Book →
        </Text>
      </TouchableOpacity>

      {/* Rating */}
      <View className="mb-3">
        {renderStars(review.rating)}
      </View>

      {/* Comment */}
      {review.comment && (
        <Text className="text-gray-600 text-sm mb-3 leading-5">
          {review.comment}
        </Text>
      )}

      {/* Date */}
      {review.createdAt && (
        <Text className="text-xs text-gray-400 mb-3">
          {new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-end border-t border-gray-100 pt-3">
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.7}
          className="flex-row items-center mr-4"
        >
          <FontAwesome name="edit" size={16} color="#4a90e2" />
          <Text className="text-blue-500 text-sm font-semibold ml-2">
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.7}
          className="flex-row items-center"
        >
          <FontAwesome name="trash" size={16} color="#e74c3c" />
          <Text className="text-red-500 text-sm font-semibold ml-2">
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import type Book from '@/Interfaces/book';

interface BookCardProps {
  book: Book;
  onPress: () => void;
}

const statusColors: { [key: string]: string } = {
  NOT_READ: '#999',
  READING: '#bf471b',
  READ: '#27ae60',
};

const statusLabels: { [key: string]: string } = {
  NOT_READ: 'Not Read',
  READING: 'Reading',
  READ: 'Finished',
};

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  const statusColor = statusColors[book.readingStatus || 'NOT_READ'] || '#999';
  const statusLabel = statusLabels[book.readingStatus || 'NOT_READ'] || 'Unknown';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="m-2"
      style={{
        width: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <View className="bg-white rounded-xl overflow-hidden">
        {/* Book Cover */}
        {book.cover ? (
          <Image
            source={{ uri: book.cover }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-gray-200 items-center justify-center">
            <Text className="text-gray-400 text-xs text-center px-2">
              No Cover
            </Text>
          </View>
        )}

        {/* Book Info */}
        <View className="p-3">
          <Text
            className="text-sm font-bold text-gray-800 mb-1"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text className="text-xs text-gray-600 mb-2" numberOfLines={1}>
            {book.author}
          </Text>

          {/* Reading Status Badge */}
          {book.readingStatus && (
            <View
              className="px-2 py-1 rounded-full self-start"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface RecentBookCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  onPress: () => void;
}

export const RecentBookCard: React.FC<RecentBookCardProps> = ({
  title,
  author,
  coverUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mr-4 w-32"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="bg-white rounded-xl overflow-hidden">
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-gray-200 items-center justify-center">
            <Text className="text-gray-400 text-xs">No Cover</Text>
          </View>
        )}
        <View className="p-3">
          <Text
            className="text-sm font-semibold text-gray-800 mb-1"
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {author}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

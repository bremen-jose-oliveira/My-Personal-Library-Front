import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
}) => {
  return (
    <View className="flex-row items-center justify-between mb-3 px-1">
      <Text className="text-lg font-bold text-gray-800">{title}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7}>
          <Text className="text-sm font-semibold" style={{ color: '#bf471b' }}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

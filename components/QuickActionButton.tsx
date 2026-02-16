import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickActionButtonProps {
  title: string;
  icon: ReactNode;
  onPress: () => void;
  gradient?: [string, string];
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  title,
  icon,
  onPress,
  gradient = ['#bf471b', '#d45d2a'],
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 mx-1"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-xl p-4 items-center"
      >
        <View className="mb-2">{icon}</View>
        <Text className="text-white text-xs font-semibold text-center">
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

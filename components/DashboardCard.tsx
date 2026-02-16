import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  gradient?: [string, string];
  onPress?: () => void;
  subtitle?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  gradient = ['#ffffff', '#f5f5f5'],
  onPress,
  subtitle,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-600 text-sm font-medium mb-1">
              {title}
            </Text>
            <Text className="text-3xl font-bold text-gray-800 mb-1">
              {value}
            </Text>
            {subtitle && (
              <Text className="text-gray-500 text-xs">{subtitle}</Text>
            )}
          </View>
          {icon && (
            <View className="ml-3 bg-white/50 rounded-full p-3">
              {icon}
            </View>
          )}
        </View>
      </LinearGradient>
    </CardWrapper>
  );
};

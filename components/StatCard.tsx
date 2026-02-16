import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  onPress?: () => void;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = '#bf471b',
  onPress,
  trend,
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
      className="bg-white rounded-xl p-4 flex-1 mx-1 my-2"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 150,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="rounded-full p-2"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </View>
        {trend && (
          <Text className="text-xs text-gray-500">{trend}</Text>
        )}
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-1">{value}</Text>
      <Text className="text-xs text-gray-500 font-medium">{title}</Text>
    </CardWrapper>
  );
};

import React from 'react';
import { View, Text } from 'react-native';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon,
  color = '#FF6B35'
}) => {
  // Extract RGB values from hex color for opacity
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Card style={{ flex: 1, minWidth: 150 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-500 text-sm mb-2">{title}</Text>
          <Text 
            className="text-3xl font-bold" 
            style={{ color }}
          >
            {value}
          </Text>
        </View>
        {icon && (
          <View 
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: hexToRgba(color, 0.2) }}
          >
            {icon}
          </View>
        )}
      </View>
    </Card>
  );
};

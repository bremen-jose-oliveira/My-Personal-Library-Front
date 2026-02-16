import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import type { Exchange, ExchangeStatus } from '@/Interfaces/exchange';

interface ExchangeCardProps {
  exchange: Exchange;
  onReturnPress?: () => void;
  onViewPress?: () => void;
  type: 'borrowed' | 'lending';
  processing?: boolean;
}

const statusColors: Record<ExchangeStatus, string> = {
  REQUESTED: '#f39c12',
  ACCEPTED: '#27ae60',
  REJECTED: '#e74c3c',
  RETURNED: '#95a5a6',
};

const statusLabels: Record<ExchangeStatus, string> = {
  REQUESTED: 'Pending',
  ACCEPTED: 'Active',
  REJECTED: 'Rejected',
  RETURNED: 'Returned',
};

export const ExchangeCard: React.FC<ExchangeCardProps> = ({
  exchange,
  onReturnPress,
  onViewPress,
  type,
  processing = false,
}) => {
  const statusColor = statusColors[exchange.status] || '#999';
  const statusLabel = statusLabels[exchange.status] || exchange.status;

  return (
    <TouchableOpacity
      onPress={onViewPress}
      activeOpacity={0.8}
      className="mx-4 mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="bg-white rounded-2xl p-4 flex-row">
        {/* Book Cover */}
        {exchange.book?.cover ? (
          <Image
            source={{ uri: exchange.book.cover }}
            className="w-20 h-28 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-28 rounded-lg bg-gray-200 items-center justify-center">
            <MaterialCommunityIcons name="book" size={32} color="#999" />
          </View>
        )}

        {/* Book Info */}
        <View className="flex-1 ml-4">
          <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={2}>
            {exchange.book?.title || 'Unknown Title'}
          </Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={1}>
            {exchange.book?.author || 'Unknown Author'}
          </Text>

          {/* User Info */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="person" size={14} color="#666" />
            <Text className="text-xs text-gray-600 ml-1">
              {type === 'borrowed' 
                ? `From: ${exchange.book?.ownerUsername || 'Unknown'}`
                : `To: ${exchange.borrower?.username || 'Unknown'}`
              }
            </Text>
          </View>

          {/* Status Badge */}
          <View className="flex-row items-center justify-between">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </Text>
            </View>

            {/* Return Button */}
            {onReturnPress && exchange.status === 'ACCEPTED' && (
              <TouchableOpacity
                onPress={onReturnPress}
                disabled={processing}
                className="bg-blue-500 px-3 py-1 rounded-full flex-row items-center"
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="keyboard-return" size={14} color="#fff" />
                <Text className="text-white text-xs font-semibold ml-1">
                  {processing ? 'Processing...' : 'Return'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

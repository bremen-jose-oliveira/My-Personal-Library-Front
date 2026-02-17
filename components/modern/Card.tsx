import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'elevated' 
}) => {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'flat' && styles.flat,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.background.default,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  elevated: {
    ...theme.shadows.md,
  },
  flat: {
    backgroundColor: theme.colors.background.secondary,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  },
});

export default Card;

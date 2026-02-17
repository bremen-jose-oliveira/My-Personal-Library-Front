import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'rounded-xl flex items-center justify-center';
    
    const variantClasses = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      outline: 'bg-transparent border-2 border-primary',
    };
    
    const sizeClasses = {
      small: 'py-2 px-4',
      medium: 'py-3 px-6',
      large: 'py-4 px-8',
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  };

  const getTextClasses = () => {
    const textVariantClasses = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary',
    };
    
    const textSizeClasses = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };
    
    return `font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`;
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#FF6B35' : '#FFFFFF'} />
      ) : (
        <Text className={getTextClasses()} style={textStyle}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient?: string[];
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  gradient = theme.gradients.primary as any,
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={32} color="#fff" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  gradient: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: theme.fontWeight.medium as any,
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.fontSize['3xl'],
    color: '#fff',
    fontWeight: theme.fontWeight.bold as any,
  },
  subtitle: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: theme.spacing.xs,
  },
});

export default StatCard;

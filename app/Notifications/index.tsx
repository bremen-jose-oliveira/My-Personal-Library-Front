import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNotificationContext } from "@/utils/Context/NotificationContext";
import { NotificationType } from "@/Interfaces/notification";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const typeLabels: Record<NotificationType, string> = {
  [NotificationType.FRIEND_REQUEST]: "Friend Request",
  [NotificationType.FRIEND_REQUEST_ACCEPTED]: "Friend Request Accepted",
  [NotificationType.EXCHANGE_REQUEST]: "Exchange Request",
  [NotificationType.EXCHANGE_ACCEPTED]: "Exchange Accepted",
  [NotificationType.EXCHANGE_REJECTED]: "Exchange Rejected",
  [NotificationType.EXCHANGE_RETURNED]: "Exchange Returned",
  [NotificationType.REVIEW_ADDED]: "New Review",
};

const typeIcons: Record<NotificationType, string> = {
  [NotificationType.FRIEND_REQUEST]: "account-plus",
  [NotificationType.FRIEND_REQUEST_ACCEPTED]: "account-check",
  [NotificationType.EXCHANGE_REQUEST]: "swap-horizontal",
  [NotificationType.EXCHANGE_ACCEPTED]: "check-circle",
  [NotificationType.EXCHANGE_REJECTED]: "close-circle",
  [NotificationType.EXCHANGE_RETURNED]: "book-return",
  [NotificationType.REVIEW_ADDED]: "star",
};

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    refreshNotifications,
  } = useNotificationContext();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: any) => {
    await markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === NotificationType.FRIEND_REQUEST) {
      router.push("/(tabs)/Friends/FriendRequests");
    } else if (
      notification.type === NotificationType.EXCHANGE_REQUEST ||
      notification.type === NotificationType.EXCHANGE_ACCEPTED ||
      notification.type === NotificationType.EXCHANGE_REJECTED ||
      notification.type === NotificationType.EXCHANGE_RETURNED
    ) {
      router.push("/(tabs)/Exchanges");
    } else if (notification.type === NotificationType.REVIEW_ADDED && notification.relatedBookId) {
      router.push(`/BookDetails/${notification.relatedBookId}`);
    }
  };

  const handleClearAll = () => {
    Alert.alert("Clear All Notifications", "Are you sure you want to clear all notifications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearAllNotifications();
        },
      },
    ]);
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <ImageBackground
      source={require("@/assets/images/Background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={styles.gradientOverlay}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity 
              onPress={async () => {
                await markAllAsRead();
              }} 
              style={styles.markAllButton}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={sortedNotifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bf471b" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationCard, !item.read && styles.unreadCard]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={typeIcons[item.type] as any}
                  size={24}
                  color="#bf471b"
                />
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
              <TouchableOpacity
                onPress={() => clearNotification(item.id)}
                style={styles.deleteButton}
              >
                <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="bell-off" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f0dcc7",
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: "#bf471b",
    fontSize: 14,
    fontWeight: "600",
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(191, 71, 27, 0.3)",
  },
  unreadCard: {
    borderColor: "#bf471b",
    backgroundColor: "rgba(191, 71, 27, 0.1)",
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f0dcc7",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#f0dcc7",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#bf471b",
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 16,
  },
});


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import { useNotificationContext } from "@/utils/Context/NotificationContext";
import { NotificationType } from "@/Interfaces/notification";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

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
    } else if (notification.type === NotificationType.EXCHANGE_REQUEST) {
      // Someone wants to borrow your book -> Lending tab
      router.push("/(tabs)/Lending");
    } else if (
      notification.type === NotificationType.EXCHANGE_ACCEPTED ||
      notification.type === NotificationType.EXCHANGE_REJECTED ||
      notification.type === NotificationType.EXCHANGE_RETURNED
    ) {
      // Your request was accepted/rejected or book returned -> Borrowed tab
      router.push("/(tabs)/Borrowed");
    } else if (
      notification.type === NotificationType.REVIEW_ADDED &&
      notification.relatedBookId
    ) {
      router.push(`/BookDetails/${notification.relatedBookId}`);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearAllNotifications();
          },
        },
      ]
    );
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.container}>
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
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.clearAllButton}
          >
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sortedNotifications}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
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
                color={Colors.primary}
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
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-off"
              size={48}
              color={Colors.placeholder}
            />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: Colors.primaryFaded,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderColor: Colors.border,
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
    color: Colors.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.placeholder,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
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
    color: Colors.placeholder,
    fontSize: 16,
    marginTop: 16,
  },
});

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Notification, NotificationType } from "@/Interfaces/notification";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

const getToken = async () => {
  const token = await AsyncStorage.getItem("token");
  return token; // Return null if no token instead of throwing
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        // No token means user is not logged in - silently skip
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Fetch notifications
      const notificationsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/notifications`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (notificationsResponse.ok) {
        const data: Notification[] = await notificationsResponse.json();
        // Convert backend format to frontend format
        const formattedNotifications: Notification[] = data.map((n: any) => ({
          id: n.id.toString(),
          type: n.type as NotificationType,
          title: n.title,
          message: n.message,
          read: n.read,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
          relatedId: n.relatedId,
          relatedEmail: n.relatedEmail,
          relatedBookId: n.relatedBookId,
        }));
        setNotifications(formattedNotifications);
      }

      // Fetch unread count
      const countResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/unread/count`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (countResponse.ok) {
        const countData = await countResponse.json();
        setUnreadCount(countData.count || 0);
      }
    } catch (error) {
      // Only log if it's not a missing token error
      if (error instanceof Error && !error.message.includes("token")) {
        console.error("Error fetching notifications:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications from backend on mount and set up periodic refresh
  useEffect(() => {
    refreshNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const token = await getToken();
        if (!token) return; // Silently return if no token
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          await refreshNotifications();
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [refreshNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return; // Silently return if no token
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/read-all`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await refreshNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [refreshNotifications]);

  const clearNotification = useCallback(
    async (notificationId: string) => {
      try {
        const token = await getToken();
        if (!token) return; // Silently return if no token
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/notifications/${notificationId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          await refreshNotifications();
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    },
    [refreshNotifications]
  );

  const clearAllNotifications = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return; // Silently return if no token
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/notifications`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await refreshNotifications();
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
};

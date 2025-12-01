import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNotificationContext } from "@/utils/Context/NotificationContext";
import { router } from "expo-router";

export default function NotificationBell() {
  const { unreadCount } = useNotificationContext();

  return (
    <TouchableOpacity
      onPress={() => router.push("/Notifications")}
      style={styles.container}
    >
      <MaterialCommunityIcons name="bell" size={24} color="#bf471b" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount.toString()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});


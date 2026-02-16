import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNotificationContext } from "@/utils/Context/NotificationContext";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function NotificationBell() {
  const { unreadCount } = useNotificationContext();

  return (
    <TouchableOpacity
      onPress={() => router.push("/Notifications")}
      style={styles.container}
    >
      <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.text} />
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
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "bold",
  },
});






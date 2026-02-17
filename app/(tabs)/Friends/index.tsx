import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/constants/theme";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

export default function FriendsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={() => router.push("/(tabs)/Friends/FriendList")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="account-group" size={20} color="#fff" />
          <Text style={styles.headerButtonText}>Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.secondary[500] }]}
          onPress={() => router.push("/(tabs)/Friends/AddFriend")}
          activeOpacity={0.8}
        >
          <FontAwesome name="user-plus" size={18} color="#fff" />
          <Text style={styles.headerButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content Cards */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Friends</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/Friends/FriendList")}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: theme.colors.primary[50] }]}>
              <MaterialCommunityIcons
                name="account-group"
                size={32}
                color={theme.colors.primary[500]}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Friend List</Text>
              <Text style={styles.cardDescription}>
                View and manage your friends
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.neutral[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/Friends/AddFriend")}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: theme.colors.secondary[50] }]}>
              <FontAwesome
                name="user-plus"
                size={28}
                color={theme.colors.secondary[500]}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Add Friend</Text>
              <Text style={styles.cardDescription}>
                Send friend requests to others
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.neutral[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/Friends/FriendRequests")}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#fef3c7" }]}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={32}
                color="#eab308"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Friend Requests</Text>
              <Text style={styles.cardDescription}>
                Manage incoming requests
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.neutral[400]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Features</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/BrowseBooks")}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#dbeafe" }]}>
              <MaterialCommunityIcons
                name="book-search"
                size={32}
                color="#3b82f6"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Browse Books</Text>
              <Text style={styles.cardDescription}>
                Explore friends' collections
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.neutral[400]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/MyReviews")}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIcon, { backgroundColor: "#dcfce7" }]}>
              <MaterialCommunityIcons
                name="star"
                size={32}
                color="#22c55e"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Reviews</Text>
              <Text style={styles.cardDescription}>
                Share your book reviews
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.neutral[400]}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  headerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    gap: 8,
    ...theme.shadows.sm,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});

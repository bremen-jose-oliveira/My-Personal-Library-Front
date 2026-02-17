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
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"books" | "add">("books");

  return (
    <View style={styles.container}>
      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "books" && styles.segmentButtonActive,
          ]}
          onPress={() => {
            setActiveTab("books");
            router.push("/(tabs)/Library/DisplayBooks");
          }}
        >
          <MaterialCommunityIcons
            name="bookshelf"
            size={20}
            color={activeTab === "books" ? "#fff" : theme.colors.primary[500]}
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === "books" && styles.segmentTextActive,
            ]}
          >
            My Books
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "add" && styles.segmentButtonActive,
          ]}
          onPress={() => {
            setActiveTab("add");
            router.push("/(tabs)/Library/AddBookForm");
          }}
        >
          <MaterialCommunityIcons
            name="book-plus"
            size={20}
            color={activeTab === "add" ? "#fff" : theme.colors.primary[500]}
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === "add" && styles.segmentTextActive,
            ]}
          >
            Add Book
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Cards */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/Library/DisplayBooks")}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="bookshelf"
                size={32}
                color={theme.colors.primary[500]}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>My Books</Text>
              <Text style={styles.cardDescription}>
                View and manage your book collection
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
            onPress={() => router.push("/(tabs)/Library/AddBookForm")}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="book-plus"
                size={32}
                color={theme.colors.secondary[500]}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Add New Book</Text>
              <Text style={styles.cardDescription}>
                Add a book to your library
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
          <Text style={styles.sectionTitle}>More Actions</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/(tabs)/ReadingList")}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={32}
                color="#22c55e"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Reading List</Text>
              <Text style={styles.cardDescription}>
                Track your reading progress
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
            onPress={() => router.push("/(tabs)/Borrowed")}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="book-arrow-down"
                size={32}
                color="#eab308"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Borrowed Books</Text>
              <Text style={styles.cardDescription}>
                Books you borrowed from friends
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
            onPress={() => router.push("/(tabs)/Lending")}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <MaterialCommunityIcons
                name="book-arrow-up"
                size={32}
                color="#3b82f6"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Lending Books</Text>
              <Text style={styles.cardDescription}>
                Books you lent to friends
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
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: theme.borderRadius.md,
    padding: 4,
    ...theme.shadows.sm,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    gap: 8,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary[500],
  },
  segmentTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
    backgroundColor: theme.colors.background.secondary,
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookStatus } from "@/Interfaces/userBookStatus";
import type { UserBookStatus } from "@/Interfaces/userBookStatus";
import { fetchCoverImage } from "@/utils/fetchBookData";
import { Platform } from "react-native";
import { useCallback } from "react";
import { Colors } from "@/constants/Colors";

const statusLabels: Record<BookStatus, string> = {
  [BookStatus.NOT_READ]: "Not Read",
  [BookStatus.READING]: "Reading",
  [BookStatus.READ]: "Finished",
};

const statusColors: Record<BookStatus, string> = {
  [BookStatus.READ]: Colors.success,
  [BookStatus.READING]: Colors.warning,
  [BookStatus.NOT_READ]: Colors.textSecondary,
};

export default function ReadingListScreen() {
  const [bookStatuses, setBookStatuses] = useState<UserBookStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<BookStatus | "ALL">(
    "ALL"
  );

  const fetchReadingList = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing or expired");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user-book-status/my`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch reading list: ${response.statusText}`);
      }

      const data: any[] = await response.json();

      // Map the data and ensure status is properly converted to BookStatus enum
      const mappedData: UserBookStatus[] = data.map((item) => ({
        ...item,
        status: item.status as BookStatus, // Backend returns string, map to enum
      }));

      // Enrich books with cover images
      const enrichedData = await Promise.all(
        mappedData.map(async (item) => {
          if (item.book && !item.book.cover) {
            const coverUrl = await fetchCoverImage(
              item.book.title,
              item.book.author
            );
            return {
              ...item,
              book: { ...item.book, cover: coverUrl },
            };
          }
          return item;
        })
      );

      setBookStatuses(enrichedData);
    } catch (error) {
      console.error("Error fetching reading list:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReadingList();
  }, []);

  // Refresh the list when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReadingList();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadingList();
  };

  const filteredStatuses =
    selectedFilter === "ALL"
      ? bookStatuses
      : bookStatuses.filter((item) => item.status === selectedFilter);

  const renderBookItem = ({ item }: { item: UserBookStatus }) => {
    if (!item.book) return null;

    const bookTitle = item.book.title || "Unknown";

    return (
      <TouchableOpacity
        onPress={() => router.push(`/BookDetails/${item.book!.id}`)}
        style={styles.bookCard}
      >
        {item.book.cover ? (
          <Image
            source={{ uri: item.book.cover }}
            style={styles.coverImage}
            resizeMode="cover"
            onError={(error) => {
              console.error(
                `Failed to load cover image for "${bookTitle}":`,
                error.nativeEvent.error
              );
            }}
            onLoad={() => {
              console.log(`✅ Successfully loaded cover for: ${bookTitle}`);
            }}
          />
        ) : (
          <View style={styles.noCover}>
            <Text style={styles.noCoverText}>No Cover</Text>
          </View>
        )}
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{item.book.title}</Text>
          <Text style={styles.bookAuthor}>{item.book.author}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[item.status as BookStatus] || Colors.textSecondary },
            ]}
          >
            <Text style={styles.statusText}>
              {statusLabels[item.status as BookStatus] || item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Reading List</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => setSelectedFilter("ALL")}
              style={[
                styles.filterButton,
                selectedFilter === "ALL" ? styles.filterActive : styles.filterInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === "ALL" ? styles.filterTextActive : styles.filterTextInactive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {Object.values(BookStatus).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedFilter(status)}
                style={[
                  styles.filterButton,
                  selectedFilter === status ? styles.filterActive : styles.filterInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === status ? styles.filterTextActive : styles.filterTextInactive,
                  ]}
                >
                  {statusLabels[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={filteredStatuses}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            renderItem={renderBookItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedFilter === "ALL"
                    ? "No books in your reading list yet."
                    : `No books with status "${
                        statusLabels[selectedFilter as BookStatus]
                      }".`}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerArea: {
    paddingTop: 60,
    flex: 1,
  },
  headerContent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterActive: {
    backgroundColor: Colors.primary,
  },
  filterInactive: {
    backgroundColor: Colors.surfaceAlt,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: Colors.white,
  },
  filterTextInactive: {
    color: Colors.textSecondary,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  coverImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  noCover: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  noCoverText: {
    color: Colors.placeholder,
    fontSize: 10,
    textAlign: "center",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bookAuthor: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

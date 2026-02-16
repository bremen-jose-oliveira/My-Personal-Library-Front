import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookStatus } from "@/Interfaces/userBookStatus";
import type { UserBookStatus } from "@/Interfaces/userBookStatus";
import { fetchCoverImage } from "@/utils/fetchBookData";
import { BookCard } from "@/components/BookCard";

const statusLabels: Record<BookStatus, string> = {
  [BookStatus.NOT_READ]: "Not Read",
  [BookStatus.READING]: "Reading",
  [BookStatus.READ]: "Finished",
};

const filterOptions: Array<{ value: BookStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: BookStatus.READING, label: "Reading" },
  { value: BookStatus.NOT_READ, label: "Want to Read" },
  { value: BookStatus.READ, label: "Finished" },
];

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

      const mappedData: UserBookStatus[] = data.map((item) => ({
        ...item,
        status: item.status as BookStatus,
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
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReadingList();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadingList();
    setRefreshing(false);
  };

  const filteredBooks =
    selectedFilter === "ALL"
      ? bookStatuses
      : bookStatuses.filter((item) => item.status === selectedFilter);

  if (loading) {
    return (
      <LinearGradient colors={["#f5f5f5", "#ffffff"]} className="flex-1">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#bf471b" />
          <Text className="text-gray-600 mt-3">Loading reading list...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#f5f5f5", "#ffffff"]} className="flex-1">
      {/* Filter Tabs */}
      <View className="flex-row px-4 pt-4 pb-2">
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setSelectedFilter(option.value)}
            activeOpacity={0.7}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedFilter === option.value
                ? "bg-primary"
                : "bg-gray-200"
            }`}
            style={
              selectedFilter === option.value
                ? { backgroundColor: "#bf471b" }
                : {}
            }
          >
            <Text
              className={`text-sm font-semibold ${
                selectedFilter === option.value
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Books List */}
      {filteredBooks.length === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-gray-500 text-center text-lg mb-2">
            {selectedFilter === "ALL"
              ? "Your reading list is empty"
              : `No books in "${statusLabels[selectedFilter as BookStatus] || "this category"}"`}
          </Text>
          <Text className="text-gray-400 text-center">
            Add books to your reading list from your library
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingVertical: 12,
          }}
          data={filteredBooks}
          numColumns={2}
          key="reading-list-grid"
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) =>
            item.book ? (
              <BookCard
                book={{ ...item.book, readingStatus: item.status }}
                onPress={() => {
                  if (item.book?.id) {
                    router.push(`/BookDetails/${item.book.id}`);
                  }
                }}
              />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#bf471b"
              colors={["#bf471b"]}
            />
          }
        />
      )}
    </LinearGradient>
  );
}

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookStatus } from "@/Interfaces/userBookStatus";
import type { UserBookStatus } from "@/Interfaces/userBookStatus";
import { fetchCoverImage } from "@/utils/fetchBookData";
import { Platform } from "react-native";

const statusLabels: Record<BookStatus, string> = {
  [BookStatus.NOT_READ]: "Not Read",
  [BookStatus.READING]: "Reading",
  [BookStatus.READ]: "Finished",
};

export default function ReadingListScreen() {
  const [bookStatuses, setBookStatuses] = useState<UserBookStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<BookStatus | "ALL">("ALL");

  const fetchReadingList = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing or expired");
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user-book-status/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reading list: ${response.statusText}`);
      }

      const data: UserBookStatus[] = await response.json();
      
      // Enrich books with cover images
      const enrichedData = await Promise.all(
        data.map(async (item) => {
          if (item.book && !item.book.cover) {
            const coverUrl = await fetchCoverImage(item.book.title, item.book.author);
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

    return (
      <TouchableOpacity
        onPress={() => router.push(`/BookDetails/${item.book!.id}`)}
        style={{
          flexDirection: "row",
          backgroundColor: "rgba(0,0,0,0.4)",
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        }}
      >
        {item.book.cover ? (
          <Image
            source={{ uri: item.book.cover }}
            style={{ width: 60, height: 90, borderRadius: 8, marginRight: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 60,
              height: 90,
              borderRadius: 8,
              backgroundColor: "#d1d5db",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ color: "#666", fontSize: 10, textAlign: "center" }}>No Cover</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#f0dcc7", fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
            {item.book.title}
          </Text>
          <Text style={{ color: "#f0dcc7", fontSize: 14, marginBottom: 4 }}>
            {item.book.author}
          </Text>
          <View
            style={{
              backgroundColor:
                item.status === BookStatus.READ
                  ? "#10b981"
                  : item.status === BookStatus.READING
                  ? "#f59e0b"
                  : "#6b7280",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              {statusLabels[item.status as BookStatus] || item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <View style={{ paddingTop: 60 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#f0dcc7",
                marginBottom: 12,
              }}
            >
              Reading List
            </Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <TouchableOpacity
                onPress={() => setSelectedFilter("ALL")}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: selectedFilter === "ALL" ? "#bf471b" : "rgba(0,0,0,0.4)",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>All</Text>
              </TouchableOpacity>
              {Object.values(BookStatus).map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelectedFilter(status)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor:
                      selectedFilter === status ? "#bf471b" : "rgba(0,0,0,0.4)",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 12 }}>
                    {statusLabels[status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#bf471b" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              contentContainerStyle={{ padding: 16, paddingTop: 0 }}
              data={filteredStatuses}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bf471b" />
              }
              renderItem={renderBookItem}
              ListEmptyComponent={
                <View
                  style={{
                    alignItems: "center",
                    marginTop: 40,
                    padding: 20,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#f0dcc7", fontSize: 16 }}>
                    {selectedFilter === "ALL"
                      ? "No books in your reading list yet."
                      : `No books with status "${statusLabels[selectedFilter as BookStatus]}".`}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}


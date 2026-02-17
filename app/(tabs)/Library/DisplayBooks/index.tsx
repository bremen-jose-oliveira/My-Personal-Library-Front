import { useBookContext } from "@/utils/Context/BookContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";

export default function DisplayBooks() {
  const { books, fetchCurrentUserBooks } = useBookContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUserBooks();
    } catch (error) {
      console.error("Error refreshing books:", error);
    }
    setRefreshing(false); // Ensure this happens last
  };

  const statusMap: { [key: string]: string } = {
    NOT_READ: "Not read",
    READING: "Reading",
    READ: "Finished",
  };

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <FlatList
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 8,
          paddingBottom: 16,
        }}
        data={books}
        numColumns={Platform.OS === "web" ? 8 : 4}
        keyExtractor={(book: { id?: number }) =>
          book.id ? book.id.toString() : Math.random().toString()
        }
        renderItem={({ item: book }) => (
          <Link href={`/BookDetails/${book.id}`} asChild>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                margin: 6,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 12,
                overflow: "hidden",
                padding: 12,
                gap: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {book.cover ? (
                <Image
                  style={{
                    width: 100,
                    height: 144,
                    resizeMode: "contain",
                    borderRadius: 6,
                  }}
                  source={{ uri: book.cover }}
                  onError={(error) => {
                    console.error(
                      `Failed to load cover image for "${book.title}":`,
                      error.nativeEvent.error
                    );
                  }}
                  onLoad={() => {}}
                />
              ) : (
                <Image
                  style={{
                    width: 100,
                    height: 144,
                    resizeMode: "contain",
                    borderRadius: 6,
                  }}
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/7340/7340665.png",
                  }}
                />
              )}
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: "#333",
                    fontWeight: "600",
                    textAlign: "center",
                    fontSize: 14,
                  }}
                  numberOfLines={2}
                >
                  {book.title}
                </Text>
                {book.readingStatus && (
                  <Text style={{ color: "#667eea", fontSize: 12, marginTop: 4 }}>
                    {statusMap[book.readingStatus] ?? book.readingStatus}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Link>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
        keyboardShouldPersistTaps="handled"
      />
    </LinearGradient>
  );
}

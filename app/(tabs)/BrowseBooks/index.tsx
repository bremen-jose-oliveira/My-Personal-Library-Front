import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useBookContext } from "@/utils/Context/BookContext";
import Book from "@/Interfaces/book";

export default function BrowseBooksScreen() {
  const { fetchAllBooks } = useBookContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBooks = async () => {
    try {
      const allBooks = await fetchAllBooks();
      setBooks(allBooks);
    } catch (error) {
      console.error("Error loading books:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
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
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{
            paddingTop: 16,
            paddingHorizontal: 8,
            paddingBottom: 16,
          }}
          data={books}
          numColumns={Platform.OS === "web" ? 8 : 4}
          keyExtractor={(item) => item.id.toString()}
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
                    onLoad={() => {
                      console.log(
                        `✅ Successfully loaded cover for: ${book.title}`
                      );
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 144,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#e9ecef",
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#666",
                        fontSize: 12,
                        lineHeight: 16,
                        textAlign: "center",
                      }}
                    >
                      No Image
                    </Text>
                  </View>
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
                  {book.ownerUsername && (
                    <Text
                      style={{
                        color: "#667eea",
                        fontSize: 11,
                        marginTop: 4,
                      }}
                    >
                      by {book.ownerUsername}
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
      )}
    </LinearGradient>
  );
}

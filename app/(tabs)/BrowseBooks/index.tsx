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
  Platform,
  Dimensions,
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

  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (Platform.OS === "web") {
      const width = Dimensions.get("window").width;
      if (width > 1200) return 6;
      if (width > 768) return 4;
      return 2;
    }
    // Mobile: 2 columns for better readability
    return 2;
  };

  const numColumns = getNumColumns();

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.85)", "rgba(255,255,255,0.95)"]}
        style={{
          flex: 1,
        }}
      >
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#bf471b" />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{
              padding: 16,
              paddingTop: 8,
            }}
            data={books}
            numColumns={numColumns}
            key={numColumns} // Force re-render when columns change
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: book }) => (
              <Link href={`/BookDetails/${book.id}`} asChild>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    margin: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: 12,
                    overflow: "hidden",
                    padding: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    maxWidth: Platform.OS === "web" ? "calc(50% - 16px)" : undefined,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    {book.cover ? (
                      <Image
                        style={{
                          width: 120,
                          height: 180,
                          resizeMode: "cover",
                          borderRadius: 8,
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
                          width: 120,
                          height: 180,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#e5e7eb",
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#6b7280",
                            fontSize: 12,
                            textAlign: "center",
                            paddingHorizontal: 8,
                          }}
                        >
                          No Cover
                        </Text>
                      </View>
                    )}
                    <View style={{ marginTop: 12, width: "100%" }}>
                      <Text
                        style={{
                          color: "#1f2937",
                          fontWeight: "700",
                          textAlign: "center",
                          fontSize: 14,
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {book.title}
                      </Text>
                      {book.author && (
                        <Text
                          style={{
                            color: "#6b7280",
                            fontSize: 12,
                            textAlign: "center",
                            marginBottom: 4,
                          }}
                          numberOfLines={1}
                        >
                          by {book.author}
                        </Text>
                      )}
                      {book.ownerUsername && (
                        <Text
                          style={{
                            color: "#bf471b",
                            fontSize: 11,
                            textAlign: "center",
                            fontWeight: "600",
                          }}
                          numberOfLines={1}
                        >
                          Owner: {book.ownerUsername}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#bf471b"
                colors={["#bf471b"]}
              />
            }
            keyboardShouldPersistTaps="handled"
          />
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

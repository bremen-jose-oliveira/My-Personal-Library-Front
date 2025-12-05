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
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#bf471b" />
          </View>
        ) : (
          <>
            <View style={{ paddingTop: 60, paddingHorizontal: 16, marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#f0dcc7",
                }}
              >
                Browse All Books
              </Text>
            </View>
            <FlatList
              contentContainerStyle={{
                flex: 1,
                width: "100%",
                paddingTop: 0,
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
                      margin: 4,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      borderRadius: 10,
                      overflow: "hidden",
                      padding: 8,
                      gap: 8,
                    }}
                  >
                    {book.cover ? (
                      <Image
                        style={{
                          width: 100,
                          height: 144,
                          resizeMode: "contain",
                        }}
                        source={{ uri: book.cover }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 100,
                          height: 144,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#d1d5db",
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: "#f0dcc7",
                            fontSize: 12,
                            lineHeight: 16,
                            textAlign: "center",
                          }}
                        >
                          No Image Available
                        </Text>
                      </View>
                    )}
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={{
                          color: "#f8f0e5",
                          fontWeight: "600",
                          textAlign: "center",
                        }}
                      >
                        {book.title}
                      </Text>
                      {book.ownerUsername && (
                        <Text style={{ color: "#bf471b", fontSize: 10, marginTop: 2 }}>
                          by {book.ownerUsername}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </Link>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bf471b" />
              }
              keyboardShouldPersistTaps="handled"
            />
          </>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}


import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Book from "@/Interfaces/book";
import { fetchCoverImage } from "@/utils/fetchBookData";

export default function FriendBooksScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friendName, setFriendName] = useState<string>("");

  const fetchFriendBooks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing or expired");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/books/user/${encodeURIComponent(
          email || ""
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      const data: Book[] = await response.json();

      // Enrich books with cover images
      const booksWithCovers = await Promise.all(
        data.map(async (book) => ({
          ...book,
          cover: book.cover || (await fetchCoverImage(book.title, book.author)),
        }))
      );

      setBooks(booksWithCovers);

      // Extract friend name from first book's owner if available
      if (data.length > 0 && (data[0].ownerUsername || data[0].owner)) {
        setFriendName(
          data[0].ownerUsername || data[0].owner || email || "Friend"
        );
      } else {
        setFriendName(email || "Friend");
      }
    } catch (error) {
      console.error("Error fetching friend's books:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchFriendBooks();
    }
  }, [email]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriendBooks();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#bf471b" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/Background.jpg")}
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
        {books.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                top: 60,
                left: 16,
                padding: 8,
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#f0dcc7", fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#f0dcc7",
                marginBottom: 16,
              }}
            >
              {friendName}'s Library
            </Text>
            <View
              style={{
                padding: 20,
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#f0dcc7", fontSize: 16 }}>
                {friendName} hasn't added any books yet.
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View
              style={{
                position: "absolute",
                top: 60,
                left: 16,
                right: 16,
                zIndex: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  padding: 8,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#f0dcc7", fontSize: 16 }}>← Back</Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#f0dcc7",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {friendName}'s Library
              </Text>
              <View style={{ width: 80 }} />
            </View>
            <FlatList
              contentContainerStyle={{
                flex: 1,
                width: "100%",
                height: "100%",
                paddingTop: 100,
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
                        <Text
                          style={{
                            color: "#bf471b",
                            fontSize: 10,
                            marginTop: 4,
                            textAlign: "center",
                          }}
                        >
                          Owned by {book.ownerUsername}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </Link>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              keyboardShouldPersistTaps="handled"
            />
          </>
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

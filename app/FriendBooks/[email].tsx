import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Book from "@/Interfaces/book";
import { fetchCoverImage } from "@/utils/fetchBookData";
import { Colors } from "@/constants/Colors";

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {books.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.libraryTitle}>
            {friendName}'s Library
          </Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {friendName} hasn't added any books yet.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {friendName}'s Library
            </Text>
            <View style={{ width: 80 }} />
          </View>
          <FlatList
            contentContainerStyle={styles.listContent}
            data={books}
            numColumns={Platform.OS === "web" ? 8 : 4}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: book }) => (
              <Link href={`/BookDetails/${book.id}`} asChild>
                <TouchableOpacity style={styles.bookCard}>
                  {book.cover ? (
                    <Image
                      style={styles.coverImage}
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
                    <View style={styles.noImagePlaceholder}>
                      <Text style={styles.noImageText}>
                        No Image Available
                      </Text>
                    </View>
                  )}
                  <View style={{ alignItems: "center" }}>
                    <Text style={styles.bookTitle}>
                      {book.title}
                    </Text>
                    {book.ownerUsername && (
                      <Text style={styles.ownerText}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: Colors.primaryFaded,
    borderRadius: 8,
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  libraryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  emptyCard: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  headerRow: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  listContent: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: 100,
  },
  bookCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    padding: 8,
    gap: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  coverImage: {
    width: 100,
    height: 144,
    resizeMode: "contain",
  },
  noImagePlaceholder: {
    width: 100,
    height: 144,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
  },
  noImageText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  bookTitle: {
    color: Colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  ownerText: {
    color: Colors.primary,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
});

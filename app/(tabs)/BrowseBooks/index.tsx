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
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { useBookContext } from "@/utils/Context/BookContext";
import Book from "@/Interfaces/book";
import { Colors } from "@/constants/Colors";

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
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Browse All Books</Text>
          </View>
          <FlatList
            contentContainerStyle={styles.listContentContainer}
            data={books}
            numColumns={Platform.OS === "web" ? 8 : 4}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: book }) => (
              <Link href={`/BookDetails/${book.id}`} asChild>
                <TouchableOpacity style={styles.bookCard}>
                  {book.cover ? (
                    <Image
                      style={styles.bookCover}
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
                    <View style={styles.noImageContainer}>
                      <Text style={styles.noImageText}>
                        No Image Available
                      </Text>
                    </View>
                  )}
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    {book.ownerUsername && (
                      <Text style={styles.ownerText}>
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
                tintColor={Colors.primary}
              />
            }
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  listContentContainer: {
    flex: 1,
    width: "100%",
    paddingTop: 0,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bookCover: {
    width: 100,
    height: 144,
    resizeMode: "contain",
  },
  noImageContainer: {
    width: 100,
    height: 144,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
  },
  noImageText: {
    color: Colors.placeholder,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
  bookInfo: {
    alignItems: "center",
  },
  bookTitle: {
    color: Colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  ownerText: {
    color: Colors.primary,
    fontSize: 10,
    marginTop: 2,
  },
});

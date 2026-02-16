import { useBookContext } from "@/utils/Context/BookContext";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  Platform,
  TouchableOpacity,
  StyleSheet,
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
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={books}
        numColumns={Platform.OS === "web" ? 8 : 4}
        keyExtractor={(book: { id?: number }) =>
          book.id ? book.id.toString() : Math.random().toString()
        }
        renderItem={({ item: book }) => (
          <Link href={`/BookDetails/${book.id}`} asChild>
            <TouchableOpacity style={styles.card}>
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
                  onLoad={() => {}}
                />
              ) : (
                <Image
                  style={styles.coverImage}
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/7340/7340665.png",
                  }}
                />
              )}
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                {book.readingStatus && (
                  <Text style={styles.bookStatus}>
                    Status:{" "}
                    {statusMap[book.readingStatus] ?? book.readingStatus}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  card: {
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
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  coverImage: {
    width: 100,
    height: 144,
    resizeMode: "contain",
  },
  bookInfo: {
    alignItems: "center",
  },
  bookTitle: {
    color: Colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  bookStatus: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});

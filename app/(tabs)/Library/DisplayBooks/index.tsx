import { useBookContext } from "@/utils/Context/BookContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { BookCard } from "@/components/BookCard";

export default function DisplayBooks() {
  const { books, fetchCurrentUserBooks } = useBookContext();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUserBooks();
    } catch (error) {
      console.error("Error refreshing books:", error);
    }
    setRefreshing(false);
  };

  const numColumns = Platform.OS === "web" ? 6 : 2;

  return (
    <LinearGradient
      colors={["#f5f5f5", "#ffffff"]}
      className="flex-1"
    >
      {books.length === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-gray-500 text-center text-lg mb-2">
            No books in your library yet
          </Text>
          <Text className="text-gray-400 text-center">
            Add your first book to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 8,
            paddingVertical: 12,
          }}
          data={books}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(book) => book.id ? book.id.toString() : Math.random().toString()}
          renderItem={({ item: book }) => (
            <BookCard
              book={book}
              onPress={() => router.push(`/BookDetails/${book.id}`)}
            />
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
  );
}

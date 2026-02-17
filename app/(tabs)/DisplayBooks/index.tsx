// app/DisplayBooks/index.tsx
import { useBookContext } from '@/utils/Context/BookContext';
import React, { useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, Button, RefreshControl } from 'react-native';

export default function DisplayBooks() {
  const { books, deleteBook, fetchCurrentUserBooks } = useBookContext();
  const [refreshing, setRefreshing] = useState(false);

  // Function to handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    try {
       fetchCurrentUserBooks(); 
    } catch (error) {
      console.error('Failed to refresh books', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteBook = (id: number) => {
    deleteBook(id);
  };

  return (
    <FlatList
      data={books}
      keyExtractor={(book) => (book.id ? book.id.toString() : Math.random().toString())} // Use random key as fallback
      renderItem={({ item: book }) => (
        <View className="flex-row bg-white mb-4 p-4 rounded-lg boxShadow-lg">
          {book.cover ? (
            <Image
              className="w-24 h-36 mr-4 rounded-lg bg-gray-200"
              source={{ uri: book.cover }}
            />
          ) : (
            <View className="w-24 h-36 items-center justify-center mr-4 bg-gray-300 rounded-lg">
              <Text className="text-gray-500 text-xs">No Image Available</Text>
            </View>
          )}
          <View className="flex-1 justify-between">
            <Text className="text-lg font-bold mb-1">{book.title}</Text>
            <Text className="text-base text-gray-700 mb-1">Author: {book.author}</Text>
            <Text className="text-sm text-gray-600">Year: {book.year}</Text>
            <Text className="text-sm text-gray-600">Publisher: {book.publisher}</Text>   
            <Button title="Delete Book" onPress={() => handleDeleteBook(book.id)} />
          </View>
        </View>
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
}

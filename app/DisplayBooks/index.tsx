// app/DisplayBooks/index.tsx
import React from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, Button } from 'react-native';
import { useBookContext } from '../Context/BookContext';


export default function DisplayBooks() {
  const { books, deleteBook, fetchBooks } = useBookContext();

  const handleDeleteBook = (id: number) => {
    deleteBook(id);
  };


  return (
    <FlatList
      data={books}
      keyExtractor={(book) => book.id.toString()}
      renderItem={({ item: book }) => (
        <View className="flex-row bg-white mb-4 p-4 rounded-lg shadow-lg">
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
    />
  );
}

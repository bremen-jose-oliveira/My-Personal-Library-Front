import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, Button, Alert, FlatList } from 'react-native';

interface Book {
  id: number;
  cover: string | null;
  title: string;
  author: string;
  year: number;
  publisher: string;
  rating: number;
}

export default function DisplayBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://192.168.2.41:8080/api/books');
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data: Book[] = await response.json();

      const booksWithCovers = await Promise.all(
        data.map(async (book) => {
          if (!book.cover) {
            const coverUrl = await fetchCoverImage(book.title, book.author);
            return { ...book, cover: coverUrl };
          }
          return book;
        })
      );

      setBooks(booksWithCovers);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      Alert.alert('Error', 'Failed to fetch books. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (bookData) => {
    setSelectedBook(bookData);
  };

  const handleDeleteBook = async (id) => {
    try {
      const response = await fetch(`http://192.168.2.41:8080/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Book deleted successfully!');
        setBooks(books.filter(book => book.id !== id));
      } else {
        console.log('Failed to delete book with id:', id);
        throw new Error(`Failed to delete book: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      Alert.alert('Error', 'Failed to delete book. Please try again.');
    }
  };

  const fetchCoverImage = async (title: string, author: string): Promise<string | null> => {
    const query = `${title} ${author}`.replace(/\s+/g, '+');
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`;
    const noUrl = `https://cdn-icons-png.flaticon.com/512/7340/7340665.png`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const coverUrl = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || noUrl || null;
      return coverUrl;
    } catch (error) {
      console.error('Failed to fetch cover image:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading books...</Text>
      </View>
    );
  }

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

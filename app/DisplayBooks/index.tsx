import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Button, Alert, FlatList } from 'react-native';

interface Book {
  id: number;
  cover: string | null;
  title: string;
  author: string;
  year: number;
  publisher: string;
  rating: number,
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
      setBooks(books.filter(book => book.id !== id));  // Update the books state after delete
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
    const noUrl =`https://cdn-icons-png.flaticon.com/512/7340/7340665.png`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      const coverUrl = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || noUrl ||null;
      return coverUrl;
    } catch (error) {
      console.error('Failed to fetch cover image:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
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
    <View style={styles.bookContainer}>
      {book.cover ? (
        <Image
          style={styles.bookCover}
          source={{ uri: book.cover }}
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No Image Available</Text>
        </View>
      )}
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Text style={styles.bookAuthor}>Author: {book.author}</Text>
        <Text style={styles.bookInfo}>Year: {book.year}</Text>
        <Text style={styles.bookInfo}>Publisher: {book.publisher}</Text>
        <Button title="Delete Book" onPress={() => handleDeleteBook(book.id)} />
      </View>
    </View>
  )}
/>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  bookContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookCover: {
    width: 100,
    height: 150,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  noImageContainer: {
    width: 100,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  noImageText: {
    color: '#808080',
    fontSize: 12,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'space-around',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  bookInfo: {
    fontSize: 14,
    color: '#777',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

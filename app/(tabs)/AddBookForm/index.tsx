// app/AddBookForm/index.tsx
import BarcodeScanner from '@/components/BarcodeScanner';
import { useBookContext } from '@/utils/Context/BookContext';
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, Image, Alert, Modal, Platform } from 'react-native';
interface Book {
  id: number;
  cover: string | null;
  title: string;
  author: string;
  year: number;
  publisher: string;
  rating: number;
}
export default function AddBookForm() {
  const { addBook } = useBookContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  // Fetch book data based on ISBN or search query
  const fetchBooks = async (query: string) => {
    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;

    try {
      const response = await fetch(googleBooksApiUrl);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to fetch book data. Please try again.');
    }
  };

  // Handle ISBN scanned from the barcode scanner
  const handleISBNScanned = (isbn: string) => {
    setScannerVisible(false);
    fetchBooks(isbn); // Fetch book data using the scanned ISBN
  };

  // Select book from search results
  const handleBookSelect = (bookData: any) => {
    setSelectedBook(bookData);
    setSearchQuery(''); // Clear the search input
    setSearchResults([]); // Clear search results
  };

  // Add selected book to the global state
  const handleAddBook = () => {
    if (!selectedBook) return;
  
    const bookData:Book= {
      title: selectedBook.volumeInfo.title,
      author: selectedBook.volumeInfo.authors.join(', '),
      year: selectedBook.volumeInfo.publishedDate ? selectedBook.volumeInfo.publishedDate.substring(0, 4) : '',
      publisher: selectedBook.volumeInfo.publisher || '',
      cover: selectedBook.volumeInfo.imageLinks?.thumbnail || '',
      id: 0,
      rating: 0
    };

    addBook(bookData);
    setSelectedBook(null);
    Alert.alert('Success', 'Book added successfully!');
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Search for a book..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title="Search" onPress={() => fetchBooks(searchQuery)} />

              {/* Render "Open Barcode Scanner" only if not on iOS Web */}
      {Platform.OS !== 'web' && (
        <Button title="Open Barcode Scanner" onPress={() => setScannerVisible(true)} />
      )}

    
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleBookSelect(item)}>
              <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
                {item.volumeInfo.imageLinks?.thumbnail ? (
                  <Image source={{ uri: item.volumeInfo.imageLinks.thumbnail }} style={{ width: 50, height: 75, marginRight: 10 }} />
                ) : null}
                <View>
                  <Text style={{ fontWeight: 'bold' }}>{item.volumeInfo.title}</Text>
                  <Text>{item.volumeInfo.authors?.join(', ') || 'Unknown Author'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedBook && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Selected Book:</Text>
          <Text>Title: {selectedBook.volumeInfo.title}</Text>
          <Text>Author: {selectedBook.volumeInfo.authors.join(', ')}</Text>
          <Button title="Add Book" onPress={handleAddBook} />
        </View>
      )}

      <Modal visible={scannerVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <BarcodeScanner onISBNScanned={handleISBNScanned} />
          <Button title="Close Scanner" onPress={() => setScannerVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

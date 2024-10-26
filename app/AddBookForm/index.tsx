import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BarcodeScanner from '@/components/BarcodeScanner';

const AddBookForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const navigation = useNavigation();

  // Clear the search query when navigating away
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSearchQuery(''); // Clear search query on focus out
        setSearchResults([]); // Clear search results on focus out
        setSelectedBook(null); // Clear selected book on focus out
      };
    }, [])
  );

  // Function to fetch books based on the search query
  const fetchBooks = async () => {
    if (!searchQuery) return;

    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=40`;

    try {
      const response = await fetch(googleBooksApiUrl);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to fetch book data. Please try again.');
    }
  };

  // Function to handle book selection from search results
  const handleBookSelect = (bookData) => {
    setSelectedBook(bookData);
    setSearchQuery(''); // Clear the search input
    setSearchResults([]); // Clear search results
  };

  // Function to add the selected book to the collection
  const handleAddBook = async () => {
    if (!selectedBook) return;

    const bookData = {
      title: selectedBook.volumeInfo.title,
      author: selectedBook.volumeInfo.authors.join(', '),
      year: selectedBook.volumeInfo.publishedDate ? selectedBook.volumeInfo.publishedDate.substring(0, 4) : '',
      publisher: selectedBook.volumeInfo.publisher || '',
      cover: selectedBook.volumeInfo.imageLinks.thumbnail || ''
    };

    try {
      const response = await fetch('http://192.168.2.41:8080/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Book added successfully!');
        setSelectedBook(null); // Reset selected book
      } else {
        throw new Error(`Failed to add book: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      Alert.alert('Error', 'Failed to add book. Please try again.');
    }
  };

  // Function to handle the scanned ISBN
  const handleISBNScanned = (isbn) => {
    console.log(`ISBN scanned: ${isbn}`);
    setScannerVisible(false);
    setSearchQuery(isbn); // Update search query with scanned ISBN
    fetchBooks(); // Automatically trigger the book fetch after setting the ISBN
  };

  // Function to handle manual search button click
  const handleManualSearch = () => {
    fetchBooks(); // Trigger fetchBooks when the search button is clicked
  };

  // Function to clear the search input
  const clearSearchInput = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedBook(null);
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Search for a book..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      <Button title="Search" onPress={handleManualSearch} />
      <Button title="Clear" onPress={clearSearchInput} />

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const book = item.volumeInfo;
            return (
              <TouchableOpacity onPress={() => handleBookSelect(item)}>
                <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center' }}>
                  {book.imageLinks ? (
                    <Image
                      source={{ uri: book.imageLinks.thumbnail }}
                      style={{ width: 50, height: 75, marginRight: 10 }}
                    />
                  ) : null}
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>{book.title}</Text>
                    <Text>{book.authors ? book.authors.join(', ') : 'Unknown Author'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
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

      <Button title="Open Barcode Scanner" onPress={() => setScannerVisible(true)} />

      <Modal visible={scannerVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <BarcodeScanner onISBNScanned={handleISBNScanned} />
          <Button title="Close Scanner" onPress={() => setScannerVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

export default AddBookForm;

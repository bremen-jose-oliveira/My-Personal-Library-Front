import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, Image, Alert } from 'react-native';

const AddBookForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch books from Google Books API
  const fetchBooks = async () => {
    if (!searchQuery) return;

    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}`;

    try {
      const response = await fetch(googleBooksApiUrl);
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to fetch book data. Please try again.');
    }
  };

  const handleBookSelect = (bookData) => {
    setSelectedBook(bookData);
    setSearchQuery(''); // Clear the search input
    setSearchResults([]); // Clear search results
  };

  const handleAddBook = async () => {
    if (!selectedBook) return;

    const bookData = {
      title: selectedBook.volumeInfo.title,
      author: selectedBook.volumeInfo.authors.join(', '),
      year: selectedBook.volumeInfo.publishedDate ? selectedBook.volumeInfo.publishedDate.substring(0, 4) : '',
      publisher: selectedBook.volumeInfo.publisher || '',
    
      
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

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Search for a book..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={fetchBooks}
        style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 20 }}
      />

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
    </View>
  );
};

export default AddBookForm;
  
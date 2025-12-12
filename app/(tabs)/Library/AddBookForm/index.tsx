// app/AddBookForm/index.tsx

import BarcodeScanner from "@/components/BarcodeScanner";
import Book from "@/Interfaces/book";
import { useBookContext } from "@/utils/Context/BookContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Platform,
  ImageBackground,
} from "react-native";

export default function AddBookForm() {
  const { addBook } = useBookContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch book data based on ISBN or search query
  const fetchBooks = async (query: string, reset: boolean = false) => {
    if (loading) return;
    setLoading(true);

    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=40&startIndex=${reset ? 0 : startIndex}`;

    try {
      const response = await fetch(googleBooksApiUrl);
      const data = await response.json();

      setSearchResults((prevResults) => {
        const newResults = data.items || [];
        const uniqueResults = [...prevResults, ...newResults].reduce(
          (acc, book) => {
            if (
              !acc.some(
                (existingBook: { id: any }) => existingBook.id === book.id
              )
            ) {
              acc.push(book);
            }
            return acc;
          },
          []
        );
        return reset ? newResults : uniqueResults;
      });
      setStartIndex((prevIndex) => (reset ? 40 : prevIndex + 40));
    } catch (error) {
      console.error("Error fetching books:", error);
      Alert.alert("Error", "Failed to fetch book data. Please try again.");
    } finally {
      setLoading(false);
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
    setSearchQuery(""); // Clear the search input
    setSearchResults([]); // Clear search results
  };

  // Add selected book to the global state
  const handleAddBook = () => {
    if (!selectedBook) return;

    const bookData: Book = {
      title: selectedBook.volumeInfo.title,
      author: selectedBook.volumeInfo.authors?.join(", ") || "Unknown Author",
      year: selectedBook.volumeInfo.publishedDate
        ? selectedBook.volumeInfo.publishedDate.substring(0, 4)
        : "",
      publisher: selectedBook.volumeInfo.publisher || "",
      cover: selectedBook.volumeInfo.imageLinks?.thumbnail || "",
      id: selectedBook.identifier,
      isbn:
        selectedBook.volumeInfo.industryIdentifiers?.[0]?.identifier || "N/A",
      owner: undefined,
      exchangeStatus: undefined,
      exchanges: undefined,
      reviews: undefined,
      reviewCount: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      readingStatus: undefined,
    };

    addBook(bookData);
    setSelectedBook(null);
    router.push("/Library/DisplayBooks");

    if (Platform.OS === "web") {
      // Web-specific alert
      window.confirm("Success " + " Book added successfully!");
    } else {
      Alert.alert("Success", "Book added successfully!");
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={{
        flex: 1, // Take full screen
        width: "100%", // Make sure it spans full width
        height: "100%", // Make sure it spans full height
        justifyContent: "center", // Center content vertically
        alignItems: "center", // Center content horizontally
      }}
      resizeMode="cover" // Ensures the image covers the screen
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: "flex-start",
        }}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <TextInput
            placeholder="Search for a book..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderColor: "gray",
              backgroundColor: "rgba(0,0,0,0.4)",
              padding: 10,
              marginBottom: 20,
              fontSize: 15,
              borderRadius: 8,
              color: "#f0dcc7",
            }}
          />
          <Button
            title="Search"
            onPress={() => {
              setStartIndex(0);
              fetchBooks(searchQuery, true);
            }}
            color="#bf471b"
          />
          {/* Render "Open Barcode Scanner" only if not on iOS Web */}

          <Button
            color="#bf471b"
            title="Open Scanner"
            onPress={() => setScannerVisible(true)}
          />

          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item: any, index: number) =>
                `${
                  item.id ||
                  item.volumeInfo?.industryIdentifiers?.[0]?.identifier ||
                  index
                }`
              }
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleBookSelect(item)}>
                  <View
                    style={{
                      flexDirection: "row",
                      padding: 10,
                      alignItems: "center",
                    }}
                  >
                    {item.volumeInfo.imageLinks?.thumbnail ? (
                      <Image
                        source={{ uri: item.volumeInfo.imageLinks.thumbnail }}
                        style={{ width: 50, height: 75, marginRight: 10 }}
                      />
                    ) : null}
                    <View
                      style={{
                        flex: 1,
                        padding: 17,
                        borderRadius: 2,
                        borderBlockColor: "#f0dcc7",
                        backgroundColor: "rgba(0,0,0,0.4)",
                      }}
                    >
                      <Text style={{ fontWeight: "bold", color: "#f0dcc7" }}>
                        {item.volumeInfo.title}
                      </Text>
                      <Text style={{ color: "#f0dcc7" }}>
                        {item.volumeInfo.authors?.join(", ") ||
                          "Unknown Author"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingBottom: 100 }}
              style={{ height: 800 }}
              keyboardShouldPersistTaps="handled"
            />
          )}
          {selectedBook && (
            <ScrollView
              style={{
                marginTop: 20,
                backgroundColor: "rgba(0,0,0,0.4)",
                padding: 8,
                borderRadius: 8,
                maxHeight: 400, // Ensure the box has a max height
              }}
            >
              <View style={{ alignItems: "center" }}>
                {selectedBook.volumeInfo.imageLinks?.thumbnail ? (
                  <Image
                    source={{
                      uri: selectedBook.volumeInfo.imageLinks.thumbnail,
                    }}
                    style={{ width: 65, height: 90, marginBottom: 10 }}
                  />
                ) : null}
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  Title: {selectedBook.volumeInfo.title || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  Author:{" "}
                  {selectedBook.volumeInfo.authors?.join(", ") ||
                    "Unknown Author"}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  Publisher: {selectedBook.volumeInfo.publisher || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  Published Date: {selectedBook.volumeInfo.publishedDate || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  Categories: {selectedBook.volumeInfo.categories || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  Description: {selectedBook.volumeInfo.description || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  isbn:{" "}
                  {selectedBook.volumeInfo.industryIdentifiers?.[0]
                    ?.identifier || "N/A"}
                </Text>
                <Button
                  title="Add Book"
                  onPress={handleAddBook}
                  color="#bf471b"
                />
              </View>
            </ScrollView>
          )}

          <Modal visible={Boolean(scannerVisible)} animationType="slide">
            <View style={{ flex: 1 }}>
              <BarcodeScanner onISBNScanned={handleISBNScanned} />
              <Button
                title="Close Scanner"
                onPress={() => setScannerVisible(false)}
                color="#bf471b"
              />
            </View>
          </Modal>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

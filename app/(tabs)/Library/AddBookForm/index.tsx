import BarcodeScanner from "@/components/BarcodeScanner";
import Book from "@/Interfaces/book";
import { useBookContext } from "@/utils/Context/BookContext";
import { fetchCoverImage } from "@/utils/fetchBookData";
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
  const [addingBook, setAddingBook] = useState(false);

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

  const clearSearchState = () => {
    setSearchResults([]);
    setSelectedBook(null);
    setSearchQuery("");
    setStartIndex(0);
  };

  const handleISBNScanned = (isbn: string) => {
    setScannerVisible(false);
    clearSearchState();
    const isbnQuery = `isbn:${isbn}`;
    fetchBooks(isbnQuery, true);
  };

  const handleBookSelect = (bookData: any) => {
    setSelectedBook(bookData);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleAddBook = async () => {
    if (!selectedBook || addingBook) return; // Prevent double submission

    setAddingBook(true);

    let coverUrl =
      selectedBook.volumeInfo.imageLinks?.thumbnail ||
      selectedBook.volumeInfo.imageLinks?.smallThumbnail ||
      selectedBook.volumeInfo.imageLinks?.small ||
      selectedBook.volumeInfo.imageLinks?.medium ||
      selectedBook.volumeInfo.imageLinks?.large ||
      null;

    if (coverUrl) {
      coverUrl = coverUrl.startsWith("http://")
        ? coverUrl.replace("http://", "https://")
        : coverUrl;
    }

    if (!coverUrl) {
      const title = selectedBook.volumeInfo.title;
      const author =
        selectedBook.volumeInfo.authors?.join(", ") || "Unknown Author";
      coverUrl = await fetchCoverImage(title, author);
    }

    if (!coverUrl || coverUrl.trim() === "") {
      coverUrl = "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";
    }

    const bookData: Book = {
      title: selectedBook.volumeInfo.title,
      author: selectedBook.volumeInfo.authors?.join(", ") || "Unknown Author",
      year: selectedBook.volumeInfo.publishedDate
        ? selectedBook.volumeInfo.publishedDate.substring(0, 4)
        : "",
      publisher: selectedBook.volumeInfo.publisher || "",
      cover: coverUrl,
      description: selectedBook.volumeInfo.description || null,
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

    try {
      await addBook(bookData);
      setSelectedBook(null);
      router.push("/Library/DisplayBooks");

      if (Platform.OS === "web") {
        window.confirm("Success " + " Book added successfully!");
      } else {
        Alert.alert("Success", "Book added successfully!");
      }
    } catch (error: any) {
      console.error("Error adding book:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add book. Please try again."
      );
    } finally {
      setAddingBook(false);
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
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <View style={{ flex: 1, marginRight: 5 }}>
              <Button
                title="Search"
                onPress={() => {
                  setStartIndex(0);
                  fetchBooks(searchQuery, true);
                }}
                color="#bf471b"
              />
            </View>
          </View>

          {/* Render "Open Barcode Scanner" only if not on iOS Web */}
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            <View
              style={{ flex: 1, marginRight: searchResults.length > 0 ? 5 : 0 }}
            >
              <Button
                color="#bf471b"
                title="Open Scanner"
                onPress={() => {
                  clearSearchState(); // Clear previous results when opening scanner
                  setScannerVisible(true);
                }}
              />
            </View>
            {searchResults.length > 0 && (
              <View style={{ flex: 1, marginLeft: 5 }}>
                <Button
                  color="#666"
                  title="Clear Results"
                  onPress={clearSearchState}
                />
              </View>
            )}
          </View>

          {searchResults.length > 0 && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{ color: "#f0dcc7", fontSize: 16, fontWeight: "bold" }}
                >
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""}
                </Text>
                <Button color="#666" title="Clear" onPress={clearSearchState} />
              </View>
              <FlatList
                data={searchResults}
                keyExtractor={(item: any, index: number) =>
                  `${
                    item.id ||
                    item.volumeInfo?.industryIdentifiers?.[0]?.identifier ||
                    index
                  }`
                }
                renderItem={({ item }) => {
                  let coverUrl =
                    item.volumeInfo.imageLinks?.thumbnail ||
                    item.volumeInfo.imageLinks?.smallThumbnail ||
                    item.volumeInfo.imageLinks?.small ||
                    item.volumeInfo.imageLinks?.medium ||
                    item.volumeInfo.imageLinks?.large ||
                    null;

                  if (coverUrl) {
                    coverUrl = coverUrl.startsWith("http://")
                      ? coverUrl.replace("http://", "https://")
                      : coverUrl;
                  }

                  const finalCoverUrl =
                    coverUrl ||
                    "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";

                  return (
                    <TouchableOpacity onPress={() => handleBookSelect(item)}>
                      <View
                        style={{
                          flexDirection: "row",
                          padding: 10,
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <Image
                          source={{ uri: finalCoverUrl }}
                          style={{
                            width: 50,
                            height: 75,
                            marginRight: 10,
                            resizeMode: "contain",
                          }}
                          onError={(error) => {
                            console.error(
                              `Failed to load cover for "${item.volumeInfo.title}":`,
                              error
                            );
                          }}
                        />
                        <View
                          style={{
                            flex: 1,
                            padding: 17,
                            borderRadius: 2,
                            borderBlockColor: "#f0dcc7",
                            backgroundColor: "rgba(0,0,0,0.4)",
                          }}
                        >
                          <Text
                            style={{ fontWeight: "bold", color: "#f0dcc7" }}
                          >
                            {item.volumeInfo.title}
                          </Text>
                          <Text style={{ color: "#f0dcc7" }}>
                            {item.volumeInfo.authors?.join(", ") ||
                              "Unknown Author"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={{ paddingBottom: 100 }}
                style={{ maxHeight: 400 }}
                keyboardShouldPersistTaps="handled"
              />
            </View>
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#f0dcc7",
                      fontSize: 18,
                    }}
                  >
                    Book Preview
                  </Text>
                  <Button
                    title="Cancel"
                    onPress={() => setSelectedBook(null)}
                    color="#666"
                  />
                </View>
                {(() => {
                  let coverUrl =
                    selectedBook.volumeInfo.imageLinks?.thumbnail ||
                    selectedBook.volumeInfo.imageLinks?.smallThumbnail ||
                    selectedBook.volumeInfo.imageLinks?.small ||
                    selectedBook.volumeInfo.imageLinks?.medium ||
                    selectedBook.volumeInfo.imageLinks?.large ||
                    null;

                  if (coverUrl) {
                    coverUrl = coverUrl.startsWith("http://")
                      ? coverUrl.replace("http://", "https://")
                      : coverUrl;
                  }

                  const finalCoverUrl =
                    coverUrl ||
                    "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";

                  return (
                    <Image
                      key={finalCoverUrl}
                      source={{ uri: finalCoverUrl }}
                      style={{
                        width: 65,
                        height: 90,
                        marginBottom: 10,
                        resizeMode: "contain",
                      }}
                      onError={(error) => {
                        console.error(
                          `Failed to load cover for "${selectedBook.volumeInfo.title}":`,
                          error
                        );
                      }}
                    />
                  );
                })()}
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
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    marginTop: 10,
                  }}
                >
                  <View style={{ flex: 1, marginRight: 5 }}>
                    <Button
                      title={addingBook ? "Adding..." : "Add Book"}
                      onPress={handleAddBook}
                      color="#bf471b"
                      disabled={addingBook}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <Button
                      title="Cancel"
                      onPress={() => {
                        setSelectedBook(null);
                        clearSearchState();
                      }}
                      color="#666"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          )}

          <Modal visible={Boolean(scannerVisible)} animationType="slide">
            <View style={{ flex: 1, position: "relative" }}>
              <BarcodeScanner
                onISBNScanned={handleISBNScanned}
                onClose={() => setScannerVisible(false)}
              />
            </View>
          </Modal>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

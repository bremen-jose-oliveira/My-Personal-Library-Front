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
} from "react-native";

const processGoogleBooksImageUrl = (
  url: string | null | undefined
): string | null => {
  if (!url || typeof url !== "string") return null;

  let processedUrl = url.trim();

  // Convert http to https
  if (processedUrl.startsWith("http://")) {
    processedUrl = processedUrl.replace("http://", "https://");
  }

  // Remove problematic parameters that can break image loading
  processedUrl = processedUrl.replace(/[?&]edge=curl/g, "");
  processedUrl = processedUrl.replace(/edge=curl&/g, "");
  processedUrl = processedUrl.replace(/[?&]edge=curl$/, "");

  // Try to improve image quality by adjusting zoom parameter if present
  // But don't add it if it's not there (some URLs work better without it)
  if (processedUrl.includes("zoom=")) {
    processedUrl = processedUrl.replace(/zoom=\d+/, "zoom=1");
  }

  // Ensure URL is valid and complete
  try {
    const urlObj = new URL(processedUrl);
    // Ensure it's a valid image URL
    if (!urlObj.hostname || !urlObj.pathname) {
      return null;
    }
    return processedUrl;
  } catch (e) {
    return null;
  }
};

const getBestCoverUrl = (imageLinks: any): string | null => {
  if (!imageLinks) return null;

  // Try in order of quality: medium, large, small, thumbnail, smallThumbnail
  // Google Books API sometimes has different field names or structures
  const possibleUrls = [
    imageLinks.medium,
    imageLinks.large,
    imageLinks.small,
    imageLinks.thumbnail,
    imageLinks.smallThumbnail,
    // Sometimes the API returns nested structures
    imageLinks?.medium?.replace("&zoom=1", "&zoom=5") || imageLinks.medium,
  ].filter(Boolean); // Remove null/undefined values

  return possibleUrls[0] || null;
};

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

    const rawCoverUrl = getBestCoverUrl(selectedBook.volumeInfo.imageLinks);
    let coverUrl = processGoogleBooksImageUrl(rawCoverUrl);

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
      router.push("/(tabs)/Library");

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
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <TextInput
          placeholder="Search for a book..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
          style={{
            borderColor: "#e9ecef",
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: 14,
            marginBottom: 16,
            fontSize: 15,
            borderRadius: 12,
            color: "#333",
            borderWidth: 2,
          }}
        />
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <TouchableOpacity
              onPress={() => {
                setStartIndex(0);
                fetchBooks(searchQuery, true);
              }}
              style={{
                backgroundColor: "#667eea",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 12,
                shadowColor: "#667eea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
                Search
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Render "Open Barcode Scanner" only if not on iOS Web */}
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <View
            style={{ flex: 1, marginRight: searchResults.length > 0 ? 5 : 0 }}
          >
            <TouchableOpacity
              onPress={() => {
                clearSearchState(); // Clear previous results when opening scanner
                setScannerVisible(true);
              }}
              style={{
                backgroundColor: "#764ba2",
                alignItems: "center",
                borderRadius: 12,
                paddingVertical: 12,
                shadowColor: "#764ba2",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
                Open Scanner
              </Text>
            </TouchableOpacity>
          </View>
          {searchResults.length > 0 && (
            <View style={{ flex: 1, marginLeft: 5 }}>
              <TouchableOpacity
                onPress={clearSearchState}
                style={{
                  backgroundColor: "#666",
                  alignItems: "center",
                  borderRadius: 12,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
                  Clear Results
                </Text>
              </TouchableOpacity>
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
                style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}
              >
                Found {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </Text>
              <TouchableOpacity
                onPress={clearSearchState}
                style={{
                  backgroundColor: "#666",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }}>
                  Clear
                </Text>
              </TouchableOpacity>
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
                  // Try to get cover URL with multiple fallback strategies
                  let processedCoverUrl: string | null = null;

                  if (item.volumeInfo.imageLinks) {
                    // Strategy 1: Get best URL from imageLinks
                    const rawCoverUrl = getBestCoverUrl(
                      item.volumeInfo.imageLinks
                    );
                    processedCoverUrl = processGoogleBooksImageUrl(rawCoverUrl);

                    // Strategy 2: If first attempt failed, try all imageLinks properties
                    if (!processedCoverUrl) {
                      const imageLinks = item.volumeInfo.imageLinks;
                      const urlsToTry = [
                        imageLinks.medium,
                        imageLinks.large,
                        imageLinks.small,
                        imageLinks.thumbnail,
                        imageLinks.smallThumbnail,
                      ].filter(Boolean);

                      for (const url of urlsToTry) {
                        const processed = processGoogleBooksImageUrl(url);
                        if (processed) {
                          processedCoverUrl = processed;
                          break;
                        }
                      }
                    }
                  }

                  const finalCoverUrl =
                    processedCoverUrl ||
                    "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";

                  // Create a unique key that includes the URL to force re-render if URL changes
                  const imageKey = `${item.id}-${
                    processedCoverUrl || "fallback"
                  }`;

                  return (
                    <TouchableOpacity onPress={() => handleBookSelect(item)}>
                      <View
                        style={{
                          flexDirection: "row",
                          padding: 12,
                          alignItems: "center",
                          marginBottom: 8,
                          backgroundColor: "rgba(255,255,255,0.95)",
                          borderRadius: 12,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 6,
                          elevation: 3,
                        }}
                      >
                        <Image
                          key={imageKey}
                          source={{ uri: finalCoverUrl }}
                          style={{
                            width: 50,
                            height: 75,
                            marginRight: 12,
                            resizeMode: "contain",
                            backgroundColor: "#f8f9fa",
                            borderRadius: 6,
                          }}
                          onError={() => {
                            // Image failed to load, fallback will be used
                          }}
                          onLoad={() => {
                            // Image loaded successfully
                          }}
                        />
                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={{ fontWeight: "600", color: "#333", fontSize: 15 }}
                          >
                            {item.volumeInfo.title}
                          </Text>
                          <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
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
                backgroundColor: "rgba(255,255,255,0.95)",
                padding: 16,
                borderRadius: 12,
                maxHeight: 400,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "700",
                      color: "#333",
                      fontSize: 18,
                    }}
                  >
                    Book Preview
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedBook(null)}
                    style={{
                      backgroundColor: "#666",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
                {(() => {
                  // Try to get cover URL with multiple fallback strategies
                  let processedCoverUrl: string | null = null;

                  if (selectedBook.volumeInfo.imageLinks) {
                    // Strategy 1: Get best URL from imageLinks
                    const rawCoverUrl = getBestCoverUrl(
                      selectedBook.volumeInfo.imageLinks
                    );
                    processedCoverUrl = processGoogleBooksImageUrl(rawCoverUrl);

                    // Strategy 2: If first attempt failed, try all imageLinks properties
                    if (!processedCoverUrl) {
                      const imageLinks = selectedBook.volumeInfo.imageLinks;
                      const urlsToTry = [
                        imageLinks.medium,
                        imageLinks.large,
                        imageLinks.small,
                        imageLinks.thumbnail,
                        imageLinks.smallThumbnail,
                      ].filter(Boolean);

                      for (const url of urlsToTry) {
                        const processed = processGoogleBooksImageUrl(url);
                        if (processed) {
                          processedCoverUrl = processed;
                          break;
                        }
                      }
                    }
                  }

                  const finalCoverUrl =
                    processedCoverUrl ||
                    "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";

                  const imageKey = `preview-${selectedBook.id}-${
                    processedCoverUrl || "fallback"
                  }`;

                  return (
                    <Image
                      key={imageKey}
                      source={{ uri: finalCoverUrl }}
                      style={{
                        width: 65,
                        height: 90,
                        marginBottom: 12,
                        resizeMode: "contain",
                        borderRadius: 6,
                      }}
                      onError={() => {
                        // Image failed to load, fallback will be used
                      }}
                      onLoad={() => {
                        // Image loaded successfully
                      }}
                    />
                  );
                })()}
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                    fontSize: 15,
                  }}
                >
                  Title: {selectedBook.volumeInfo.title || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                  }}
                >
                  Author:{" "}
                  {selectedBook.volumeInfo.authors?.join(", ") ||
                    "Unknown Author"}
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                    fontSize: 15,
                  }}
                >
                  Publisher: {selectedBook.volumeInfo.publisher || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                    fontSize: 15,
                  }}
                >
                  Published Date: {selectedBook.volumeInfo.publishedDate || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                    fontSize: 15,
                  }}
                >
                  Categories: {selectedBook.volumeInfo.categories || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                    fontSize: 15,
                  }}
                >
                  Description: {selectedBook.volumeInfo.description || ""}
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 8,
                    fontSize: 15,
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
                    marginTop: 12,
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={handleAddBook}
                      disabled={addingBook}
                      style={{
                        backgroundColor: addingBook ? "#999" : "#667eea",
                        alignItems: "center",
                        borderRadius: 12,
                        paddingVertical: 12,
                        shadowColor: "#667eea",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
                        {addingBook ? "Adding..." : "Add Book"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedBook(null);
                        clearSearchState();
                      }}
                      style={{
                        backgroundColor: "#666",
                        alignItems: "center",
                        borderRadius: 12,
                        paddingVertical: 12,
                      }}
                    >
                      <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
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
  );
}

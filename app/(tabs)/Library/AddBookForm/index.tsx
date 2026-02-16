import BarcodeScanner from "@/components/BarcodeScanner";
import Book from "@/Interfaces/book";
import { useBookContext } from "@/utils/Context/BookContext";
import { fetchCoverImage } from "@/utils/fetchBookData";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  ActivityIndicator,
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
    <View style={styles.container}>
      <View style={styles.inner}>
        <TextInput
          placeholder="Search for a book..."
          placeholderTextColor={Colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setStartIndex(0);
              fetchBooks(searchQuery, true);
            }}
          >
            <Text style={styles.primaryButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Render "Open Barcode Scanner" only if not on iOS Web */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { flex: 1, marginRight: searchResults.length > 0 ? 5 : 0 },
            ]}
            onPress={() => {
              clearSearchState(); // Clear previous results when opening scanner
              setScannerVisible(true);
            }}
          >
            <Text style={styles.primaryButtonText}>Open Scanner</Text>
          </TouchableOpacity>
          {searchResults.length > 0 && (
            <TouchableOpacity
              style={[styles.secondaryButton, { flex: 1, marginLeft: 5 }]}
              onPress={clearSearchState}
            >
              <Text style={styles.secondaryButtonText}>Clear Results</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchResults.length > 0 && (
          <View>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                Found {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </Text>
              <TouchableOpacity onPress={clearSearchState}>
                <Text style={styles.clearText}>Clear</Text>
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
                    <View style={styles.resultCard}>
                      <Image
                        key={imageKey}
                        source={{ uri: finalCoverUrl }}
                        style={styles.resultImage}
                        onError={() => {
                          // Image failed to load, fallback will be used
                        }}
                        onLoad={() => {
                          // Image loaded successfully
                        }}
                      />
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultTitle}>
                          {item.volumeInfo.title}
                        </Text>
                        <Text style={styles.resultAuthor}>
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
          <ScrollView style={styles.previewCard}>
            <View style={{ alignItems: "center" }}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Book Preview</Text>
                <TouchableOpacity onPress={() => setSelectedBook(null)}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
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
                    style={styles.previewImage}
                    onError={() => {
                      // Image failed to load, fallback will be used
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                    }}
                  />
                );
              })()}
              <Text style={styles.previewLabel}>
                Title: {selectedBook.volumeInfo.title || ""}
              </Text>
              <Text style={styles.previewLabel}>
                Author:{" "}
                {selectedBook.volumeInfo.authors?.join(", ") ||
                  "Unknown Author"}
              </Text>
              <Text style={styles.previewLabel}>
                Publisher: {selectedBook.volumeInfo.publisher || ""}
              </Text>
              <Text style={styles.previewLabel}>
                Published Date: {selectedBook.volumeInfo.publishedDate || ""}
              </Text>
              <Text style={styles.previewLabel}>
                Categories: {selectedBook.volumeInfo.categories || ""}
              </Text>
              <Text style={styles.previewLabel}>
                Description: {selectedBook.volumeInfo.description || ""}
              </Text>
              <Text style={styles.previewLabel}>
                isbn:{" "}
                {selectedBook.volumeInfo.industryIdentifiers?.[0]
                  ?.identifier || "N/A"}
              </Text>
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, marginRight: 5 }]}
                  onPress={handleAddBook}
                  disabled={addingBook}
                >
                  {addingBook ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Add Book</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1, marginLeft: 5 }]}
                  onPress={() => {
                    setSelectedBook(null);
                    clearSearchState();
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
    borderRadius: 12,
    color: Colors.text,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultsCount: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  clearText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  resultCard: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  resultImage: {
    width: 50,
    height: 75,
    marginRight: 10,
    resizeMode: "contain",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 4,
  },
  resultInfo: {
    flex: 1,
    padding: 12,
  },
  resultTitle: {
    fontWeight: "bold",
    color: Colors.text,
  },
  resultAuthor: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  previewCard: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    maxHeight: 400,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
  },
  previewTitle: {
    fontWeight: "bold",
    color: Colors.text,
    fontSize: 18,
  },
  previewImage: {
    width: 65,
    height: 90,
    marginBottom: 10,
    resizeMode: "contain",
  },
  previewLabel: {
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 5,
  },
  previewActions: {
    flexDirection: "row",
    width: "100%",
    marginTop: 10,
  },
});

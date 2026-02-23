import BarcodeScanner from "@/components/BarcodeScanner";
import Book from "@/Interfaces/book";
import { useBookContext } from "@/utils/Context/BookContext";
import { fetchCoverImage } from "@/utils/fetchBookData";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

/** Open Library Covers API - no quota, direct image URL by ISBN */
const getOpenLibraryCoverUrl = (isbn: string): string => {
  const clean = (isbn || "").replace(/\D/g, "").trim();
  if (!clean) return "";
  return `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg`;
};

const getIsbnFromVolume = (volumeInfo: any): string | null => {
  const ids = volumeInfo?.industryIdentifiers;
  if (!Array.isArray(ids)) return null;
  const row = ids.find((x: any) => x?.type === "ISBN_13" || x?.type === "ISBN_10");
  return row?.identifier ?? null;
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
  const { t } = useTranslation();
  const { addBook } = useBookContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedBookCoverUrl, setSelectedBookCoverUrl] = useState<string | null>(null);
  const [resolvedListCovers, setResolvedListCovers] = useState<Record<string, string>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addingBook, setAddingBook] = useState(false);

  const fetchBooks = async (query: string, reset: boolean = false) => {
    if (loading) return;
    setLoading(true);

    const q = typeof query === "string" ? query : "";
    const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      q
    )}&maxResults=40&startIndex=${reset ? 0 : startIndex}`;

    let response: Response;
    try {
      response = await fetch(googleBooksApiUrl);
    } catch (networkError) {
      console.error("Error fetching books:", networkError);
      setLoading(false);
      try {
        Alert.alert(t("common.error"), t("books.failedToFetchBooks"));
      } catch (_) {
        Alert.alert("Error", "Failed to fetch book data. Please try again.");
      }
      return;
    }

    if (response.status === 429) {
      setSearchResults([]);
      setStartIndex(0);
      setLoading(false);
      try {
        Alert.alert(t("common.error"), t("books.quotaExceeded"));
      } catch (_) {
        Alert.alert("Error", "Google Books daily limit reached. Please try again tomorrow.");
      }
      return;
    }

    let data: { items?: any[] };
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (_) {
      data = {};
    }

    const hasIsbn = (item: any) => {
      const ids = item?.volumeInfo?.industryIdentifiers;
      if (!Array.isArray(ids)) return false;
      return ids.some(
        (x: any) => x?.type === "ISBN_10" || x?.type === "ISBN_13"
      );
    };
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const newResults = rawItems.filter(hasIsbn);
    setSearchResults((prevResults) => {
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
    setLoading(false);
  };

  const clearSearchState = () => {
    setSearchResults([]);
    setSelectedBook(null);
    setSelectedBookCoverUrl(null);
    setResolvedListCovers({});
    setSearchQuery("");
    setStartIndex(0);
  };

  const handleISBNScanned = (isbn: string) => {
    setScannerVisible(false);
    clearSearchState();
    const isbnQuery = `isbn:${isbn}`;
    fetchBooks(isbnQuery, true);
  };

  const fetchVolumeDetails = async (volumeId: string): Promise<any> => {
    const url = `https://www.googleapis.com/books/v1/volumes/${volumeId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  };

  const handleBookSelect = async (bookData: any) => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedBookCoverUrl(null);
    setSelectedBook(bookData);
    const volumeId = bookData.id;
    if (volumeId) {
      setLoadingDetails(true);
      try {
        const fullVolume = await fetchVolumeDetails(volumeId);
        if (fullVolume?.volumeInfo) {
          setSelectedBook(fullVolume);
        }
      } catch (e) {
        console.warn("Could not fetch full volume details, using list item:", e);
      }
      setLoadingDetails(false);
    }
  };

  // Resolve cover for selected book the same way handleAddBook does, so preview matches saved cover
  useEffect(() => {
    if (!selectedBook) {
      setSelectedBookCoverUrl(null);
      return;
    }
    let cancelled = false;
    const resolve = async () => {
      const rawCoverUrl = getBestCoverUrl(selectedBook.volumeInfo?.imageLinks);
      let url = processGoogleBooksImageUrl(rawCoverUrl);
      if (!url) {
        const title = selectedBook.volumeInfo?.title;
        const author =
          selectedBook.volumeInfo?.authors?.join(", ") || "Unknown Author";
        url = await fetchCoverImage(title, author);
      }
      if (!cancelled && (url == null || url.trim() === "")) {
        url = "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";
      }
      if (!cancelled && url) setSelectedBookCoverUrl(url);
    };
    resolve();
    return () => {
      cancelled = true;
    };
  }, [selectedBook]);

  // Same cover logic as Book Preview: for list items without Google imageLinks, call fetchCoverImage.
  // No limit for now; if 429 quota appears again, add a cap (e.g. first 15–20 items).
  useEffect(() => {
    if (!searchResults.length) return;
    let cancelled = false;
    const toFetch = searchResults.filter((item: any) => {
        const id = item.id;
        if (!id || resolvedListCovers[id]) return false;
        const raw = getBestCoverUrl(item.volumeInfo?.imageLinks);
        const url = processGoogleBooksImageUrl(raw);
        return !url;
      });
    toFetch.forEach((item: any) => {
      const id = item.id;
      if (!id) return;
      (async () => {
        const title = item.volumeInfo?.title;
        const author =
          item.volumeInfo?.authors?.join(", ") || "Unknown Author";
        const url = await fetchCoverImage(title, author);
        if (!cancelled && url) {
          setResolvedListCovers((prev) => ({ ...prev, [id]: url }));
        }
      })();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when searchResults change; resolvedListCovers is read to skip already-fetched
  }, [searchResults]);

  const handleAddBook = async () => {
    if (!selectedBook || addingBook) return; // Prevent double submission

    setAddingBook(true);

    const vi = selectedBook.volumeInfo || {};
    const rawCoverUrl = getBestCoverUrl(vi.imageLinks);
    let coverUrl = processGoogleBooksImageUrl(rawCoverUrl);

    if (!coverUrl) {
      const title = vi.title;
      const author = vi.authors?.join(", ") || "Unknown Author";
      coverUrl = await fetchCoverImage(title, author);
    }

    if (!coverUrl || coverUrl.trim() === "") {
      coverUrl = "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";
    }

    const yearStr = vi.publishedDate ? String(vi.publishedDate).substring(0, 4) : "";
    const yearNum = yearStr ? parseInt(yearStr, 10) : 0;
    const bookData: Omit<Book, "id"> = {
      title: vi.title || "Unknown",
      author: (vi.authors && vi.authors.length) ? vi.authors.join(", ") : "Unknown Author",
      year: Number.isNaN(yearNum) ? 0 : yearNum,
      publisher: vi.publisher || "",
      cover: coverUrl,
      description: vi.description || null,
      isbn:
        vi.industryIdentifiers?.[0]?.identifier || "N/A",
    };

    try {
      await addBook(bookData);
      setSelectedBook(null);
      router.push("/Library/DisplayBooks");

      if (Platform.OS === "web") {
        window.confirm(t("common.success") + " " + t("books.bookAddedSuccess"));
      } else {
        Alert.alert(t("common.success"), t("books.bookAddedSuccess"));
      }
    } catch (error: any) {
      console.error("Error adding book:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("books.failedToAddBook")
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
            placeholder={t("books.searchPlaceholder")}
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
                title={t("common.search")}
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
                title={t("books.openScanner")}
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
                  title={t("books.clearResults")}
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
                  {t("books.foundResults", { count: searchResults.length })}
                </Text>
                <Button color="#666" title={t("common.clear")} onPress={clearSearchState} />
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
                  // Same order as Book Preview: 1) resolved (fetchCoverImage), 2) Google imageLinks, 3) Open Library, 4) placeholder
                  const cached = item.id ? resolvedListCovers[item.id] : null;
                  let processedCoverUrl: string | null = null;
                  if (!cached && item.volumeInfo?.imageLinks) {
                    const rawCoverUrl = getBestCoverUrl(
                      item.volumeInfo.imageLinks
                    );
                    processedCoverUrl = processGoogleBooksImageUrl(rawCoverUrl);
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
                  const isbn = getIsbnFromVolume(item.volumeInfo);
                  const openLibraryUrl = isbn ? getOpenLibraryCoverUrl(isbn) : "";
                  const placeholder = "https://cdn-icons-png.flaticon.com/512/7340/7340665.png";
                  const finalCoverUrl =
                    cached ||
                    processedCoverUrl ||
                    (openLibraryUrl || placeholder);

                  const imageKey = `${item.id}-${finalCoverUrl.slice(-20)}`;

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
                          key={imageKey}
                          source={{ uri: finalCoverUrl }}
                          style={{
                            width: 50,
                            height: 75,
                            marginRight: 10,
                            resizeMode: "contain",
                            backgroundColor: "rgba(255,255,255,0.1)",
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
                              t("common.unknownAuthor")}
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
                    {t("books.bookPreview")}
                    {loadingDetails ? ` (${t("books.loadingDetails")})` : ""}
                  </Text>
                  <Button
                    title={t("common.cancel")}
                    onPress={() => {
                      setSelectedBook(null);
                      setLoadingDetails(false);
                    }}
                    color="#666"
                  />
                </View>
                <Image
                  source={{
                    uri:
                      selectedBookCoverUrl ||
                      "https://cdn-icons-png.flaticon.com/512/7340/7340665.png",
                  }}
                  style={{
                    width: 65,
                    height: 90,
                    marginBottom: 10,
                    resizeMode: "contain",
                  }}
                />
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  {t("books.title")}: {selectedBook.volumeInfo?.title || "—"}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  {t("books.author")}:{" "}
                  {selectedBook.volumeInfo?.authors?.length
                    ? selectedBook.volumeInfo.authors.join(", ")
                    : "—"}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  {t("books.publisher")}: {selectedBook.volumeInfo?.publisher || "—"}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  {t("books.publishedDate")}: {selectedBook.volumeInfo?.publishedDate || "—"}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  {t("books.categories")}:{" "}
                  {Array.isArray(selectedBook.volumeInfo?.categories)
                    ? selectedBook.volumeInfo.categories.join(", ")
                    : selectedBook.volumeInfo?.categories || "—"}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  {t("books.description")}: {selectedBook.volumeInfo?.description || "—"}
                </Text>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#f0dcc7",
                    marginBottom: 5,
                  }}
                >
                  {t("books.isbn")}:{" "}
                  {selectedBook.volumeInfo?.industryIdentifiers?.[0]?.identifier ||
                    "N/A"}
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
                      title={addingBook ? t("books.adding") : t("books.addBook")}
                      onPress={handleAddBook}
                      color="#bf471b"
                      disabled={addingBook}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <Button
title={t("common.cancel")}
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

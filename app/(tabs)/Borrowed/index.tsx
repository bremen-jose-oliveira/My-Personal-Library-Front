import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ImageBackground,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { ExchangeStatus } from "@/Interfaces/exchange";

const statusLabels: Record<ExchangeStatus, string> = {
  [ExchangeStatus.REQUESTED]: "Pending",
  [ExchangeStatus.ACCEPTED]: "Active",
  [ExchangeStatus.REJECTED]: "Rejected",
  [ExchangeStatus.RETURNED]: "Returned",
};

export default function BorrowedScreen() {
  const { borrowedBooks, loading, refreshBorrowed, updateExchangeStatus } =
    useExchangeContext();
  const [localLoading, setLocalLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("BorrowedScreen: Component mounted, loading data...");
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;
    let loadFinished = false;

    const loadData = async () => {
      try {
        if (isMounted) {
          setLocalLoading(true);
          setError(null);
        }
        console.log("BorrowedScreen: Calling refreshBorrowed...");
        await refreshBorrowed();
        loadFinished = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          console.log("BorrowedScreen: Data loaded successfully");
          setLocalLoading(false);
        }
      } catch (err: any) {
        loadFinished = true;
        if (timeoutId) clearTimeout(timeoutId);
        console.error("BorrowedScreen: Error loading borrowed books:", err);
        if (isMounted) {
          const message =
            typeof err?.message === "string"
              ? err.message
              : "Failed to load borrowed books";
          setError(message);
          setLocalLoading(false);
        }
      }
    };

    // Timeout only if load never completes; clear it when load finishes
    timeoutId = setTimeout(() => {
      if (loadFinished) return;
      console.warn("BorrowedScreen: Loading timeout reached");
      if (isMounted) {
        setLocalLoading(false);
        setError(
          "Loading took too long. Please check your connection and try again."
        );
      }
    }, 8000);

    loadData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const handleReturnBook = async (exchangeId: number) => {
    setProcessing(exchangeId);
    try {
      await updateExchangeStatus(exchangeId, ExchangeStatus.RETURNED);
      Alert.alert("Success", "Book marked as returned!");
      await refreshBorrowed();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to return book");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: ExchangeStatus) => {
    switch (status) {
      case ExchangeStatus.REQUESTED:
        return "#f59e0b"; // Orange
      case ExchangeStatus.ACCEPTED:
        return "#22c55e"; // Green
      case ExchangeStatus.REJECTED:
        return "#ef4444"; // Red
      case ExchangeStatus.RETURNED:
        return "#6b7280"; // Gray
      default:
        return "#6b7280";
    }
  };

  // Always show something, even if loading takes too long
  const isLoading =
    (loading || localLoading) && borrowedBooks.length === 0 && !error;

  if (__DEV__) {
    console.log(
      "BorrowedScreen: Rendering - loading:",
      loading,
      "localLoading:",
      localLoading,
      "borrowedBooks.length:",
      borrowedBooks.length,
      "error:",
      error,
      "isLoading:",
      isLoading
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={styles.gradientOverlay}
      >
        <Text style={styles.header}>Borrowed Books</Text>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                setError(null);
                setLocalLoading(true);
                try {
                  await refreshBorrowed();
                } catch (err: any) {
                  setError(err.message || "Failed to load borrowed books");
                } finally {
                  setLocalLoading(false);
                }
              }}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#bf471b" />
            <Text style={styles.loadingText}>Loading borrowed books...</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContentContainer}
            data={borrowedBooks}
            keyExtractor={(item, index) =>
              item?.id != null ? String(item.id) : `borrowed-${index}`
            }
            refreshControl={
              <RefreshControl
                refreshing={loading || localLoading}
                onRefresh={async () => {
                  setLocalLoading(true);
                  await refreshBorrowed();
                  setLocalLoading(false);
                }}
                tintColor="#bf471b"
              />
            }
            renderItem={({ item }) => {
              const isProcessing = processing === item.id;

              // Handle status - might come as string or enum from API
              const rawStatus = item.status;
              const itemStatus =
                typeof rawStatus === "string"
                  ? ExchangeStatus[rawStatus as keyof typeof ExchangeStatus] ?? rawStatus
                  : rawStatus;
              const statusLabel =
                typeof itemStatus === "string"
                  ? statusLabels[itemStatus as ExchangeStatus] || itemStatus
                  : itemStatus != null
                    ? statusLabels[itemStatus]
                    : "Unknown";

              const canReturn =
                itemStatus === ExchangeStatus.ACCEPTED && !isProcessing;

              // Get book data from the correct nested structure (API may vary)
              const book = item.book || (item as any).Book;
              const bookDetails = book?.bookDetails || book;
              const bookTitle =
                typeof bookDetails?.title === "string"
                  ? bookDetails.title
                  : "Unknown book";
              const bookAuthor =
                typeof bookDetails?.author === "string"
                  ? bookDetails.author
                  : "Unknown";
              const bookCover =
                typeof bookDetails?.cover === "string" ? bookDetails.cover : undefined;
              const ownerUsername =
                typeof book?.owner?.username === "string"
                  ? book.owner.username
                  : "Unknown";

              const formatDate = (value: unknown): string => {
                if (value == null) return "";
                try {
                  const d = new Date(value as string | number);
                  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
                } catch {
                  return "";
                }
              };

              return (
                <View style={styles.exchangeCard}>
                  {bookCover ? (
                    <Image
                      source={{ uri: bookCover }}
                      style={styles.bookCover}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={styles.cardContent}>
                    <Text style={styles.bookTitle}>{bookTitle}</Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Author:</Text> {bookAuthor}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>From:</Text> {ownerUsername}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Status:</Text>{" "}
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: getStatusColor(
                              itemStatus as ExchangeStatus
                            ),
                          },
                        ]}
                      >
                        {statusLabel}
                      </Text>
                    </Text>
                    {formatDate(item.exchangeDate) ? (
                      <Text style={styles.detailText}>
                        <Text style={styles.label}>Borrowed on:</Text>{" "}
                        {formatDate(item.exchangeDate)}
                      </Text>
                    ) : null}
                    {formatDate(item.createdAt) ? (
                      <Text style={styles.detailText}>
                        <Text style={styles.label}>Requested on:</Text>{" "}
                        {formatDate(item.createdAt)}
                      </Text>
                    ) : null}
                    {canReturn && (
                      <TouchableOpacity
                        style={styles.returnButton}
                        onPress={() => handleReturnBook(item.id)}
                        disabled={isProcessing}
                      >
                        <Text style={styles.buttonText}>
                          {isProcessing ? "Processing..." : "Mark as Returned"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              !loading && !localLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No borrowed books yet.</Text>
                </View>
              ) : null
            }
          />
        )}
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    paddingTop: 60,
    zIndex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f0dcc7",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exchangeCard: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#bf471b",
    flexDirection: "row",
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f0dcc7",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#f0dcc7",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
  },
  statusText: {
    fontWeight: "600",
  },
  returnButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
  },
  emptyText: {
    color: "#f0dcc7",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    zIndex: 100,
    elevation: 100,
  },
  loadingText: {
    color: "#f0dcc7",
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#bf471b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

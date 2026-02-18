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

    const loadData = async () => {
      try {
        if (isMounted) {
          setLocalLoading(true);
          setError(null);
        }
        console.log("BorrowedScreen: Calling refreshBorrowed...");
        await refreshBorrowed();
        if (isMounted) {
          console.log("BorrowedScreen: Data loaded successfully");
          console.log("BorrowedScreen: borrowedBooks count:", borrowedBooks.length);
          if (borrowedBooks.length > 0) {
            console.log("BorrowedScreen: First item structure:", JSON.stringify(borrowedBooks[0], null, 2));
          }
          setLocalLoading(false);
        }
      } catch (err: any) {
        console.error("BorrowedScreen: Error loading borrowed books:", err);
        if (isMounted) {
          setError(err.message || "Failed to load borrowed books");
          setLocalLoading(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      console.warn("BorrowedScreen: Loading timeout reached");
      if (isMounted) {
        setLocalLoading(false);
        setError(
          "Loading took too long. Please check your connection and try again."
        );
      }
    }, 8000); // 8 second timeout

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
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Borrowed Books</Text>
        </View>
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
            keyExtractor={(item) => item.id.toString()}
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
              // Debug logging to see actual data structure
              console.log("BorrowedScreen renderItem:", {
                id: item.id,
                status: item.status,
                hasBook: !!item.book,
                bookKeys: item.book ? Object.keys(item.book) : [],
                bookTitle: item.book?.title,
                bookAuthor: item.book?.author,
                rawItem: JSON.stringify(item)
              });

              const isProcessing = processing === item.id;
              const canReturn =
                item.status === ExchangeStatus.ACCEPTED && !isProcessing;

              return (
                <View style={styles.exchangeCard}>
                  {item.book?.cover && (
                    <Image
                      source={{ uri: item.book.cover }}
                      style={styles.bookCover}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.cardContent}>
                    <Text style={styles.bookTitle}>
                      {item.book?.title ?? "Unknown book"}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Author:</Text>{" "}
                      {item.book?.author ?? "Unknown"}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>From:</Text>{" "}
                      {item.book?.ownerUsername ??
                        (typeof item.book?.owner === "string"
                          ? item.book?.owner
                          : (item.book?.owner as any)?.username ?? "Unknown")}
                    </Text>
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Status:</Text>{" "}
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(item.status) },
                        ]}
                      >
                        {statusLabels[item.status]}
                      </Text>
                    </Text>
                    {item.exchangeDate && (
                      <Text style={styles.detailText}>
                        <Text style={styles.label}>Borrowed on:</Text>{" "}
                        {new Date(item.exchangeDate).toLocaleDateString()}
                      </Text>
                    )}
                    {item.createdAt && (
                      <Text style={styles.detailText}>
                        <Text style={styles.label}>Requested on:</Text>{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    )}
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
    flex: 1,
    paddingTop: 60,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f0dcc7",
    textAlign: "center",
    marginBottom: 20,
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

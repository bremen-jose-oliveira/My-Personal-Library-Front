import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { ExchangeStatus } from "@/Interfaces/exchange";
import { Colors } from "@/constants/Colors";

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
    <View style={styles.container}>
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
          <ActivityIndicator size="large" color={Colors.primary} />
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
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item }) => {
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
                      item.book?.owner ??
                      "Unknown"}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exchangeCard: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    color: Colors.text,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    color: Colors.text,
  },
  statusText: {
    fontWeight: "600",
  },
  returnButton: {
    backgroundColor: Colors.success,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    padding: 20,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    color: Colors.textSecondary,
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
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

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
import { LinearGradient } from "expo-linear-gradient";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { ExchangeStatus } from "@/Interfaces/exchange";

const statusLabels: Record<ExchangeStatus, string> = {
  [ExchangeStatus.REQUESTED]: "Pending",
  [ExchangeStatus.ACCEPTED]: "Active",
  [ExchangeStatus.REJECTED]: "Rejected",
  [ExchangeStatus.RETURNED]: "Returned",
};

export default function LendingScreen() {
  const { lendingBooks, loading, refreshLending, updateExchangeStatus } =
    useExchangeContext();
  const [processing, setProcessing] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      await refreshLending();
      setLocalLoading(false);
    };
    loadData();
  }, [refreshLending]);

  const handleAccept = async (exchangeId: number) => {
    setProcessing(exchangeId);
    try {
      await updateExchangeStatus(exchangeId, ExchangeStatus.ACCEPTED);
      Alert.alert("Success", "Exchange request accepted!");
      await refreshLending();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to accept exchange request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (exchangeId: number) => {
    setProcessing(exchangeId);
    try {
      await updateExchangeStatus(exchangeId, ExchangeStatus.REJECTED);
      Alert.alert("Success", "Exchange request rejected.");
      await refreshLending();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject exchange request");
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkAsReturned = async (exchangeId: number) => {
    setProcessing(exchangeId);
    try {
      await updateExchangeStatus(exchangeId, ExchangeStatus.RETURNED);
      Alert.alert("Success", "Book marked as returned!");
      await refreshLending();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to mark book as returned");
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

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={styles.container}
    >
        <Text style={styles.header}>Lending Books</Text>
        {(loading || localLoading) && lendingBooks.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading lending books...</Text>
          </View>
        ) : (
          <FlatList
          contentContainerStyle={styles.listContentContainer}
          data={lendingBooks}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={loading || localLoading}
              onRefresh={async () => {
                setLocalLoading(true);
                await refreshLending();
                setLocalLoading(false);
              }}
              tintColor="#ffffff"
              colors={["#ffffff"]}
            />
          }
          renderItem={({ item }) => {
            const isProcessing = processing === item.id;
            const canManage = item.status === ExchangeStatus.REQUESTED;
            const canMarkReturned = item.status === ExchangeStatus.ACCEPTED;

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
                    <Text style={styles.label}>To:</Text>{" "}
                    {item.borrower?.username ?? "Unknown"}
                  </Text>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Status:</Text>{" "}
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                      {statusLabels[item.status]}
                    </Text>
                  </Text>
                  {item.exchangeDate && (
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Lent on:</Text>{" "}
                      {new Date(item.exchangeDate).toLocaleDateString()}
                    </Text>
                  )}
                  {item.createdAt && (
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>Requested on:</Text>{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                  {canManage && (
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={() => handleAccept(item.id)}
                        disabled={isProcessing}
                      >
                        <Text style={styles.buttonText}>
                          {isProcessing ? "Processing..." : "Accept"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => handleReject(item.id)}
                        disabled={isProcessing}
                      >
                        <Text style={styles.buttonText}>
                          {isProcessing ? "Processing..." : "Reject"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {canMarkReturned && (
                    <TouchableOpacity
                      style={styles.returnButton}
                      onPress={() => handleMarkAsReturned(item.id)}
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
                <Text style={styles.emptyText}>
                  No books being lent out yet.
                </Text>
              </View>
            ) : null
          }
        />
        )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exchangeCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
    color: "#333",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
  },
  statusText: {
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#22c55e",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  returnButton: {
    backgroundColor: "#3b82f6",
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
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyText: {
    color: "#666",
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
    color: "#ffffff",
    fontSize: 16,
    marginTop: 12,
  },
});


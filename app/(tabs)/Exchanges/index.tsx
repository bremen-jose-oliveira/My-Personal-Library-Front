import React, { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, RefreshControl, ImageBackground, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { ExchangeStatus } from "@/Interfaces/exchange";

const statusLabels: Record<ExchangeStatus, string> = {
  [ExchangeStatus.REQUESTED]: "Requested",
  [ExchangeStatus.ACCEPTED]: "Accepted",
  [ExchangeStatus.REJECTED]: "Rejected",
  [ExchangeStatus.RETURNED]: "Returned",
};

export default function ExchangesScreen() {
  const { exchanges, loading, refreshExchanges, updateExchangeStatus } = useExchangeContext();
  const { currentUser } = useUserContext();
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    refreshExchanges();
  }, []);

  const handleAccept = async (exchangeId: number) => {
    setProcessing(exchangeId);
    try {
      await updateExchangeStatus(exchangeId, ExchangeStatus.ACCEPTED);
      Alert.alert("Success", "Exchange request accepted!");
      await refreshExchanges();
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
      await refreshExchanges();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject exchange request");
    } finally {
      setProcessing(null);
    }
  };

  const isOwner = (exchange: any) => {
    if (!currentUser || !exchange.book) return false;
    return exchange.book.owner === currentUser.email;
  };

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
        <Text style={styles.header}>My Exchanges</Text>
        <FlatList
          contentContainerStyle={styles.listContentContainer}
          data={exchanges}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshExchanges} tintColor="#bf471b" />
          }
          renderItem={({ item }) => {
            const canManage = isOwner(item) && item.status === ExchangeStatus.REQUESTED;
            const isProcessing = processing === item.id;

            return (
              <View style={styles.exchangeCard}>
                <Text style={styles.bookTitle}>
                  {item.book?.title ?? "Unknown book"}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Owner:</Text>{" "}
                  {item.book?.ownerUsername ?? item.book?.owner ?? "Unknown"}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Borrower:</Text>{" "}
                  {item.borrower?.username ?? "You"}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.label}>Status:</Text> {statusLabels[item.status]}
                </Text>
                {item.exchangeDate && (
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>Exchange Date:</Text>{" "}
                    {new Date(item.exchangeDate).toLocaleDateString()}
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
              </View>
            );
          }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No exchanges yet.</Text>
              </View>
            ) : null
          }
        />
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
});





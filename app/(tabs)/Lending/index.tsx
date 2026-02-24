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
import { useTranslation } from "react-i18next";

export default function LendingScreen() {
  const { t } = useTranslation();
  const { lendingBooks, loading, refreshLending, updateExchangeStatus, deleteExchange } =
    useExchangeContext();

  const statusLabels: Record<ExchangeStatus, string> = {
    [ExchangeStatus.REQUESTED]: t("borrowed.pending"),
    [ExchangeStatus.ACCEPTED]: t("borrowed.active"),
    [ExchangeStatus.REJECTED]: t("borrowed.rejected"),
    [ExchangeStatus.RETURNED]: t("borrowed.returned"),
  };
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
      Alert.alert(t("common.success"), t("lending.exchangeAccepted"));
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
      Alert.alert(t("common.success"), t("lending.exchangeRejected"));
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
      Alert.alert(t("common.success"), t("lending.bookReturned"));
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
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={styles.gradientOverlay}
      >
        <Text style={styles.header}>{t("tabs.lendingBooks")}</Text>
        {(loading || localLoading) && lendingBooks.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#bf471b" />
            <Text style={styles.loadingText}>{t("lending.loading")}</Text>
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
              tintColor="#bf471b"
            />
          }
          renderItem={({ item }) => {
            const isProcessing = processing === item.id;
            const rawStatus = item.status;
            const itemStatus = typeof rawStatus === "string"
              ? ExchangeStatus[rawStatus as keyof typeof ExchangeStatus] ?? rawStatus
              : rawStatus;
            const canManage = itemStatus === ExchangeStatus.REQUESTED;
            const canMarkReturned = itemStatus === ExchangeStatus.ACCEPTED;
            const isReturned = itemStatus === ExchangeStatus.RETURNED;

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
                    {item.book?.title ?? t("borrowed.unknownBook")}
                  </Text>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>{t("books.author")}:</Text>{" "}
                    {item.book?.author ?? t("common.unknown")}
                  </Text>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>{t("lending.to")}:</Text>{" "}
                    {item.borrower?.username ?? t("common.unknown")}
                  </Text>
                  <Text style={styles.detailText}>
                    <Text style={styles.label}>{t("borrowed.status")}:</Text>{" "}
                    <Text style={[styles.statusText, { color: getStatusColor(itemStatus as ExchangeStatus) }]}>
                      {statusLabels[itemStatus as ExchangeStatus]}
                    </Text>
                  </Text>
                  {item.exchangeDate && (
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>{t("lending.lentOn")}:</Text>{" "}
                      {new Date(item.exchangeDate).toLocaleDateString()}
                    </Text>
                  )}
                  {item.createdAt && (
                    <Text style={styles.detailText}>
                      <Text style={styles.label}>{t("borrowed.requestedOn")}</Text>{" "}
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
                          {isProcessing ? t("common.processing") : t("lending.accept")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => handleReject(item.id)}
                        disabled={isProcessing}
                      >
                        <Text style={styles.buttonText}>
                          {isProcessing ? t("common.processing") : t("lending.reject")}
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
                        {isProcessing ? t("common.processing") : t("books.markAsReturned")}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {isReturned && (
                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => {
                        Alert.alert(
                          t("borrowed.removeFromList"),
                          t("borrowed.removeFromListConfirm"),
                          [
                            { text: t("common.cancel"), style: "cancel" },
                            {
                              text: t("common.ok"),
                              onPress: async () => {
                                setProcessing(item.id);
                                try {
                                  await deleteExchange(item.id);
                                  await refreshLending();
                                  Alert.alert(t("common.success"), t("borrowed.removedFromList"));
                                } catch (err: any) {
                                  Alert.alert(t("common.error"), err?.message ?? t("common.error"));
                                } finally {
                                  setProcessing(null);
                                }
                              },
                            },
                          ]
                        );
                      }}
                      disabled={isProcessing}
                    >
                      <Text style={styles.buttonText}>
                        {isProcessing ? t("common.processing") : t("borrowed.removeFromList")}
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
                  {t("lending.noLendingYet")}
                </Text>
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
  clearButton: {
    backgroundColor: "#6b7280",
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
});


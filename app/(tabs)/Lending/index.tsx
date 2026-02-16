import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { ExchangeStatus } from "@/Interfaces/exchange";
import { ExchangeCard } from "@/components/ExchangeCard";
import { useRouter } from "expo-router";

export default function LendingScreen() {
  const { lendingBooks, loading, refreshLending, updateExchangeStatus } =
    useExchangeContext();
  const [processing, setProcessing] = useState<number | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const loadData = async () => {
      try {
        if (isMounted) {
          setLocalLoading(true);
          setError(null);
        }
        await refreshLending();
        if (isMounted) {
          setLocalLoading(false);
        }
      } catch (err: any) {
        console.error("LendingScreen: Error loading lending books:", err);
        if (isMounted) {
          setError(err.message || "Failed to load lending books");
          setLocalLoading(false);
        }
      }
    };

    timeoutId = setTimeout(() => {
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
  }, []);

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
      Alert.alert("Rejected", "Exchange request has been rejected.");
      await refreshLending();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to reject exchange request");
    } finally {
      setProcessing(null);
    }
  };

  const isLoading =
    (loading || localLoading) && lendingBooks.length === 0 && !error;

  return (
    <LinearGradient colors={["#f5f5f5", "#ffffff"]} className="flex-1">
      {error ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={async () => {
              setError(null);
              setLocalLoading(true);
              try {
                await refreshLending();
              } catch (err: any) {
                setError(err.message || "Failed to load lending books");
              } finally {
                setLocalLoading(false);
              }
            }}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#bf471b" />
          <Text className="text-gray-600 mt-3">Loading lending books...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
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
              colors={["#bf471b"]}
            />
          }
          renderItem={({ item }) => (
            <View>
              <ExchangeCard
                exchange={item}
                type="lending"
                processing={processing === item.id}
                onViewPress={() => {
                  if (item.book?.id) {
                    router.push(`/BookDetails/${item.book.id}`);
                  }
                }}
              />
              {/* Action Buttons for Pending Requests */}
              {item.status === ExchangeStatus.REQUESTED && (
                <View className="flex-row px-4 mb-4 -mt-2">
                  <TouchableOpacity
                    onPress={() => handleAccept(item.id)}
                    disabled={processing === item.id}
                    className="flex-1 bg-green-500 py-3 rounded-xl mr-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-center font-semibold">
                      {processing === item.id ? "Processing..." : "Accept"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReject(item.id)}
                    disabled={processing === item.id}
                    className="flex-1 bg-red-500 py-3 rounded-xl ml-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-center font-semibold">
                      {processing === item.id ? "Processing..." : "Reject"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            !loading && !localLoading ? (
              <View className="flex-1 justify-center items-center px-5 pt-20">
                <Text className="text-gray-500 text-center text-lg mb-2">
                  No books being lent
                </Text>
                <Text className="text-gray-400 text-center">
                  Books you lend to friends will appear here
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </LinearGradient>
  );
}

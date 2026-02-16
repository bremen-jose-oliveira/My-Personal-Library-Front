import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { ExchangeStatus } from "@/Interfaces/exchange";
import { ExchangeCard } from "@/components/ExchangeCard";
import { useRouter } from "expo-router";

export default function BorrowedScreen() {
  const { borrowedBooks, loading, refreshBorrowed, updateExchangeStatus } =
    useExchangeContext();
  const [localLoading, setLocalLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
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
        await refreshBorrowed();
        if (isMounted) {
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

  const isLoading =
    (loading || localLoading) && borrowedBooks.length === 0 && !error;

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
                await refreshBorrowed();
              } catch (err: any) {
                setError(err.message || "Failed to load borrowed books");
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
          <Text className="text-gray-600 mt-3">Loading borrowed books...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
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
              colors={["#bf471b"]}
            />
          }
          renderItem={({ item }) => (
            <ExchangeCard
              exchange={item}
              type="borrowed"
              processing={processing === item.id}
              onReturnPress={
                item.status === ExchangeStatus.ACCEPTED
                  ? () => handleReturnBook(item.id)
                  : undefined
              }
              onViewPress={() => {
                if (item.book?.id) {
                  router.push(`/BookDetails/${item.book.id}`);
                }
              }}
            />
          )}
          ListEmptyComponent={
            !loading && !localLoading ? (
              <View className="flex-1 justify-center items-center px-5 pt-20">
                <Text className="text-gray-500 text-center text-lg mb-2">
                  No borrowed books yet
                </Text>
                <Text className="text-gray-400 text-center">
                  Books you borrow from friends will appear here
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </LinearGradient>
  );
}

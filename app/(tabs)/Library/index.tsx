import { useBookContext } from "@/utils/Context/BookContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  RefreshControl,
  Platform,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LibraryScreen() {
  const { books, fetchCurrentUserBooks } = useBookContext();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUserBooks();
    } catch (error) {
      console.error("Error refreshing books:", error);
    }
    setRefreshing(false);
  };

  const statusMap: { [key: string]: string } = {
    NOT_READ: "Not read",
    READING: "Reading",
    READ: "Finished",
  };

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2"]}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <FlatList
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 8,
          paddingBottom: 80,
        }}
        data={books}
        numColumns={Platform.OS === "web" ? 8 : 4}
        keyExtractor={(book: { id?: number }) =>
          book.id ? book.id.toString() : Math.random().toString()
        }
        renderItem={({ item: book }) => (
          <Link href={`/BookDetails/${book.id}`} asChild>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                margin: 6,
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 12,
                overflow: "hidden",
                padding: 12,
                gap: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              {book.cover ? (
                <Image
                  style={{
                    width: 100,
                    height: 144,
                    resizeMode: "contain",
                    borderRadius: 6,
                  }}
                  source={{ uri: book.cover }}
                  onError={(error) => {
                    console.error(
                      `Failed to load cover image for "${book.title}":`,
                      error.nativeEvent.error
                    );
                  }}
                  onLoad={() => {}}
                />
              ) : (
                <Image
                  style={{
                    width: 100,
                    height: 144,
                    resizeMode: "contain",
                    borderRadius: 6,
                  }}
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/7340/7340665.png",
                  }}
                />
              )}
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    color: "#333",
                    fontWeight: "600",
                    textAlign: "center",
                    fontSize: 14,
                  }}
                  numberOfLines={2}
                >
                  {book.title}
                </Text>
                {book.readingStatus && (
                  <Text style={{ color: "#667eea", fontSize: 12, marginTop: 4 }}>
                    {statusMap[book.readingStatus] ?? book.readingStatus}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Link>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              marginTop: 40,
              padding: 20,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 12,
              marginHorizontal: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text style={{ color: "#333", fontSize: 16, textAlign: "center" }}>
              No books in your library yet.{"\n"}
              Tap the + button to add your first book!
            </Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#667eea",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push("/Library/AddBookForm")}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#ffffff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

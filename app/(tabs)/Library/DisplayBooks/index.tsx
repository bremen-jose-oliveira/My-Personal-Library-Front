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
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function DisplayBooks() {
  const { t } = useTranslation();
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
    NOT_READ: t("books.notRead"),
    READING: t("books.reading"),
    READ: t("books.read"),
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
        }}
      >
        <FlatList
          contentContainerStyle={{
            flex: 1,
            width: "100%", // Make sure it spans full width
            height: "100%", // Make sure it spans full height
          }}
          data={books}
          numColumns={4}
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
                  margin: 4,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderRadius: 10,
                  overflow: "hidden",
                  padding: 8,
                  gap: 8,
                }}
              >
                {book.cover ? (
                  <Image
                    style={{
                      width: 100,
                      height: 144,
                      resizeMode: "contain",
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
                    }}
                    source={{
                      uri: "https://cdn-icons-png.flaticon.com/512/7340/7340665.png",
                    }}
                  />
                )}
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      color: "#f8f0e5",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    {book.title}
                  </Text>
                  {book.readingStatus && (
                    <Text style={{ color: "#cbd5f5", fontSize: 12 }}>
                      {t("books.status")}:{" "}
                      {statusMap[book.readingStatus] ?? book.readingStatus}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </Link>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: "#f0dcc7", fontSize: 16, marginBottom: 8 }}>{t("displayBooks.noBooks")}</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/Library/AddBookForm")}>
                <Text style={{ color: "#bf471b", fontSize: 14 }}>{t("displayBooks.addFirst")}</Text>
              </TouchableOpacity>
            </View>
          }
        />
        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/Library/AddBookForm")}
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            backgroundColor: "#bf471b",
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <MaterialCommunityIcons name="plus" size={32} color="white" />
        </TouchableOpacity>
      </LinearGradient>
    </ImageBackground>
  );
}

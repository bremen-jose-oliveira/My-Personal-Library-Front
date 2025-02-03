// app/DisplayBooks/index.tsx
import { useBookContext } from "@/utils/Context/BookContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Button,
  RefreshControl,
  Alert,
  Platform,
  ImageBackground,
} from "react-native";

export default function DisplayBooks() {
  const { books, deleteBook, fetchCurrentUserBooks } = useBookContext();
  const [refreshing, setRefreshing] = useState(false);

  // Function to handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUserBooks();
    } catch (error) {
      console.error("Error refreshing books:", error);
    }
    setRefreshing(false); // Ensure this happens last
  };

  const handleDeleteBook = (id: number) => {
    if (Platform.OS === "web") {
      // Web-specific alert
      if (window.confirm("Are you sure you want to delete this book?")) {
        deleteBook(id);
      }
    } else {
      // Mobile-specific alert
      Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteBook(id), style: "destructive" },
      ]);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/Background.jpg")}
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
          justifyContent: "flex-start",
        }}
      >
        <FlatList
          data={books}
          keyExtractor={(book) =>
            book.id ? book.id.toString() : Math.random().toString()
          }
          renderItem={({ item: book }) => (
            <View
              style={{
                flexDirection: "row",
                marginTop: 3,
                padding: 1,
                borderRadius: 10,
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              {book.cover ? (
                <Image
                  style={{ width: 100, height: 144 }}
                  source={{ uri: book.cover }}
                />
              ) : (
                <View
                  style={{
                    width: 100,
                    height: 144,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                    backgroundColor: "#d1d5db",
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#f0dcc7",
                      fontSize: 12,
                      lineHeight: 16,
                      textAlign: "center",
                    }}
                  >
                    No Image Available
                  </Text>
                </View>
              )}
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#f0dcc7" }}
                >
                  {book.title}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Author: {book.author}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Year: {book.year}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Publisher: {book.publisher}
                </Text>
                <Button
                  title="Delete Book"
                  onPress={() => handleDeleteBook(book.id)}
                  color="#bf471b"
                />
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        />
      </LinearGradient>
    </ImageBackground>
  );
}

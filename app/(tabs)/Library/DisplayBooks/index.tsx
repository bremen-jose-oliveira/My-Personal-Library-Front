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
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";

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

  const statusMap: { [key: string]: string } = {
    NOT_READ: "Not read",
    READING: "Reading",
    READ: "Finished",
    // Add other statuses as needed
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
        }}
      >
       <FlatList
  contentContainerStyle={{
    flex: 1,
    width: "100%", // Make sure it spans full width
    height: "100%", // Make sure it spans full height
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
          alignItems: "center", // Center the content horizontally and vertically
          margin: 4,
          backgroundColor: "rgba(0,0,0,0.4)",
          borderRadius: 10,
          overflow: "hidden",
          
        }}
      >
        {book.cover ? (
          <Image
            style={{
              width: 100, // Set fixed width for book cover
              height: 144, // Set fixed height for book cover
              resizeMode: "contain", // Ensure the image maintains its aspect ratio
            }}
            source={{ uri: book.cover }}
          />
        ) : (
          <View
            style={{
              width: 100, // Fixed width for the placeholder
              height: 144, // Fixed height for the placeholder
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
      </TouchableOpacity>
    </Link>
  )}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
  keyboardShouldPersistTaps="handled"
/>
      </LinearGradient>
    </ImageBackground>
  );
}

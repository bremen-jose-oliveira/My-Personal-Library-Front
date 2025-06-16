
import { useBookContext } from "@/utils/Context/BookContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Book from "@/Interfaces/book";
import { fetchCoverImage } from "@/utils/fetchBookData";

export default function BookDetails() {
  const { bookData, deleteBook, fetchCurrentUserBooksById ,fetchCurrentUserBooks  } = useBookContext();
  const [refreshing, setRefreshing] = useState(false);

const { id } = useLocalSearchParams<{ id: string }>();


const bookId = Number(id);

useEffect(() => {
  if (!isNaN(bookId)) {
    fetchCurrentUserBooksById(bookId);
  }
}, [bookId]);

  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCurrentUserBooksById(Number(id));
    setRefreshing(false);
  };



  const handleDeleteBook = (id: number) => {
    if (Platform.OS === "web") {
      // Web-specific alert
      if (window.confirm("Are you sure you want to delete this book?")) {
        deleteBook(id);
      }
      router.push("/Library/DisplayBooks"); 
    } else {
      // Mobile-specific alert
      Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteBook(id), style: "destructive" },
      ]);
      router.push("/Library/DisplayBooks"); 
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
          justifyContent: "flex-start",
        }}
      >
        <FlatList
            style={{ flex:1, width: "100%" }}
          data={bookData}
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
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Status: {statusMap[book.status] || book.status}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Owner: {book.owner}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Exchange Status: {book.exchangeStatus}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Exchanges: {book.exchanges}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Reviews: {book.reviews}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Review Count: {book.reviewCount}
                </Text>
          
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  ISBN: {book.isbn}
                </Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>
                  Reading Status: {book.readingStatus}
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

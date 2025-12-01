import React, { useEffect, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBookContext } from "@/utils/Context/BookContext";

export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);
  const { selectedBook, fetchBookById, updateBook, loadingDetails } = useBookContext();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [publisher, setPublisher] = useState("");
  const [isbn, setIsbn] = useState("");
  const [cover, setCover] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (bookId && !isNaN(bookId)) {
      fetchBookById(bookId);
    }
  }, [bookId]);

  useEffect(() => {
    if (selectedBook) {
      setTitle(selectedBook.title || "");
      setAuthor(selectedBook.author || "");
      setYear(selectedBook.year?.toString() || "");
      setPublisher(selectedBook.publisher || "");
      setIsbn(selectedBook.isbn || "");
      setCover(selectedBook.cover || "");
    }
  }, [selectedBook]);

  const handleSave = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert("Error", "Title and Author are required");
      return;
    }

    setSaving(true);
    try {
      await updateBook(bookId, {
        title: title.trim(),
        author: author.trim(),
        year: year ? parseInt(year) : undefined,
        publisher: publisher.trim() || undefined,
        isbn: isbn.trim() || undefined,
        cover: cover.trim() || undefined,
      });
      Alert.alert("Success", "Book updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  if (loadingDetails) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#bf471b" />
      </View>
    );
  }

  if (!selectedBook) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#f0dcc7", fontSize: 16 }}>Book not found</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/Background.jpg")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
      resizeMode="cover"
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
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginBottom: 20,
              padding: 8,
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#f0dcc7", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#f0dcc7",
              marginBottom: 20,
            }}
          >
            Edit Book
          </Text>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ color: "#f0dcc7", marginBottom: 8, fontWeight: "600" }}>
                Title *
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Book Title"
                placeholderTextColor="#d1d5db"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "#f0dcc7",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#f0dcc7", marginBottom: 8, fontWeight: "600" }}>
                Author *
              </Text>
              <TextInput
                value={author}
                onChangeText={setAuthor}
                placeholder="Author Name"
                placeholderTextColor="#d1d5db"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "#f0dcc7",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#f0dcc7", marginBottom: 8, fontWeight: "600" }}>
                Year
              </Text>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="Publication Year"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "#f0dcc7",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#f0dcc7", marginBottom: 8, fontWeight: "600" }}>
                Publisher
              </Text>
              <TextInput
                value={publisher}
                onChangeText={setPublisher}
                placeholder="Publisher"
                placeholderTextColor="#d1d5db"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "#f0dcc7",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#f0dcc7", marginBottom: 8, fontWeight: "600" }}>
                ISBN
              </Text>
              <TextInput
                value={isbn}
                onChangeText={setIsbn}
                placeholder="ISBN"
                placeholderTextColor="#d1d5db"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "#f0dcc7",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            <View>
              <Text style={{ color: "#f0dcc7", marginBottom: 8, fontWeight: "600" }}>
                Cover URL
              </Text>
              <TextInput
                value={cover}
                onChangeText={setCover}
                placeholder="Cover Image URL"
                placeholderTextColor="#d1d5db"
                style={{
                  backgroundColor: "rgba(0,0,0,0.4)",
                  color: "#f0dcc7",
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: saving ? "#666" : "#bf471b",
                padding: 16,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}


import { AuthContext } from "@/utils/Context/AuthContext";
import { useBookContext } from "@/utils/Context/BookContext";
import { useFriendContext } from "@/utils/Context/FriendContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  RefreshControl,
} from "react-native";

const HomeScreen = () => {
  // CRITICAL: All hooks must be called before any conditional returns
  // This ensures React hooks are called in the same order every render
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const { isLoggedIn } = authContext || { isLoggedIn: false };
  const { books, fetchCurrentUserBooks } = useBookContext();
  const { friends, fetchCurrentUserFriends } = useFriendContext();
  const { refreshCurrentUser } = useUserContext();
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to welcome screen if not logged in
  // Use useEffect to handle navigation instead of Redirect component
  // This prevents app reloads and blank screens
  useEffect(() => {
    if (!isLoggedIn) {
      console.log(
        "🚫 HomeScreen: User not logged in, redirecting to welcome screen"
      );
      // Use a small delay to ensure state has propagated
      const timer = setTimeout(() => {
        try {
          router.replace("/");
          console.log("✅ HomeScreen: Navigated to welcome screen");
        } catch (error) {
          console.warn("Navigation error in HomeScreen:", error);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, router]);

  // Don't render or fetch data if not logged in
  // IMPORTANT: This check happens AFTER all hooks are called
  // Return null instead of Redirect to prevent app reload
  if (!isLoggedIn) {
    // Return null - the useEffect will handle navigation
    return null;
  }

  const numberOfBooks = books.length;
  const numberOfFriends = friends.length;

  const onRefresh = async () => {
    // Don't fetch if not logged in
    if (!isLoggedIn) {
      return;
    }

    setRefreshing(true);
    try {
      // Refresh all data: books, friends, and user info
      await Promise.all([
        fetchCurrentUserBooks(),
        fetchCurrentUserFriends(),
        refreshCurrentUser(),
      ]);
      console.log("✅ Refreshed all data: books, friends, and user");
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
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
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 50,
            paddingBottom: 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#bf471b"
              colors={["#bf471b"]}
            />
          }
        >
          <View
            style={{
              width: "80%",
              alignItems: "center",
            }}
          >
            {/* Total Amount of Books */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 10,
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 10,
                width: "100%",
                marginBottom: 20, // Space between books and friends card
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  marginRight: 10,
                  flexGrow: 1,
                  textAlign: "center",
                  color: "#f0dcc7",
                }}
              >
                Total Amount of Books
              </Text>
              <View
                style={{
                  minWidth: 30,
                  paddingHorizontal: 10,
                  height: 25,
                  borderRadius: 15,
                  backgroundColor: "gray",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#f5eee6", fontWeight: "bold" }}>
                  {numberOfBooks}
                </Text>
              </View>
            </View>

            {/* Total Amount of Friends */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 10,
                backgroundColor: "rgba(0,0,0,0.4)",
                borderRadius: 10,
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "bold",
                  marginRight: 10,
                  flexGrow: 1,
                  textAlign: "center",
                  color: "#f0dcc7",
                }}
              >
                Total Amount of Friends
              </Text>
              <View
                style={{
                  minWidth: 30,
                  paddingHorizontal: 10,
                  height: 25,
                  borderRadius: 15,
                  backgroundColor: "gray",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#f5eee6", fontWeight: "bold" }}>
                  {numberOfFriends}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default HomeScreen;

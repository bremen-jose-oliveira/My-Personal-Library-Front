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
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const HomeScreen = () => {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const { isLoggedIn } = authContext || { isLoggedIn: false };
  const { books, fetchCurrentUserBooks } = useBookContext();
  const { friends, fetchCurrentUserFriends } = useFriendContext();
  const { refreshCurrentUser } = useUserContext();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      const timer = setTimeout(() => {
        try {
          router.replace("/");
        } catch (error) {
          console.error("Navigation error in HomeScreen:", error);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const numberOfBooks = books.length;
  const numberOfFriends = friends.length;

  const onRefresh = async () => {
    if (!isLoggedIn) {
      return;
    }

    setRefreshing(true);
    try {
      await Promise.all([
        fetchCurrentUserBooks(),
        fetchCurrentUserFriends(),
        refreshCurrentUser(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#ffffff",
              marginBottom: 6,
            }}
          >
            Welcome Back!
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Here's your library overview
          </Text>
        </View>

        {/* Statistics Cards */}
        <View
          style={{
            flexDirection: "row",
            gap: 15,
            marginBottom: 25,
          }}
        >
          {/* Books Card */}
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                backgroundColor: "#667eea",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons
                name="book-multiple"
                size={26}
                color="#ffffff"
              />
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#333",
                marginBottom: 4,
              }}
            >
              {numberOfBooks}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#666",
              }}
            >
              Total Books
            </Text>
          </View>

          {/* Friends Card */}
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                backgroundColor: "#f093fb",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={26}
                color="#ffffff"
              />
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#333",
                marginBottom: 4,
              }}
            >
              {numberOfFriends}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#666",
              }}
            >
              Friends
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: 15,
            }}
          >
            Quick Actions
          </Text>

          {/* Action Buttons Grid */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 14,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
              onPress={() => router.push("/(tabs)/Library")}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: "#667eea",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <MaterialCommunityIcons
                  name="library"
                  size={22}
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 2,
                  }}
                >
                  My Library
                </Text>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  Browse your collection
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 14,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
              onPress={() => router.push("/(tabs)/BrowseBooks")}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: "#f093fb",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <MaterialCommunityIcons
                  name="book-search"
                  size={22}
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 2,
                  }}
                >
                  Browse Books
                </Text>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  Discover new books
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 14,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
              onPress={() => router.push("/(tabs)/Friends")}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  backgroundColor: "#764ba2",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <MaterialCommunityIcons
                  name="account-multiple"
                  size={22}
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: 2,
                  }}
                >
                  Friends
                </Text>
                <Text style={{ fontSize: 13, color: "#666" }}>
                  Connect with readers
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

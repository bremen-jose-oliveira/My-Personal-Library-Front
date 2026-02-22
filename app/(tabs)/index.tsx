import { AuthContext } from "@/utils/Context/AuthContext";
import { useBookContext } from "@/utils/Context/BookContext";
import { useFriendContext } from "@/utils/Context/FriendContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const HomeScreen = () => {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const { isLoggedIn } = authContext || { isLoggedIn: false };
  const { books, fetchCurrentUserBooks } = useBookContext();
  const { friends, fetchCurrentUserFriends } = useFriendContext();
  const { borrowedBooks, lendingBooks, refreshAll } = useExchangeContext();
  const { currentUser, refreshCurrentUser } = useUserContext();
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
  const numberOfBorrowed = borrowedBooks.length;
  const numberOfLending = lendingBooks.length;

  // Generate welcome message with username if available
  const welcomeMessage = currentUser?.username
    ? t("auth.welcomeBackName", { username: currentUser.username })
    : t("auth.welcomeBack");

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
        refreshAll(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Dashboard stat card component (transparent black like Borrowed/Lending pages)
  const StatCard = ({
    icon,
    title,
    value,
    color,
    onPress,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    value: number;
    color: string;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 16,
        padding: 16,
        width: "48%",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: color,
        borderWidth: 1,
        borderColor: "#bf471b",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color: "#f0dcc7",
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 13, color: "#f0dcc7", fontWeight: "500" }}>
        {title}
      </Text>
    </Pressable>
  );

  // Quick action button component
  const QuickActionButton = ({
    icon,
    label,
    onPress,
    color,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        width: "48%",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <MaterialCommunityIcons name={icon} size={32} color="white" />
      <Text
        style={{
          color: "white",
          fontSize: 13,
          fontWeight: "600",
          marginTop: 8,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("@/assets/images/background2.png")}
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.9)"]}
        style={{
          flex: 1,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingTop: 12,
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
          {/* Welcome Section */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#bf471b",
                marginBottom: 4,
              }}
            >
              {welcomeMessage}
            </Text>
            <Text style={{ fontSize: 16, color: "#8b4513" }}>
              {t("home.libraryOverview")}
            </Text>
          </View>

          {/* Stats Grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <StatCard
              icon="bookshelf"
              title={t("home.myBooks")}
              value={numberOfBooks}
              color="#bf471b"
              onPress={() => router.push("/(tabs)/Library/DisplayBooks")}
            />
            <StatCard
              icon="account-group"
              title={t("home.friends")}
              value={numberOfFriends}
              color="#2196F3"
              onPress={() => router.push("/(tabs)/Friends/FriendList")}
            />
            <StatCard
              icon="book-arrow-down"
              title={t("home.borrowed")}
              value={numberOfBorrowed}
              color="#4CAF50"
              onPress={() => router.push("/(tabs)/Borrowed")}
            />
            <StatCard
              icon="book-arrow-up"
              title={t("home.lending")}
              value={numberOfLending}
              color="#FF9800"
              onPress={() => router.push("/(tabs)/Lending")}
            />
          </View>

          {/* Quick Actions Section */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#8b4513",
                marginBottom: 16,
              }}
            >
              {t("home.quickActions")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <QuickActionButton
                icon="book-plus-multiple"
                label={t("home.addBook")}
                color="#bf471b"
                onPress={() => router.push("/(tabs)/Library/AddBookForm")}
              />
              <QuickActionButton
                icon="book-search"
                label={t("home.browseBooks")}
                color="#2196F3"
                onPress={() => router.push("/(tabs)/BrowseBooks")}
              />
              <QuickActionButton
                icon="book-open-variant"
                label={t("home.readingList")}
                color="#4CAF50"
                onPress={() => router.push("/(tabs)/ReadingList")}
              />
              <QuickActionButton
                icon="star-outline"
                label={t("home.myReviews")}
                color="#FF9800"
                onPress={() => router.push("/(tabs)/MyReviews")}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

export default HomeScreen;

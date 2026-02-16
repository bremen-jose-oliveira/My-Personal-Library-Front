import { AuthContext } from "@/utils/Context/AuthContext";
import { useBookContext } from "@/utils/Context/BookContext";
import { useFriendContext } from "@/utils/Context/FriendContext";
import { useUserContext } from "@/utils/Context/UserContext";
import { useExchangeContext } from "@/utils/Context/ExchangeContext";
import { useReviewContext } from "@/utils/Context/ReviewContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { StatCard } from "@/components/StatCard";
import { QuickActionButton } from "@/components/QuickActionButton";
import { SectionHeader } from "@/components/SectionHeader";
import { RecentBookCard } from "@/components/RecentBookCard";

const HomeScreen = () => {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const { isLoggedIn } = authContext || { isLoggedIn: false };
  const { books, fetchCurrentUserBooks } = useBookContext();
  const { friends, fetchCurrentUserFriends } = useFriendContext();
  const { currentUser, refreshCurrentUser } = useUserContext();
  const { borrowedBooks, lendingBooks, refreshAll: refreshExchanges } = useExchangeContext();
  const { myReviews, fetchMyReviews } = useReviewContext();
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyReviews();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  const numberOfBooks = books.length;
  const numberOfFriends = friends.length;
  const numberOfBorrowed = borrowedBooks.length;
  const numberOfLending = lendingBooks.length;
  const numberOfReviews = myReviews.length;
  
  // Get reading list count from books with reading status
  const readingListCount = books.filter(book => book.readingStatus === 'reading' || book.readingStatus === 'want-to-read').length;

  // Get recent books (last 4)
  const recentBooks = books.slice(0, 4);

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
        refreshExchanges(),
        fetchMyReviews(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <LinearGradient
      colors={["#f5f5f5", "#ffffff"]}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#bf471b"
            colors={["#bf471b"]}
          />
        }
      >
        {/* Welcome Header */}
        <View className="px-5 pt-12 pb-6">
          <Text className="text-gray-500 text-sm font-medium mb-1">
            {getGreeting()},
          </Text>
          <Text className="text-gray-800 text-3xl font-bold">
            {currentUser?.username || "Reader"}
          </Text>
        </View>

        {/* Statistics Grid */}
        <View className="px-4 mb-6">
          <SectionHeader title="Your Library Stats" />
          <View className="flex-row flex-wrap -mx-1">
            <View className="w-1/2">
              <StatCard
                title="Books Owned"
                value={numberOfBooks}
                icon={<Ionicons name="book" size={24} color="#bf471b" />}
                color="#bf471b"
                onPress={() => router.push("/(tabs)/Library")}
              />
            </View>
            <View className="w-1/2">
              <StatCard
                title="Friends"
                value={numberOfFriends}
                icon={<Ionicons name="people" size={24} color="#4a90e2" />}
                color="#4a90e2"
                onPress={() => router.push("/(tabs)/Friends")}
              />
            </View>
            <View className="w-1/2">
              <StatCard
                title="Borrowed"
                value={numberOfBorrowed}
                icon={<MaterialCommunityIcons name="book-arrow-down" size={24} color="#e67e22" />}
                color="#e67e22"
                onPress={() => router.push("/(tabs)/Borrowed")}
              />
            </View>
            <View className="w-1/2">
              <StatCard
                title="Lending"
                value={numberOfLending}
                icon={<MaterialCommunityIcons name="book-arrow-up" size={24} color="#27ae60" />}
                color="#27ae60"
                onPress={() => router.push("/(tabs)/Lending")}
              />
            </View>
            <View className="w-1/2">
              <StatCard
                title="Reviews"
                value={numberOfReviews}
                icon={<FontAwesome5 name="star" size={20} color="#f39c12" />}
                color="#f39c12"
                onPress={() => router.push("/(tabs)/MyReviews")}
              />
            </View>
            <View className="w-1/2">
              <StatCard
                title="Reading List"
                value={readingListCount}
                icon={<MaterialCommunityIcons name="book-open-variant" size={24} color="#9b59b6" />}
                color="#9b59b6"
                onPress={() => router.push("/(tabs)/ReadingList")}
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <SectionHeader title="Quick Actions" />
          <View className="flex-row -mx-1">
            <QuickActionButton
              title="Add Book"
              icon={<Ionicons name="add-circle" size={28} color="#fff" />}
              onPress={() => router.push("/(tabs)/Library/AddBook")}
              gradient={["#bf471b", "#d45d2a"]}
            />
            <QuickActionButton
              title="Browse Books"
              icon={<Ionicons name="search" size={28} color="#fff" />}
              onPress={() => router.push("/(tabs)/BrowseBooks")}
              gradient={["#4a90e2", "#5ba3f5"]}
            />
            <QuickActionButton
              title="View Friends"
              icon={<Ionicons name="people" size={28} color="#fff" />}
              onPress={() => router.push("/(tabs)/Friends")}
              gradient={["#27ae60", "#2ecc71"]}
            />
          </View>
        </View>

        {/* Recent Books */}
        {recentBooks.length > 0 && (
          <View className="px-4 mb-6">
            <SectionHeader
              title="Recent Books"
              actionText="View All"
              onActionPress={() => router.push("/(tabs)/Library")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {recentBooks.map((book) => (
                <RecentBookCard
                  key={book.id}
                  title={book.title}
                  author={book.author}
                  coverUrl={book.cover || undefined}
                  onPress={() => router.push(`/BookDetails/${book.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Activity Summary */}
        <View className="px-4">
          <SectionHeader title="Activity Summary" />
          <View
            className="bg-white rounded-2xl p-5"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="bg-blue-100 rounded-full p-2 mr-3">
                  <Ionicons name="book" size={20} color="#4a90e2" />
                </View>
                <Text className="text-gray-700 font-medium">Total Collection</Text>
              </View>
              <Text className="text-gray-800 font-bold text-lg">{numberOfBooks}</Text>
            </View>
            
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="bg-orange-100 rounded-full p-2 mr-3">
                  <MaterialCommunityIcons name="swap-horizontal" size={20} color="#e67e22" />
                </View>
                <Text className="text-gray-700 font-medium">Active Exchanges</Text>
              </View>
              <Text className="text-gray-800 font-bold text-lg">{numberOfBorrowed + numberOfLending}</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-yellow-100 rounded-full p-2 mr-3">
                  <FontAwesome5 name="star" size={18} color="#f39c12" />
                </View>
                <Text className="text-gray-700 font-medium">Reviews Written</Text>
              </View>
              <Text className="text-gray-800 font-bold text-lg">{numberOfReviews}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

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
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/Card";

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

  const QuickActionButton = ({ 
    icon, 
    label, 
    onPress, 
    color = Colors.primary 
  }: { 
    icon: string; 
    label: string; 
    onPress: () => void; 
    color?: string;
  }) => {
    // Extract RGB values from hex color for opacity
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        style={{
          flex: 1,
          minWidth: 100,
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 16,
          alignItems: 'center',
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View 
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: hexToRgba(color, 0.2),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        </View>
        <Text 
          style={{ 
            fontSize: 12, 
            fontWeight: '600', 
            color: Colors.textPrimary,
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 24,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: 24 }}>
          <Text 
            style={{ 
              fontSize: 28, 
              fontWeight: '800', 
              color: Colors.textPrimary,
              marginBottom: 4,
            }}
          >
            My Library
          </Text>
          <Text 
            style={{ 
              fontSize: 16, 
              color: Colors.textSecondary,
            }}
          >
            Welcome back! Here's your reading overview
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <StatCard
            title="Books"
            value={numberOfBooks}
            icon={<MaterialCommunityIcons name="book" size={24} color={Colors.primary} />}
            color={Colors.primary}
          />
          <StatCard
            title="Friends"
            value={numberOfFriends}
            icon={<MaterialCommunityIcons name="account-group" size={24} color={Colors.accent} />}
            color={Colors.accent}
          />
        </View>

        {/* Quick Actions */}
        <Card style={{ marginBottom: 24 }}>
          <Text 
            style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              color: Colors.textPrimary,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <QuickActionButton
              icon="book-plus"
              label="Add Book"
              onPress={() => router.push("/(tabs)/Library")}
              color={Colors.primary}
            />
            <QuickActionButton
              icon="book-search"
              label="Browse"
              onPress={() => router.push("/(tabs)/BrowseBooks")}
              color={Colors.accent}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <QuickActionButton
              icon="account-plus"
              label="Add Friend"
              onPress={() => router.push("/(tabs)/Friends")}
              color={Colors.success}
            />
            <QuickActionButton
              icon="book-open-variant"
              label="Reading List"
              onPress={() => router.push("/(tabs)/ReadingList")}
              color={Colors.info}
            />
          </View>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <Text 
            style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              color: Colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Library Status
          </Text>
          <View style={{ gap: 12 }}>
            <View 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons 
                  name="book-arrow-down" 
                  size={24} 
                  color={Colors.warning} 
                />
                <Text style={{ fontSize: 15, color: Colors.textPrimary }}>
                  Borrowed Books
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/Borrowed")}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.primary }}>
                  View →
                </Text>
              </TouchableOpacity>
            </View>
            <View 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons 
                  name="book-arrow-up" 
                  size={24} 
                  color={Colors.info} 
                />
                <Text style={{ fontSize: 15, color: Colors.textPrimary }}>
                  Lending Books
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/Lending")}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.primary }}>
                  View →
                </Text>
              </TouchableOpacity>
            </View>
            <View 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons 
                  name="star" 
                  size={24} 
                  color={Colors.warning} 
                />
                <Text style={{ fontSize: 15, color: Colors.textPrimary }}>
                  My Reviews
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/MyReviews")}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.primary }}>
                  View →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

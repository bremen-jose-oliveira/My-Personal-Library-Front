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
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { StatCard } from "@/components/modern";

const HomeScreen = () => {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const { isLoggedIn } = authContext || { isLoggedIn: false };
  const { books, fetchCurrentUserBooks } = useBookContext();
  const { friends, fetchCurrentUserFriends } = useFriendContext();
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

  const quickActions = [
    {
      title: "Add Book",
      icon: "book-plus" as keyof typeof MaterialCommunityIcons.glyphMap,
      color: theme.colors.primary[500],
      route: "/(tabs)/Library/AddBookForm",
    },
    {
      title: "Browse",
      icon: "book-search" as keyof typeof MaterialCommunityIcons.glyphMap,
      color: theme.colors.secondary[500],
      route: "/(tabs)/BrowseBooks",
    },
    {
      title: "Friends",
      icon: "account-group" as keyof typeof MaterialCommunityIcons.glyphMap,
      color: "#22c55e",
      route: "/(tabs)/Friends",
    },
    {
      title: "Reviews",
      icon: "star" as keyof typeof MaterialCommunityIcons.glyphMap,
      color: "#eab308",
      route: "/(tabs)/MyReviews",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={["#ff6b35", "#ff9166"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.userName}>
                {currentUser?.name || "Book Lover"}
              </Text>
            </View>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name="account-circle"
                size={48}
                color="#fff"
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <StatCard
              title="Total Books"
              value={numberOfBooks}
              icon="bookshelf"
              gradient={["#ff6b35", "#f04e1a"]}
            />
          </View>
          <View style={styles.statCard}>
            <StatCard
              title="Friends"
              value={numberOfFriends}
              icon="account-group"
              gradient={["#0ea5e9", "#0284c7"]}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickActionCard, { backgroundColor: "#fff" }]}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + "20" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={28}
                    color={action.color}
                  />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Library Overview</Text>
          <View style={styles.card}>
            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="book-open-variant"
                  size={24}
                  color={theme.colors.primary[500]}
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Currently Reading</Text>
                <Text style={styles.overviewValue}>Track your progress</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.overviewItem}>
              <View style={styles.overviewIcon}>
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={24}
                  color={theme.colors.secondary[500]}
                />
              </View>
              <View style={styles.overviewContent}>
                <Text style={styles.overviewLabel}>Book Exchanges</Text>
                <Text style={styles.overviewValue}>
                  Borrow and lend books
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "800",
    marginTop: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: -24,
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  quickActionCard: {
    width: "47%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    ...theme.shadows.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text.primary,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    ...theme.shadows.sm,
  },
  overviewItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  overviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  overviewContent: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
    marginVertical: 16,
  },
});

export default HomeScreen;

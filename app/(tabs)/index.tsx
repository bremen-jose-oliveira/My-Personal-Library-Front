import { AuthProvider } from "@/utils/Context/AuthContext";
import { useBookContext } from "@/utils/Context/BookContext";
import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View, Text, ImageBackground } from "react-native";

const HomeScreen = () => {
  const { books, fetchCurrentUserBooks } = useBookContext();
  const { friends, fetchCurrentUserFriends } = useFriendContext();
  const [refreshing, setRefreshing] = useState(false);

  const numberOfBooks = books.length;
  const numberOfFriends = friends.length;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUserBooks();
    } catch (error) {
      console.error("Error refreshing books:", error);
    }
    setRefreshing(false); // Ensure this happens last
  };

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
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <View
          style={{
            marginTop: 50,
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
      </LinearGradient>
    </ImageBackground>
  );
};

export default HomeScreen;

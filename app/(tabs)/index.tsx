import { AuthProvider } from "@/utils/Context/AuthContext";
import { useBookContext } from "@/utils/Context/BookContext";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View, Text, ImageBackground } from "react-native";


const HomeScreen = () => {


 const { books, deleteBook, fetchCurrentUserBooks } = useBookContext();
  const [refreshing, setRefreshing] = useState(false);



    const numberOfBooks = books.length;

  // Function to handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCurrentUserBooks();
    } catch (error) {
      console.error('Error refreshing books:', error);
    }
    setRefreshing(false); // Ensure this happens last
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
             
        <View style={{ flex: 1,marginTop:50, justifyContent: "flex-start", alignItems: "center" }}>
        <View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor:'rgba(0,0,0,0.4)',
    borderRadius: 10,
    width: "80%", 
  }}
>
  <Text
    style={{
      fontSize: 15,
      fontWeight: "bold",
      marginRight: 10,
      flexGrow: 1, 
      textAlign: "center", 
      color:"#f0dcc7"
    }}
  >
    Total Amount of Books
  </Text>
  <View
    style={{
      minWidth: 30, // Ensures the number box is visible
      paddingHorizontal: 10, // Allows number to fit dynamically
      height: 25,
      borderRadius: 15,
      backgroundColor: "gray",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Text style={{ color: "white#f5eee6", fontWeight: "bold" }}>{numberOfBooks}</Text>
  </View>
</View>
        </View>
        
   </LinearGradient>
          </ImageBackground>
       
    );
}
export default HomeScreen;
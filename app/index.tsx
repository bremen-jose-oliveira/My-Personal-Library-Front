// app/index.tsx
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, useRouter } from "expo-router";
import { useContext, useState, useEffect } from "react";
import "../global.css";
import Login from "./Login";
import { TouchableOpacity, View, Text } from "react-native";
import { StatusBar } from 'expo-status-bar';


/*

export default function Home() {
  const { isLoggedIn } = useContext(AuthContext);
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Set hasMounted to true once the component has mounted
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Perform redirect only if the component has mounted and user is logged in

    if (hasMounted && isLoggedIn) {
      router.push('/(tabs)/DisplayBooks');
      
      
    }
  }, [hasMounted, isLoggedIn]);

  // Show Login screen if not logged in
  if (!isLoggedIn) {
    return <Login />;
  }

  // Return null while redirecting
  return null;
}

*/



export default function WelcomeScreen() {
  //const { isLoggedIn } = useContext(AuthContext);

  return (
    
    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: "white" }}>
      <StatusBar style="auto" />
      <Text> Welcome Screeen </Text>
    <TouchableOpacity>
      <Link href={"/Login"}>
        <Text> Go to Login </Text>
      </Link>
    </TouchableOpacity>
    <TouchableOpacity>
      <Link href={"/Register"}>
        <Text> Go to Register </Text>
      </Link>
    </TouchableOpacity>
    </View>
  );
}

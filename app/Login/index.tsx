import { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { AuthContext } from "@/utils/Context/AuthContext";
import Ioicons from "react-native-vector-icons/Ionicons";
import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Colors } from "@/constants/Colors";
import React from "react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password.");
      return;
    }

    try {
      await login(username, password);
      router.dismissAll();
      router.push("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Error", error.message || "Failed to log in");
    }
  };

  return (
    <>

      <Stack.Screen
        options={{
          headerTitle: "Sign Up",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ioicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <Text style={styles.title}> Sign in your Account</Text>

   
        <InputField
          value={username}
          onChangeText={setUsername}
          placeholder="Enter a Username"
          placeholderTextColor={Colors.gray}
          autoCapitalize="none"
        />

      
        <InputField
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Enter Password..."
          placeholderTextColor={Colors.gray}
        />


   

        <TouchableOpacity style={styles.btn} 
        >
          <Text style={styles.btnTxt}>SignIn</Text>
        </TouchableOpacity>

        <Text style={styles.loginTxt}>
         Don't have an Account?{" "}
          <Link href={"/Register"} asChild>
            <TouchableOpacity>
              <Text style={styles.loginTxtSpan}> SignUp </Text>
            </TouchableOpacity>
          </Link>
        </Text>
      <View style={styles.devider}></View>
      <SocialLoginButtons emailHref={"/Register"} />
      </View>
      
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: Colors.black,
    marginBottom: 50,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignSelf: "stretch",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 30,
  },
  btnTxt: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },

  loginTxt: {
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 24,
    color: Colors.black,
  },
  loginTxtSpan: {
    color: Colors.primary,
    fontWeight: "600",
  },
  devider: {
    borderTopColor: Colors.gray,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: "30%",
    marginBottom: 30,
  },

});



/*
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <View style={{ margin: 20, width: "80%" }}>
          <Text>Username:</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter Username..."
            style={{ borderWidth: 1, padding: 10, marginTop: 5 }}
          />

          <Text style={{ marginTop: 20 }}>Password:</Text>
          <TextInput
            secureTextEntry={secureText}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Password..."
            style={{ borderWidth: 1, padding: 10, marginTop: 5 }}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Text>{secureText ? "Show Password" : "Hide Password"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ backgroundColor: "blue", padding: 15, marginTop: 20 }}
            onPress={handleLogin}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Text>New to the Library? </Text>
            <TouchableOpacity onPress={() => router.push("/Register")}>
              <Text style={{ color: "blue" }}>Create an Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
*/

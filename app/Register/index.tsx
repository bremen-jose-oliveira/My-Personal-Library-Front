import InputField from "@/components/inputField";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Colors } from "@/constants/Colors";
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, router, Stack } from "expo-router";
import React, { useState, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
} from "react-native";
import Ioicons from "react-native-vector-icons/Ionicons";

export default function Register() {
  const { createUser } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(""); // for confirming passwords

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return; // Prevent further action if passwords don't match
    }

    try {
      await createUser(username, email, password);
      router.dismissAll();
      router.push("/");
    } catch (error) {
      Alert.alert("Error", "Failed to register");
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
        <Text style={styles.title}> Create an Account </Text>

   
        <InputField
          value={username}
          onChangeText={setUsername}
          placeholder="Enter a Username"
          placeholderTextColor={Colors.gray}
          autoCapitalize="none"
        />

      
        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="Enter Email..."
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

        <InputField
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password..."
          placeholderTextColor={Colors.gray}
        />

        {passwordError ? (
          <Text style={{ color: "red", marginTop: 5, marginBottom: 5, }}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity style={styles.btn} 
        onPress={handleRegister}>
          <Text style={styles.btnTxt}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.loginTxt}>
          Have an Account?{" "}
          <Link href={"/Login"} asChild>
            <TouchableOpacity>
              <Text style={styles.loginTxtSpan}> SignIn </Text>
            </TouchableOpacity>
          </Link>
        </Text>
      <View style={styles.devider}></View>
      <SocialLoginButtons emailHref={"/Login"} />
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


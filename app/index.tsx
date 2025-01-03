// app/index.tsx
import { AuthContext } from "@/utils/Context/AuthContext";
import { Link, useRouter } from "expo-router";
import { useContext, useState, useEffect } from "react";
import "../global.css";
import Login from "./Login";
import { TouchableOpacity, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function WelcomeScreen() {
  return (
    <View
      style={{
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <StatusBar style="auto" />
      <Text> Welcome Screeen </Text>
      <TouchableOpacity>
        <Link href={"/Login"} asChild>
          <Text> Go to Login </Text>
        </Link>
      </TouchableOpacity>
      <TouchableOpacity>
        <Link href={"/Register"} asChild>
          <Text> Go to Register </Text>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

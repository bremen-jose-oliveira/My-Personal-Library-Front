import { Alert, Text, TouchableOpacity, View } from "react-native";
import * as Google from 'expo-auth-session/providers/google';
import React, { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Href, Link, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import GoogleLogo from "../assets/images/google-icon.svg";
import "../global.css";
import * as SecureStore from 'expo-secure-store';
import { getToken, storeToken } from "@/utils/Context/storageUtils";
import { AuthContext } from "@/utils/Context/AuthContext";

type Props = {
  emailHref: Href;
};

const SocialLoginButtons = (props: Props) => {

  

      const router = useRouter();


      
  const { handleGoogleLogin } = useContext(AuthContext);



  const { emailHref } = props;

  return (
    <View style={{
      alignSelf: 'stretch',
    }}>
      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(300).duration(500)}
      >
        <Link href={emailHref} asChild>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1, 
              borderColor: "#666",
              padding: 10,
              borderRadius: 25,
              gap: 5,
              marginBottom: 15,
            }}
          >
            <Ionicons name="mail-outline" size={20} color="black" />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#333",
              }}
            >
              Continue with Email
            </Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>

      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(700).duration(500)}
      >
         
        <TouchableOpacity
      
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#666",
            padding: 10,
            borderRadius: 25,
            gap: 5,
            marginBottom: 15,
          }}

          onPress={handleGoogleLogin}
         
          //onPress={googleAuth}
       //  disabled={!request}
        // onPress={() => {promptAsync();}}
        >
          
          <GoogleLogo width={20} height={20} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#333" }}>
            Continue with Google
          </Text>
        </TouchableOpacity>
  
      </Animated.View>

      <Animated.View
        style={{
          alignSelf: "stretch",
        }}
        entering={FadeInDown.delay(1100).duration(500)}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "#666",
            padding: 10,
            gap: 5,
            borderRadius: 25,
            marginBottom: 15,
          }}
        >
          <Ionicons name="logo-apple" size={20} color="black" />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#333" }}>
            Continue with Apple
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SocialLoginButtons;

// app/index.tsx

import { Link, Stack, useRouter } from "expo-router";
import "../global.css";
import { TouchableOpacity, View, Text, ImageBackground, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeInRight }  from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import GoogleLogo from '@/assets/images/google-icon.svg';
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function WelcomeScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("@/assets/images/Background.jpg")}
        style={{ flex: 1 }}
       resizeMode="cover"
      >
        <View
          style={styles.container}
        >
          <LinearGradient colors={["transparent",
             "rgba(255,255,255,0.5)",
             "rgba(255,255,255,1)"]}
              style={ styles.background }
              >
            <View style={styles.wrapper}>

            <Animated.Text  style={ styles.title} entering={FadeInRight.delay(300).duration(300).springify()} > My Library </Animated.Text>
            <Animated.Text style={ styles.description}  entering={FadeInRight.delay(500).duration(300).springify()}> Your Own Private Book Colection  </Animated.Text>

            <SocialLoginButtons emailHref={"/Register"} />
           <Text style={styles.loginTxt}>
            Have an Account? {" "}
            <Link href={"/Login"} asChild>
              <TouchableOpacity>
                <Text style={styles.loginTxtSpan}> SignIn </Text>
              </TouchableOpacity>
            </Link>
            </Text>
            </View>
          </LinearGradient>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: { 
    flex: 1, 
    position: 'absolute',
    justifyContent: 'flex-end', 
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  wrapper: { 
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {  
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 2.4,

    marginBottom: 5,
  },
  description: {  
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '700',
    letterSpacing: 1.2,
    lineHeight: 30,
    marginBottom: 20,
  },
  socialLoginWrapper:{
    alignSelf: 'stretch',

  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray,
    padding: 10,
    borderRadius:25,
    gap: 5,
    marginBottom: 15,
  },
  btnTxt: {
    fontSize:14,
    fontWeight: '600',
    color: Colors.black,
    
  },
  loginTxt: {
    marginTop: 30,
    fontSize: 14,
    lineHeight: 24,
    color: Colors.black,
    
  },
  loginTxtSpan: {
    color: Colors.primary,
    fontWeight: '600',
  
  }
});
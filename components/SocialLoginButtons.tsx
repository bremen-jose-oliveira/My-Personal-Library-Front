import {  StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import {  Href, Link } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import GoogleLogo from '@/assets/images/google-icon.svg';

type Props = {
    emailHref: Href
};

const SocialLoginButtons = (props: Props) => {

    const { emailHref } = props;
  return (
    <View style={ styles.socialLoginWrapper}>
    <Animated.View style={styles.socialLoginWrapper} entering={FadeInDown.delay(300).duration(500)}>

  <Link href={emailHref} asChild>
    <TouchableOpacity style={styles.button}>
      <Ionicons name="mail-outline" size={20} color={Colors.black} />
      <Text style={styles.btnTxt}> Continue with Email </Text>
    </TouchableOpacity>
  </Link>
    </Animated.View>
    <Animated.View style={styles.socialLoginWrapper} entering={FadeInDown.delay(700).duration(500)}>
    <TouchableOpacity style={styles.button}>
    <GoogleLogo width={20} height={20} />
      <Text style={styles.btnTxt}> Continue with Google </Text>
    </TouchableOpacity>
    </Animated.View>
    <Animated.View style={styles.socialLoginWrapper} entering={FadeInDown.delay(1100).duration(500)}>
    <TouchableOpacity style={styles.button}>
      <Ionicons name="logo-apple" size={20} color={Colors.black} />
      <Text style={styles.btnTxt}> Continue with Apple </Text>
    </TouchableOpacity>
    </Animated.View>
  </View>
  )
}

export default SocialLoginButtons

const styles = StyleSheet.create({
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


})
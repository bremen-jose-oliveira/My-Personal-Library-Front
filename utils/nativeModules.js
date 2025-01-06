
import { Platform } from "react-native";

let Camera, AnotherNativeModule;

if (Platform.OS !== 'web') {
  Camera = require('expo-camera'); 
  AnotherNativeModule = require('another-native-module');
}

export { Camera, AnotherNativeModule };

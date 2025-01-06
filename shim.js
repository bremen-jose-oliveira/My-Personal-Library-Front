// shim.js
import { Platform } from 'react-native';

let Camera;
if (Platform.OS !== 'web') {
  Camera = require('expo-camera');
  // Make platform-specific imports here (e.g., react-native-web components)
  import('./app').then((App) => {
    // Do something with App, if needed
  });
}

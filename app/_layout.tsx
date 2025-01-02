// app/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';
import "../global.css";


export default function RootLayout() {


  return (

          <Stack>
            <Stack.Screen name='(tabs)' options={{headerShown:false}} />
            <Stack.Screen name="Login" options={{presentation:'modal'}} />
            <Stack.Screen name="Register" options={{presentation:'modal'}} />
          </Stack>
     

  );
}

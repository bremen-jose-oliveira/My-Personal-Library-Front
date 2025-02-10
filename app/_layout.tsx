// app/_layout.tsx

import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider } from '@/utils/Context/AuthContext';
import { BookProvider } from '@/utils/Context/BookContext';
import "../global.css";
import * as Linking from "expo-linking";



export default function Layout() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // Track if layout is mounted

  useEffect(() => {
    setIsMounted(true); // Mark layout as mounted

    const handleDeepLink = (event: { url: string }) => {
      if (!isMounted) return; // Ensure app is mounted before navigation

      const { path, queryParams } = Linking.parse(event.url);
      console.log("Deep link received:", path, queryParams);

      if (path === "reset-password" && queryParams?.token) {
        router.push(`/ResetPassword?token=${queryParams.token}`);
      }
    };

    // Subscribe to deep linking events
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle initial deep link when the app opens
    Linking.getInitialURL().then((url) => {
      if (url && isMounted) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove(); 
  }, [isMounted]); 


  return (
 <AuthProvider>
      <BookProvider>
          <Stack>
            <Stack.Screen name='(tabs)' options={{headerShown:false}} />
            <Stack.Screen name="Login/index" options={{presentation:'modal'}} />
            <Stack.Screen name="Register/index" options={{presentation:'modal'}} />
            <Stack.Screen name="ForgotPassword" options={{presentation:'modal'}} />
            <Stack.Screen name="ResetPassword" options={{presentation:'modal'}} />
          </Stack>
     
 </BookProvider>
    </AuthProvider>
  );
}

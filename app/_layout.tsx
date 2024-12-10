// app/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/utils/Context/AuthContext';
import { BookProvider } from '@/utils/Context/BookContext';
import "../global.css";



export default function Layout() {
  return (
    <AuthProvider>
      <BookProvider>
        <Stack>
       <Stack.Screen name='(tabs)' options={{headerShown:false}} />


        </Stack>
      </BookProvider>
    </AuthProvider>
  );
}
// app/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { BookProvider } from './Context/BookContext';


export default function Layout() {
  return (
    <BookProvider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="AddBookForm/index" options={{ title: 'Add Book' }} />
        <Tabs.Screen name="DisplayBooks/index" options={{ title: 'Books' }} />
      </Tabs>
    </BookProvider>
  );
}

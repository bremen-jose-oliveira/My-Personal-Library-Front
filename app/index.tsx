import AddBookForm from '@/components/AddBookForm';
import DisplayBooks from '@/components/DisplayBooks';
import React from 'react';
import { View, Text, ScrollView } from 'react-native';


export default function App() {
  return (
    <ScrollView className="flex-1 p-4 bg-gray-100">
      <View className="container mx-auto py-8">
        <Text className="text-3xl font-bold mb-6 text-center">Library App</Text>
        <AddBookForm />
        <DisplayBooks />
      </View>
    </ScrollView>
  );
}

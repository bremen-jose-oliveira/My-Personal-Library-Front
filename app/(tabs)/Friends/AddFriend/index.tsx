import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from 'expo-linear-gradient';

const AddFriend = () => {
  const { addFriend } = useFriendContext();
  const [friendEmail, setFriendEmail] = useState('');

  const handleAddFriend = async () => {
    if (!friendEmail) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }
  
    const payload = {
      friendEmail: friendEmail
    };
  
    console.log("Sending Friend Data:", payload); // Log to confirm correct structure
  
    try {
      await addFriend(payload); // Ensure addFriend is expecting an object with friendEmail
      Alert.alert("Success", "Friend added successfully!");
      setFriendEmail(''); // Clear input after success
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to add friend. Please try again.");
    }
  };
  

  return (
    <ImageBackground
      source={require("@/assets/images/Background.jpg")}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.8)']}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View style={{
          width: '90%',
          padding: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 8
        }}>
          <TextInput
            value={friendEmail}
            onChangeText={setFriendEmail}
            placeholder="Enter friend's email"
            style={{
              height: 40,
              borderColor: 'gray',
              borderWidth: 1,
              marginBottom: 20,
              paddingHorizontal: 10,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.4)'
            }}
          />
          <TouchableOpacity
            onPress={handleAddFriend}
            style={{
              backgroundColor: 'blue',
              padding: 10,
              borderRadius: 5,
              alignItems: 'center'
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 16
            }}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default AddFriend;

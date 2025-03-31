import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, Image, FlatList } from 'react-native';
import { useFriendContext } from "@/utils/Context/FriendContext";
import { LinearGradient } from 'expo-linear-gradient';
import { FetchAllUsers, FetchAllUsersBySearchParam } from '@/utils/Users';

const AddFriend = () => {
  const { addFriend } = useFriendContext();
  const [friendEmail, setFriendEmail] = useState('');
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  const handleAddFriendByEmail = async () => {
    if (!friendEmail) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }
  
    try {
      setIsAddingFriend(true); // Set loading state
      await addFriend(friendEmail);
      Alert.alert("Success", "Friend added successfully!");
      setFriendEmail('');
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to add friend. Please try again.");
    } finally {
      setIsAddingFriend(false); // Reset loading state
    }
  };


  // Add friend from the search results
  const handleAddFriendFromSearch = async (friend:any) => {

  
    try {
      setIsAddingFriend(true); // Set loading state
      await addFriend(friend.email );
      console.log("Payload to be sent:", JSON.stringify(friend.email));
      Alert.alert("Success", "Friend added successfully!");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Failed to add friend. Please try again.");
    } finally {
      setIsAddingFriend(false); // Reset loading state
    }
  };

  // Search for users by email or username
  useEffect(() => {
    const fetchFriends = async () => {
      if (!searchQuery) return;
      try {
        const users = await FetchAllUsersBySearchParam(searchQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    if (searchQuery.length > 2) {
      fetchFriends();
    }
  }, [searchQuery]);

  return (
    <ImageBackground
      source={require("@/assets/images/Background.jpg")}
      style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.8)']}
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}
      >

        {/* Search results display */}
      

        <View style={{
          flex: 1,
          width: '90%',
          padding: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: 8
        }}>
          {/* Email Input for adding a friend */}
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
            onPress={handleAddFriendByEmail}
            style={{
              backgroundColor: "#bf471b",
              padding: 10,
              marginBottom: 40,
              borderRadius: 5,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 16 }}>Add Friend by Email</Text>
          </TouchableOpacity>

          {/* Search Query Input */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by username or email"
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
            <FlatList
          data={searchResults}
          keyExtractor={(friend) => friend.id ? friend.id.toString() : Math.random().toString()}
          renderItem={({ item: friend }) => (
            <View
              style={{
                flexDirection: "row",
                marginTop: 3,
                padding: 1,
                borderRadius: 10,
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              {friend?.profilePicture ? (
                <Image
                  style={{ width: 100, height: 144 }}
                  source={{ uri: friend.profilePicture }}
                />
              ) : (
                <View style={{
                  width: 100,
                  height: 144,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                  backgroundColor: "#d1d5db",
                  borderRadius: 8,
                }}>
                  <Text style={{ color: "#f0dcc7", fontSize: 12, lineHeight: 16, textAlign: "center" }}>
                    No Image Available
                  </Text>
                </View>
              )}
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#f0dcc7" }}>Name: {friend?.username}</Text>
                <Text style={{ fontSize: 15, color: "#f0dcc7" }}>Email: {friend?.email}</Text>
                <TouchableOpacity
                  onPress={() => handleAddFriendFromSearch(friend)}
                  style={{
                    backgroundColor: "#bf471b",
                    padding: 10,
                    borderRadius: 5,
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16 }}>Add Friend</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
        />
        </View>
   
      </LinearGradient>
    </ImageBackground>
  );
};

export default AddFriend;

// context/FriendContext.tsx


import Friend from '@/app/Interfaces/friends';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { Platform } from 'react-native';

interface FriendContextProps {
  friends: Friend[];
  fetchCurrentUserFriends: () => void;
  addFriend: (friend: Omit<Friend, 'id'>) => Promise<void>;
  removeFriend: (id: number) => Promise<void>;
}

const FriendContext = createContext<FriendContextProps | undefined>(undefined);

export const FriendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchCurrentUserFriends = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is missing or expired');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friendships`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch friends: ${response.statusText}`);
      }

      const data = await response.json();
      const formattedData: Friend[] = data.map((friendship:any) => ({
        id: friendship.id,
        name: friendship.friendEmail, // Using friendEmail since name is missing
        email: friendship.friendEmail,
        profilePicture: '', 
        friendshipStatus: friendship.friendshipStatus,
      }));
      setFriends(formattedData);

    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const addFriend = async (friend: Omit<Friend, 'id'>) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is missing or expired');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friendships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`,   
        },
        body: JSON.stringify(friend),
      });

      if (response.ok) {
        fetchCurrentUserFriends();
      } else {
        const errorMessage = await response.text();
        console.error(`Failed to add friend: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const removeFriend = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token is missing or expired');
      }
  
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friendships/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        setFriends((prevFriends) => prevFriends.filter((friend) => friend.id !== id));
        Alert.alert("Success", "Friend removed successfully!");
      } else {
        const errorMessage = await response.text();
        console.error(`Failed to remove friend: ${errorMessage}`);
        Alert.alert("Error", "Failed to remove friend.");
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  

  if (Platform.OS === 'web') {
    useEffect(() => {
      fetchCurrentUserFriends();
    }, []);
  }

    return (
      <FriendContext.Provider value={{ friends ,fetchCurrentUserFriends, addFriend, removeFriend }}>
        {children}
      </FriendContext.Provider>
    );
};

export const useFriendContext = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error('useFriendContext must be used within a FriendProvider');
  }
  return context;
};

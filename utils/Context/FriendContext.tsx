// context/FriendContext.tsx


import Friend from '@/Interfaces/friends';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { Platform } from 'react-native';

interface FriendContextProps {
  friends: Friend[];
  friendRequests: Friend[]; // Assuming friend requests are also of type Friend
  fetchCurrentUserFriends: () => void;
  fetchFriendRequests: () => void;
  approveFriendRequest: (friendEmail: string) => Promise<void>;
  rejectFriendRequest: (friendEmail: string) => Promise<void>;
  addFriend: (friendEmail: string) => Promise<void>;
  removeFriend: (id: number) => Promise<void>;
}

const FriendContext = createContext<FriendContextProps | undefined>(undefined);

export const FriendProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);

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
        name: friendship.username,
        email: friendship.friendEmail,
        profilePicture: '', 
        friendshipStatus: friendship.friendshipStatus,
      }));
      
      // Remove duplicates based on email (since backend might return friendships in both directions)
      const uniqueFriends = formattedData.filter((friend, index, self) =>
        index === self.findIndex((f) => f.email === friend.email)
      );
      
      setFriends(uniqueFriends);

    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const addFriend = async (friendEmail: string) => {
  
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('Token is missing or expired');
    }
  
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friendships/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ friendEmail }) 
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to add friend: ${errorMessage}`);
    }
  
    fetchCurrentUserFriends();
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

  const fetchFriendRequests = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
        console.error("Token not found or expired");
        throw new Error("Authentication required");
    }

    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friendships/requests`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to fetch friend requests: ", errorText); // More detailed error
            throw new Error("Failed to fetch friend requests: " + errorText);
        }

        const data = await response.json();
        setFriendRequests(data);
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        throw error; // or handle it in a way that the UI can reflect
    }
};

// Approve a friend request
const approveFriendRequest = async (friendEmail:any) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friendships/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ friendEmail })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to approve friend request");
  }
  fetchFriendRequests(); // Refresh requests
};

// Reject a friend request
const rejectFriendRequest = async (friendEmail:any) => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/friendships/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ friendEmail })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to reject friend request");
  }
  fetchFriendRequests(); // Refresh requests
};

  

  if (Platform.OS === 'web') {
    useEffect(() => {
      fetchCurrentUserFriends();
    }, []);
  }

  return (
    <FriendContext.Provider value={{
      friends,
      friendRequests,
      fetchCurrentUserFriends,
      fetchFriendRequests,
      approveFriendRequest,
      rejectFriendRequest,
      addFriend,
      removeFriend
    }}>
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
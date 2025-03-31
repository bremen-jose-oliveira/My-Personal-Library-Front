

import AsyncStorage from '@react-native-async-storage/async-storage';


export const FetchAllUsers = async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            throw new Error('Token is missing or expired');
          }
    
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users`, {
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
            return data;
    
        } catch (error) {
          console.error('Error fetching friends:', error);
        }
      };


       export const FetchAllUsersBySearchParam = async (searchQuery = "") => {
        try {
            // Get the token from AsyncStorage
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token is missing or expired');
            }
    
            // Build the URL with the search query parameter
            const url = `${process.env.EXPO_PUBLIC_API_URL}/api/users/search?search=${encodeURIComponent(searchQuery)}`;
    
            // Make the GET request with the token in the Authorization header
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            
    
            // Handle response errors
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
    
            // Parse and return the response data
            const data = await response.json();
            return data;
    
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    




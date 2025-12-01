import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserSummary } from "@/Interfaces/user";

export const FetchAllUsers = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing or expired");
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch friends: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching friends:", error);
  }
};

export const FetchAllUsersBySearchParam = async (searchQuery = "") => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing or expired");
    }

    const url = `${process.env.EXPO_PUBLIC_API_URL}/api/users/search?search=${encodeURIComponent(
      searchQuery
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

export const FetchUserByEmail = async (email: string): Promise<UserSummary | null> => {
  if (!email) return null;

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing or expired");
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/users/search?search=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user by email: ${response.statusText}`);
    }

    const data: UserSummary[] = await response.json();
    return data.find((user) => user.email === email) ?? data[0] ?? null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
};

export const FetchUserById = async (id: number): Promise<UserSummary | null> => {
  if (!id) return null;

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing or expired");
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user by ID: ${response.statusText}`);
    }

    const data: UserSummary = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
};





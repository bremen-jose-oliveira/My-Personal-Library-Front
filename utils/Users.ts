import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserSummary } from "@/Interfaces/user";

export const FetchAllUsers = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing or expired");
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

    const url = `${
      process.env.EXPO_PUBLIC_API_URL
    }/api/users/search?search=${encodeURIComponent(searchQuery)}`;

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

export const FetchUserByEmail = async (
  email: string
): Promise<UserSummary | null> => {
  if (!email) {
    console.warn("⚠️ FetchUserByEmail called with empty email");
    return null;
  }

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("❌ Token is missing when fetching user");
      throw new Error("Token is missing or expired");
    }

    const url = `${
      process.env.EXPO_PUBLIC_API_URL
    }/api/users/search?search=${encodeURIComponent(email)}`;
    console.log("📤 Fetching user from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      "📥 User search response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to fetch user:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(
        `Failed to fetch user by email: ${response.status} ${response.statusText}`
      );
    }

    const data: UserSummary[] = await response.json();
    const user = data.find((user) => user.email === email) ?? data[0] ?? null;

    if (user) {
      console.log("✅ User found:", user.email);
    } else {
      console.warn("⚠️ No user found in search results");
    }

    return user;
  } catch (error: any) {
    console.error("❌ Error fetching user by email:", {
      email,
      error: error.message || error,
      stack: error.stack,
    });
    return null;
  }
};

export const FetchUserById = async (
  id: number
): Promise<UserSummary | null> => {
  if (!id) return null;

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing or expired");
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/users/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

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

// utils/Context/storageUtils.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";

/** Listeners called when token is removed (e.g. 401). AuthContext subscribes to sync isLoggedIn. */
const onTokenRemovedListeners: Array<() => void> = [];

export function onTokenRemoved(callback: () => void): () => void {
  onTokenRemovedListeners.push(callback);
  return () => {
    const i = onTokenRemovedListeners.indexOf(callback);
    if (i !== -1) onTokenRemovedListeners.splice(i, 1);
  };
}

function notifyTokenRemoved() {
  onTokenRemovedListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error("onTokenRemoved listener error:", e);
    }
  });
}

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    notifyTokenRemoved();
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

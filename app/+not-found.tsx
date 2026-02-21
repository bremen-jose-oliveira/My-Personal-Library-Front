import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

/**
 * Shown when the URL doesn't match any route (e.g. after a browser refresh if SPA routing didn't match).
 * Provides a way back to the app.
 */
export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.message}>
        If you got here after refreshing, use the button below to go home.
      </Text>
      <Link href="/">
        <Text style={styles.linkText}>Go to Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  linkText: {
    color: "#bf471b",
    fontWeight: "600",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

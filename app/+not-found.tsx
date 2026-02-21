import { Link, useRouter, usePathname } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useEffect, useRef } from "react";

// Routes that exist in the app but may not match on first load after refresh (web SPA)
const KNOWN_WEB_ROUTES = [
  "/Borrowed",
  "/Lending",
  "/Friends",
  "/Library",
  "/BrowseBooks",
  "/ReadingList",
  "/MyReviews",
  "/AccountSettings",
  "/Login",
  "/Register",
  "/BookDetails",
  "/Notifications",
  "/ForgotPassword",
  "/ResetPassword",
  "/Logout",
  "/FriendBooks",
  "/PrivacyPolicy",
];

function isKnownRoute(pathname: string | null): boolean {
  if (!pathname || pathname === "/") return false;
  return KNOWN_WEB_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Shown when the URL doesn't match any route (e.g. after a browser refresh).
 * On web, if the path looks like a known app route, redirect there so the tab/screen loads.
 */
export default function NotFoundScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const redirected = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web" || redirected.current) return;
    const path =
      typeof window !== "undefined" ? window.location.pathname : pathname;
    if (isKnownRoute(path)) {
      redirected.current = true;
      router.replace(path as any);
    }
  }, [pathname, router]);

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

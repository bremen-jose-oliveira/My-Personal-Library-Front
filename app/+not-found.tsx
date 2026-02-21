import { Link, useRouter, usePathname } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useEffect, useRef } from "react";

// Map lowercase path segments to the actual route casing (Expo Router is case-sensitive).
// After refresh, browser/server may send lowercase (e.g. /borrowed); we redirect to correct case (e.g. /Borrowed).
const SEGMENT_CASING: Record<string, string> = {
  borrowed: "Borrowed",
  lending: "Lending",
  friends: "Friends",
  friendlist: "FriendList",
  addfriend: "AddFriend",
  friendrequests: "FriendRequests",
  library: "Library",
  displaybooks: "DisplayBooks",
  addbookform: "AddBookForm",
  browsebooks: "BrowseBooks",
  readinglist: "ReadingList",
  myreviews: "MyReviews",
  accountsettings: "AccountSettings",
  login: "Login",
  register: "Register",
  bookdetails: "BookDetails",
  notifications: "Notifications",
  forgotpassword: "ForgotPassword",
  resetpassword: "ResetPassword",
  logout: "Logout",
  friendbooks: "FriendBooks",
  privacypolicy: "PrivacyPolicy",
};

function normalizePathToRoute(pathname: string): string {
  const segments = pathname.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  const firstLower = segments[0].toLowerCase();
  const normalized = segments
    .map((seg, i) => {
      // Keep dynamic segments as-is (e.g. BookDetails/123, FriendBooks/email@x.com)
      if (i === 1 && (firstLower === "bookdetails" || firstLower === "friendbooks"))
        return seg;
      return SEGMENT_CASING[seg.toLowerCase()] ?? seg;
    })
    .join("/");
  return "/" + normalized;
}

function isKnownRoute(pathname: string | null): boolean {
  if (!pathname || pathname === "/") return false;
  const lower = pathname.toLowerCase();
  const known = [
    "/borrowed", "/lending", "/friends", "/library", "/browsebooks",
    "/readinglist", "/myreviews", "/accountsettings", "/login", "/register",
    "/bookdetails", "/notifications", "/forgotpassword", "/resetpassword",
    "/logout", "/friendbooks", "/privacypolicy",
  ];
  return known.some((route) => lower === route || lower.startsWith(route + "/"));
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
      // Normalize casing: /borrowed -> /Borrowed, /friends/friendlist -> /Friends/FriendList
      const correctPath = normalizePathToRoute(path);
      router.replace(correctPath as any);
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

import "react-native-gesture-handler";
import "@/utils/i18n";
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "@/utils/Context/AuthContext";
import { BookProvider } from "@/utils/Context/BookContext";
import "../global.css";
import * as Linking from "expo-linking";
import { FriendProvider } from "@/utils/Context/FriendContext";
import { UserProvider } from "@/utils/Context/UserContext";
import { ExchangeProvider } from "@/utils/Context/ExchangeContext";
import { ReviewProvider } from "@/utils/Context/ReviewContext";
import { NotificationProvider } from "@/utils/Context/NotificationContext";

export default function Layout() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false); // Track if layout is mounted

  useEffect(() => {
    setIsMounted(true); // Mark layout as mounted

    const handleDeepLink = (event: { url: string }) => {
      if (!isMounted) return; // Ensure app is mounted before navigation

      const { path, queryParams } = Linking.parse(event.url);

      if (path === "reset-password" && queryParams?.token) {
        router.push(`/ResetPassword?token=${queryParams.token}`);
      }
    };

    // Subscribe to deep linking events
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Handle initial deep link when the app opens
    Linking.getInitialURL().then((url) => {
      if (url && isMounted) {
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, [isMounted]);

  return (
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <FriendProvider>
            <ExchangeProvider>
              <ReviewProvider>
                <BookProvider>
                  <Stack>
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false, headerTitle: `` }}
                    />
                    <Stack.Screen
                      name="Login/index"
                      options={{ presentation: "modal" }}
                    />
                    <Stack.Screen
                      name="Register/index"
                      options={{ presentation: "modal" }}
                    />
                    <Stack.Screen
                      name="ForgotPassword"
                      options={{ presentation: "modal" }}
                    />
                    <Stack.Screen
                      name="ResetPassword"
                      options={{ presentation: "modal" }}
                    />
                    <Stack.Screen
                      name="Logout"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="PrivacyPolicy"
                      options={{ headerTitle: t("privacy.title") }}
                    />
                    <Stack.Screen
                      name="BookDetails/[id]"
                      options={{ headerTitle: t("books.bookDetails") }}
                    />
                    <Stack.Screen
                      name="Notifications/index"
                      options={{ headerTitle: t("notifications.title") }}
                    />
                  </Stack>
                </BookProvider>
              </ReviewProvider>
            </ExchangeProvider>
          </FriendProvider>
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  );
}

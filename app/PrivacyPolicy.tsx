// app/PrivacyPolicy.tsx
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, Text, View, StyleSheet, Linking } from "react-native";

export default function PrivacyPolicy() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Privacy Policy",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>
            Last Updated: {new Date().toLocaleDateString()}
          </Text>

          <Text style={styles.heading}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            My Library ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our mobile application.
          </Text>

          <Text style={styles.heading}>2. Information We Collect</Text>
          <Text style={styles.subHeading}>2.1 Personal Information</Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us, including:
          </Text>
          <Text style={styles.bulletPoint}>
            • Account information (email address, username)
          </Text>
          <Text style={styles.bulletPoint}>
            • Book collection data (books you add, reading status, reviews)
          </Text>
          <Text style={styles.bulletPoint}>
            • Social features (friends, exchanges, notifications)
          </Text>

          <Text style={styles.subHeading}>2.2 Authentication Data</Text>
          <Text style={styles.paragraph}>
            We use OAuth authentication providers (Google, Apple) to verify your
            identity. We do not store your passwords. Authentication tokens are
            securely stored on your device.
          </Text>

          <Text style={styles.subHeading}>2.3 Usage Data</Text>
          <Text style={styles.paragraph}>
            We may collect information about how you access and use the app,
            including device information, IP address, and usage patterns.
          </Text>

          <Text style={styles.heading}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>
            • Provide, maintain, and improve our services
          </Text>
          <Text style={styles.bulletPoint}>
            • Process and manage your book collection
          </Text>
          <Text style={styles.bulletPoint}>
            • Enable social features (friends, exchanges, reviews)
          </Text>
          <Text style={styles.bulletPoint}>
            • Send you notifications and updates
          </Text>
          <Text style={styles.bulletPoint}>
            • Respond to your inquiries and provide support
          </Text>

          <Text style={styles.heading}>4. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your
            information only in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>
            • With your consent or at your direction
          </Text>
          <Text style={styles.bulletPoint}>
            • To comply with legal obligations
          </Text>
          <Text style={styles.bulletPoint}>
            • To protect our rights and safety
          </Text>
          <Text style={styles.paragraph}>
            Book information you choose to share (reviews, public collections)
            may be visible to other users of the app.
          </Text>

          <Text style={styles.heading}>5. Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to
            protect your personal information. However, no method of
            transmission over the internet or electronic storage is 100% secure.
          </Text>
          <Text style={styles.paragraph}>
            Your data is stored on secure servers and is encrypted in transit
            using HTTPS.
          </Text>

          <Text style={styles.heading}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as your account is
            active or as needed to provide you services. You may delete your
            account at any time through the Account Settings, which will
            permanently remove your data.
          </Text>

          <Text style={styles.heading}>7. Your Rights</Text>
          <Text style={styles.paragraph}>You have the right to:</Text>
          <Text style={styles.bulletPoint}>
            • Access your personal information
          </Text>
          <Text style={styles.bulletPoint}>
            • Correct inaccurate information
          </Text>
          <Text style={styles.bulletPoint}>• Delete your account and data</Text>
          <Text style={styles.bulletPoint}>
            • Opt out of certain data collection
          </Text>
          <Text style={styles.paragraph}>
            To exercise these rights, please contact us using the information
            provided below.
          </Text>

          <Text style={styles.heading}>8. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our app uses third-party services that may collect information:
          </Text>
          <Text style={styles.bulletPoint}>
            • Google Books API (for book information and covers)
          </Text>
          <Text style={styles.bulletPoint}>
            • Google OAuth (for authentication)
          </Text>
          <Text style={styles.bulletPoint}>
            • Apple Sign In (for authentication)
          </Text>
          <Text style={styles.paragraph}>
            These services have their own privacy policies. We encourage you to
            review them.
          </Text>

          <Text style={styles.heading}>9. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our app is not intended for children under 13 years of age. We do
            not knowingly collect personal information from children under 13.
          </Text>

          <Text style={styles.heading}>10. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date.
          </Text>

          <Text style={styles.heading}>11. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("mailto:support@example.com")}
          >
            support@example.com
          </Text>
          <Text style={styles.paragraph}>
            Please replace "support@example.com" with your actual support email
            address.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginTop: 24,
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: "#bf471b",
    textDecorationLine: "underline",
    marginBottom: 12,
  },
});

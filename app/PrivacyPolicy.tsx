import { Stack } from "expo-router";
import React from "react";
import { ScrollView, Text, View, StyleSheet, Linking } from "react-native";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("privacy.title"),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.title}>{t("privacy.title")}</Text>
          <Text style={styles.lastUpdated}>
            {t("privacy.lastUpdated", {
              date: new Date().toLocaleDateString(i18n.language, { dateStyle: "long" }),
            })}
          </Text>

          <Text style={styles.heading}>{t("privacy.h1")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p1")}</Text>

          <Text style={styles.heading}>{t("privacy.h2")}</Text>
          <Text style={styles.subHeading}>{t("privacy.s2_1")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p2_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b2_1_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b2_1_2")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b2_1_3")}</Text>

          <Text style={styles.subHeading}>{t("privacy.s2_2")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p2_2")}</Text>

          <Text style={styles.subHeading}>{t("privacy.s2_3")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p2_3")}</Text>

          <Text style={styles.heading}>{t("privacy.h3")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p3_intro")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b3_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b3_2")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b3_3")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b3_4")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b3_5")}</Text>

          <Text style={styles.heading}>{t("privacy.h4")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p4_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b4_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b4_2")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b4_3")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p4_2")}</Text>

          <Text style={styles.heading}>{t("privacy.h5")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p5_1")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p5_2")}</Text>

          <Text style={styles.heading}>{t("privacy.h6")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p6")}</Text>

          <Text style={styles.heading}>{t("privacy.h7")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p7_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b7_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b7_2")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b7_3")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b7_4")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p7_2")}</Text>

          <Text style={styles.heading}>{t("privacy.h8")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p8_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b8_1")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b8_2")}</Text>
          <Text style={styles.bulletPoint}>{t("privacy.b8_3")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p8_2")}</Text>

          <Text style={styles.heading}>{t("privacy.h9")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p9")}</Text>

          <Text style={styles.heading}>{t("privacy.h10")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p10")}</Text>

          <Text style={styles.heading}>{t("privacy.h11")}</Text>
          <Text style={styles.paragraph}>{t("privacy.p11")}</Text>
          <Text
            style={styles.link}
            onPress={() => Linking.openURL("mailto:my.personal.lib@proton.me")}
          >
            my.personal.lib@proton.me
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

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";

import en from "@/locales/en.json";
import ptPT from "@/locales/pt-PT.json";
import de from "@/locales/de.json";

const resources = {
  en: { translation: en },
  "pt-PT": { translation: ptPT },
  pt: { translation: ptPT },
  de: { translation: de },
};

// Map device locale to our resource keys (languageTag e.g. "en-US", "pt-PT", "de-DE")
const localeTag =
  (typeof getLocales === "function" && getLocales()?.[0]?.languageTag) || "";
const languageCode =
  localeTag.startsWith("pt") ? "pt-PT" : localeTag.startsWith("de") ? "de" : localeTag.startsWith("en") ? "en" : "en";
const lng = languageCode in resources ? languageCode : "en";

i18n.use(initReactI18next).init({
  resources,
  lng,
  fallbackLng: "en",
  supportedLngs: ["en", "pt-PT", "pt", "de"],
  compatibilityJSON: "v4",
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;

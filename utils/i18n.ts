import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en.json";
import ptPT from "@/locales/pt-PT.json";
import de from "@/locales/de.json";

const resources = {
  en: { translation: en },
  "pt-PT": { translation: ptPT },
  pt: { translation: ptPT },
  de: { translation: de },
};

// Device locale when expo-localization native module is available (e.g. EAS build).
// Falls back to "en" when module is missing (e.g. old local dev client).
function getDeviceLanguageTag(): string {
  try {
    const { getLocales } = require("expo-localization");
    const tag = getLocales?.()?.[0]?.languageTag ?? "";
    return tag;
  } catch {
    return "";
  }
}

const localeTag = getDeviceLanguageTag();
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

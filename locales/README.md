# Localization (i18n)

This app uses **expo-localization** + **i18next** / **react-i18next** for translations.

## Setup

- **Config:** `utils/i18n.ts` initializes i18n and uses the device locale from `expo-localization`.
- **Strings:** Add or edit JSON files in `locales/` (e.g. `en.json`, `es.json`).
- **Plugin:** `app.config.js` includes the `expo-localization` plugin with `supportedLocales`.

## Using translations in components

```tsx
import { useTranslation } from "react-i18next";

function MyScreen() {
  const { t } = useTranslation();
  return (
    <Text>{t("common.cancel")}</Text>
    <Text>{t("books.addBook")}</Text>
  );
}
```

## Adding a new language

1. Add `locales/<code>.json` (e.g. `locales/es.json`) with the same key structure as `en.json`.
2. In `utils/i18n.ts`, import the new file and add it to `resources`:
   ```ts
   import es from "@/locales/es.json";
   const resources = { en: { translation: en }, es: { translation: es } };
   ```
3. In `app.config.js`, add the locale to the plugin: `supportedLocales: ["en", "es"]`.

## Changing language at runtime

```tsx
import { useTranslation } from "react-i18next";

const { i18n } = useTranslation();
i18n.changeLanguage("es");
```

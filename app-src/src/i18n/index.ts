// i18n bootstrap. Import this once, high in the tree (app/_layout.tsx).
// Every user facing string lives in en.json and is read via t('key.path').
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';

export const defaultNS = 'translation';

export const resources = {
  en: { translation: en },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS,
    // Sam's copy already contains any needed punctuation. Keep keys literal.
    keySeparator: '.',
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });
}

export default i18n;

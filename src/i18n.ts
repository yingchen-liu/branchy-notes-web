import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Optional, for auto-detecting user language
import en from './languages/en';
import zhCn from './languages/zh-cn';
import zhTw from './languages/zh-tw';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // Default language
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    keySeparator: '.',
    debug: true,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      'en': {
        translation: en,
      },
      'zh-CN': {
        translation: zhCn,
      },
      'zh-TW': {
        translation: zhTw,
      },
      'zh-HK': {
        translation: zhTw,
      }
    },
  });

export default i18n;

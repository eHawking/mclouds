import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import en from '../locales/en.json'
import bn from '../locales/bn.json'
import es from '../locales/es.json'
import fr from '../locales/fr.json'
import ar from '../locales/ar.json'
import hi from '../locales/hi.json'
import zh from '../locales/zh.json'
import pt from '../locales/pt.json'
import ru from '../locales/ru.json'
import de from '../locales/de.json'

const resources = {
  en: { translation: en },
  bn: { translation: bn },
  es: { translation: es },
  fr: { translation: fr },
  ar: { translation: ar },
  hi: { translation: hi },
  zh: { translation: zh },
  pt: { translation: pt },
  ru: { translation: ru },
  de: { translation: de }
}

// Language metadata with flags and names
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

// Expose i18next globally for integration with zustand store
window.i18next = i18n

// Clear old language settings to default to English
// This ensures the site shows English on first load
const clearOldLanguageSettings = () => {
  // Clear the old zustand language store
  localStorage.removeItem('magnetic-language')
  
  // Clear Google Translate cookies if set to non-English
  const googtrans = document.cookie.split(';').find(c => c.trim().startsWith('googtrans='))
  if (googtrans && !googtrans.includes('/en/en')) {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
  }
}

// Run once on load
clearOldLanguageSettings()

export default i18n

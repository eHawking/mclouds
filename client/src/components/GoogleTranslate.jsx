import { useEffect, useState, useRef } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import clsx from 'clsx'

// Language options with flags
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
]

// Helper to get/set cookie
const setCookie = (name, value, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift())
  return null
}

// Get current language from Google Translate cookie
const getCurrentGoogleLang = () => {
  const cookie = getCookie('googtrans')
  if (cookie) {
    const parts = cookie.split('/')
    return parts[parts.length - 1] || 'en'
  }
  return 'en'
}

export default function GoogleTranslate({ variant = 'default' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(() => getCurrentGoogleLang())
  const [isLoaded, setIsLoaded] = useState(false)
  const dropdownRef = useRef(null)
  const initialized = useRef(false)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Check current language from cookie
    const savedLang = getCurrentGoogleLang()
    setCurrentLang(savedLang)

    // Add Google Translate script if not exists
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script')
      script.id = 'google-translate-script'
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: languages.map(l => l.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true
          },
          'google_translate_element'
        )
        setIsLoaded(true)
      }
    }

    // If script already loaded, try to init
    if (window.google?.translate?.TranslateElement) {
      setIsLoaded(true)
    }
  }, [])

  // Function to change language programmatically
  const changeLanguage = (langCode) => {
    setCurrentLang(langCode)
    setIsOpen(false)

    // Clear existing googtrans cookies
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`

    // Set new cookie for Google Translate
    const cookieValue = `/en/${langCode}`
    setCookie('googtrans', cookieValue)
    document.cookie = `googtrans=${cookieValue}; path=/`
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`
    
    // For subdomains
    const hostParts = window.location.hostname.split('.')
    if (hostParts.length >= 2) {
      const rootDomain = hostParts.slice(-2).join('.')
      document.cookie = `googtrans=${cookieValue}; path=/; domain=.${rootDomain}`
    }

    // Try to trigger translation via the Google Translate select element
    const selectElement = document.querySelector('.goog-te-combo')
    if (selectElement) {
      selectElement.value = langCode
      
      // Create and dispatch change event
      const event = new Event('change', { bubbles: true, cancelable: true })
      selectElement.dispatchEvent(event)
      
      // Also try triggering via the native setter
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(selectElement, langCode)
        selectElement.dispatchEvent(new Event('change', { bubbles: true }))
      }
      
      // Small delay then check if translation applied
      setTimeout(() => {
        const currentCookie = getCookie('googtrans')
        if (!currentCookie || !currentCookie.includes(langCode)) {
          // Translation didn't apply, reload
          window.location.reload()
        }
      }, 500)
    } else {
      // Fallback: reload with cookie set
      window.location.reload()
    }
  }

  // Get current language info
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  if (variant === 'minimal') {
    return (
      <div className="relative">
        {/* Hidden Google Translate Element */}
        <div id="google_translate_element" className="hidden" />
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-800 rounded-xl shadow-2xl border border-dark-100 dark:border-dark-700 overflow-hidden z-[9999]">
            <div className="py-2 max-h-80 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-left",
                    currentLang === lang.code && "bg-primary-50 dark:bg-primary-900/20"
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" className="hidden" />
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500/10 to-indigo-500/10 dark:from-primary-500/20 dark:to-indigo-500/20 border border-primary-500/20 hover:border-primary-500/40 rounded-xl transition-all"
      >
        <Globe className="w-4 h-4 text-primary-500" />
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-dark-100 dark:border-dark-700 overflow-hidden z-[9999]">
            <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Select Language
              </h3>
              <p className="text-xs text-white/70 mt-0.5">Powered by Google Translate</p>
            </div>
            <div className="py-2 max-h-72 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-left",
                    currentLang === lang.code && "bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500"
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

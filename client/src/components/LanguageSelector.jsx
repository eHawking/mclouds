import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { languages } from '../lib/i18n'
import clsx from 'clsx'

export default function LanguageSelector({ variant = 'default' }) {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsOpen(false)
    
    // Handle RTL for Arabic
    const selectedLang = languages.find(l => l.code === langCode)
    if (selectedLang?.rtl) {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }

  if (variant === 'minimal') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-dark-100 dark:border-dark-700 overflow-hidden z-50"
            >
              <div className="py-2 max-h-80 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors",
                      i18n.language === lang.code && "bg-primary-50 dark:bg-primary-900/20"
                    )}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{lang.nativeName}</p>
                      <p className="text-xs text-dark-500">{lang.name}</p>
                    </div>
                    {i18n.language === lang.code && (
                      <Check className="w-4 h-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 rounded-xl transition-colors"
      >
        <Globe className="w-4 h-4 text-primary-500" />
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown className={clsx("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-dark-100 dark:border-dark-700 overflow-hidden z-50"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('common.language')}
              </h3>
            </div>
            <div className="py-2 max-h-80 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors",
                    i18n.language === lang.code && "bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500"
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{lang.nativeName}</p>
                    <p className="text-xs text-dark-500">{lang.name}</p>
                  </div>
                  {i18n.language === lang.code && (
                    <Check className="w-5 h-5 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

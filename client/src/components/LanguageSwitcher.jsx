import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe, Check } from 'lucide-react'
import { useLanguageStore } from '../store/useStore'
import clsx from 'clsx'

export default function LanguageSwitcher({ variant = 'default', className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { language, languages, setLanguage, t, getCurrentLanguage } = useLanguageStore()
  const currentLang = getCurrentLanguage()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (langCode) => {
    setLanguage(langCode)
    setIsOpen(false)
  }

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 transition-all",
          variant === 'header' && "px-3 py-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800",
          variant === 'compact' && "p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800",
          variant === 'default' && "px-4 py-2 rounded-xl border border-dark-200 dark:border-dark-700 hover:border-primary-500"
        )}
      >
        <span className="text-xl">{currentLang.flag}</span>
        {variant !== 'compact' && (
          <>
            <span className="text-sm font-medium">{currentLang.name}</span>
            <ChevronDown className={clsx(
              "w-4 h-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              "absolute top-full mt-2 z-50 py-2 rounded-xl shadow-2xl border overflow-hidden",
              "bg-white dark:bg-dark-800 border-dark-200 dark:border-dark-700",
              language === 'ar' ? "left-0" : "right-0",
              "min-w-[180px]"
            )}
          >
            <div className="px-3 py-2 border-b border-dark-100 dark:border-dark-700">
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <Globe className="w-3 h-3" />
                {t('common.language')}
              </div>
            </div>
            {Object.values(languages).map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-all",
                  language === lang.code
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                    : "hover:bg-dark-50 dark:hover:bg-dark-700/50"
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="font-medium">{lang.name}</p>
                  <p className="text-xs text-dark-400">{lang.code.toUpperCase()}</p>
                </div>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-primary-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

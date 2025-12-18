import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2, XCircle, Ban, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const DIALOG_TYPES = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    iconColor: 'text-white',
    buttonClass: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/25',
    borderColor: 'border-red-500/30',
    glowColor: 'shadow-red-500/20'
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    iconColor: 'text-white',
    buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25',
    borderColor: 'border-amber-500/30',
    glowColor: 'shadow-amber-500/20'
  },
  success: {
    icon: CheckCircle,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    iconColor: 'text-white',
    buttonClass: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25',
    borderColor: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20'
  }
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false,
  icon: CustomIcon
}) {
  if (!isOpen) return null

  const config = DIALOG_TYPES[type] || DIALOG_TYPES.danger
  const IconComponent = CustomIcon || config.icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className={clsx(
            "relative w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl overflow-hidden",
            "shadow-2xl",
            config.glowColor
          )}
        >
          {/* Gradient top border */}
          <div className={clsx("h-1", config.buttonClass.split(' ')[0])} />

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  config.iconBg,
                  "shadow-xl"
                )}
              >
                <IconComponent className={clsx("w-8 h-8", config.iconColor)} />
              </motion.div>
            </div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xl font-bold text-center text-dark-900 dark:text-white mb-2"
            >
              {title}
            </motion.h3>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center text-dark-500 dark:text-dark-400 mb-6"
            >
              {message}
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3"
            >
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl font-medium bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-200 hover:bg-dark-200 dark:hover:bg-dark-600 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={clsx(
                  "flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                  config.buttonClass,
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </motion.div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            <X className="w-5 h-5 text-dark-400" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

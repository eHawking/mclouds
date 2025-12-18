import toast from 'react-hot-toast'

// Premium toast notifications with enhanced styling
export const premiumToast = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      icon: '✨',
      style: {
        background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.98) 0%, rgba(20, 83, 45, 0.98) 100%)',
        color: '#dcfce7',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(34, 197, 94, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
      icon: '⚠️',
      style: {
        background: 'linear-gradient(135deg, rgba(69, 10, 10, 0.98) 0%, rgba(127, 29, 29, 0.98) 100%)',
        color: '#fecaca',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(239, 68, 68, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  info: (message, options = {}) => {
    return toast(message, {
      ...options,
      icon: '💡',
      style: {
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.98) 0%, rgba(37, 99, 235, 0.98) 100%)',
        color: '#dbeafe',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(59, 130, 246, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  warning: (message, options = {}) => {
    return toast(message, {
      ...options,
      icon: '🔔',
      style: {
        background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.98) 0%, rgba(180, 83, 9, 0.98) 100%)',
        color: '#fef3c7',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(245, 158, 11, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
      style: {
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.98) 100%)',
        color: '#e2e8f0',
        border: '1px solid rgba(147, 51, 234, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(147, 51, 234, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  cart: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      icon: '🛒',
      style: {
        background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.98) 0%, rgba(147, 51, 234, 0.98) 100%)',
        color: '#f3e8ff',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(168, 85, 247, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  order: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      icon: '📦',
      style: {
        background: 'linear-gradient(135deg, rgba(21, 94, 117, 0.98) 0%, rgba(6, 182, 212, 0.98) 100%)',
        color: '#cffafe',
        border: '1px solid rgba(34, 211, 238, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(34, 211, 238, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  payment: (message, options = {}) => {
    return toast.success(message, {
      ...options,
      icon: '💳',
      style: {
        background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.98) 0%, rgba(20, 83, 45, 0.98) 100%)',
        color: '#dcfce7',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(34, 197, 94, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
    })
  },

  // Promise-based toast for async operations
  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, messages, {
      ...options,
      style: {
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
        color: '#f9fafb',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        ...options.style,
      },
      success: {
        style: {
          background: 'linear-gradient(135deg, rgba(5, 46, 22, 0.98) 0%, rgba(20, 83, 45, 0.98) 100%)',
          color: '#dcfce7',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(34, 197, 94, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        },
      },
      error: {
        style: {
          background: 'linear-gradient(135deg, rgba(69, 10, 10, 0.98) 0%, rgba(127, 29, 29, 0.98) 100%)',
          color: '#fecaca',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(239, 68, 68, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        },
      },
    })
  },

  // Dismiss a specific toast or all toasts
  dismiss: (toastId) => toast.dismiss(toastId),
  dismissAll: () => toast.dismiss(),
}

export default premiumToast

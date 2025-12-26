import { motion } from 'framer-motion'

/**
 * Toggle Switch component - Premium styled toggle switch
 * @param {boolean} checked - Whether the switch is on
 * @param {function} onChange - Callback when switch is toggled
 * @param {string} label - Optional label text
 * @param {string} description - Optional description text
 * @param {boolean} disabled - Whether the switch is disabled
 * @param {string} size - Size of switch: 'sm', 'md', 'lg'
 * @param {string} className - Additional CSS classes
 */
export default function Switch({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    size = 'md',
    className = ''
}) {
    const sizes = {
        sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
        md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'translate-x-5' },
        lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' }
    }

    const s = sizes[size] || sizes.md

    const handleClick = () => {
        if (!disabled && onChange) {
            onChange(!checked)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handleClick()
        }
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                className={`
          relative inline-flex items-center shrink-0 rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          ${s.track}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${checked
                        ? 'bg-primary-500'
                        : 'bg-dark-300 dark:bg-dark-600'
                    }
        `}
            >
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`
            inline-block rounded-full bg-white shadow-lg
            ${s.thumb}
            ${checked ? s.translate : 'translate-x-0.5'}
          `}
                />
            </button>
            {(label || description) && (
                <div
                    className={`flex flex-col ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
                    onClick={handleClick}
                >
                    {label && (
                        <span className="text-sm font-medium text-dark-900 dark:text-white">
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-dark-500">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

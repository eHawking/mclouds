import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { authAPI } from '../../lib/api'
import { useThemeStore } from '../../store/useStore'
import clsx from 'clsx'

export default function ForgotPassword() {
  const { themeStyle } = useThemeStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const isGradient = themeStyle === 'gradient'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (err) {
      // Still show success to prevent email enumeration
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Reset Password - Magnetic Clouds</title>
      </Helmet>

      <div className={clsx(
        "min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4",
        isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-950"
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl",
                isGradient 
                  ? "bg-gradient-to-br from-primary-500 to-secondary-500" 
                  : "bg-primary-500"
              )}>
                MC
              </div>
            </Link>
            <h1 className="text-3xl font-bold font-display">Reset Password</h1>
            <p className="mt-2 text-dark-500">
              {sent 
                ? 'Check your email for reset instructions' 
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          <div className="glass-card p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Email Sent!</h2>
                <p className="text-dark-500 mb-6">
                  If an account exists with {email}, you will receive a password reset link shortly.
                </p>
                <Link to="/login" className="btn-primary w-full justify-center">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input pl-12"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send Reset Link
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-dark-500 hover:text-primary-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

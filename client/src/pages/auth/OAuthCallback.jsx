import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '../../store/useStore'
import { authAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [status, setStatus] = useState('Completing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        const errorMessage = decodeURIComponent(error)
        toast.error(`Authentication failed: ${errorMessage}`)
        navigate('/login')
        return
      }

      if (token) {
        try {
          setStatus('Saving your session...')
          // Store the token
          localStorage.setItem('token', token)
          
          setStatus('Loading your profile...')
          // Fetch user data
          const response = await authAPI.me()
          setUser(response.data.user, token)
          
          toast.success('Welcome! Login successful.')
          
          setStatus('Redirecting to your dashboard...')
          
          // Small delay to show the success message
          setTimeout(() => {
            // Redirect based on role
            if (response.data.user.role === 'admin') {
              navigate('/admin', { replace: true })
            } else {
              navigate('/dashboard', { replace: true })
            }
          }, 500)
        } catch (err) {
          console.error('OAuth callback error:', err)
          toast.error('Failed to complete authentication. Please try again.')
          localStorage.removeItem('token')
          navigate('/login')
        }
      } else {
        toast.error('No authentication token received')
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate, setUser])

  return (
    <div className={clsx(
      "min-h-screen flex items-center justify-center",
      isDark ? "bg-dark-950" : "bg-gray-50"
    )}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className={clsx("text-lg", isDark ? "text-dark-300" : "text-dark-600")}>{status}</p>
      </div>
    </div>
  )
}

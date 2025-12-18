import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './lib/i18n'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster 
            position="bottom-center"
            gutter={8}
            containerStyle={{
              bottom: 40,
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.98) 0%, rgba(25, 25, 35, 0.98) 100%)',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '400px',
                boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              },
              success: {
                duration: 3000,
                style: {
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%), linear-gradient(135deg, rgba(15, 15, 20, 0.98) 0%, rgba(25, 25, 35, 0.98) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(16, 185, 129, 0.25)',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                duration: 3000,
                style: {
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%), linear-gradient(135deg, rgba(15, 15, 20, 0.98) 0%, rgba(25, 25, 35, 0.98) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(239, 68, 68, 0.25)',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
              loading: {
                style: {
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%), linear-gradient(135deg, rgba(15, 15, 20, 0.98) 0%, rgba(25, 25, 35, 0.98) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(139, 92, 246, 0.25)',
                },
                iconTheme: {
                  primary: '#8b5cf6',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
)

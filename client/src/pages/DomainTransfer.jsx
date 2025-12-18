import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, CheckCircle, Shield, Clock, Zap, Search, ArrowRightLeft } from 'lucide-react'
import { useThemeStore } from '../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const benefits = [
  { icon: Shield, title: 'Free Privacy Protection', desc: 'WHOIS privacy included free with every transfer' },
  { icon: Clock, title: 'Extended Registration', desc: 'Get an extra year added to your domain' },
  { icon: Zap, title: 'Fast Transfer', desc: 'Most transfers complete within 5-7 days' },
  { icon: CheckCircle, title: 'No Downtime', desc: 'Your website stays online during transfer' },
]

const steps = [
  { step: '1', title: 'Unlock Domain', desc: 'Unlock your domain at your current registrar' },
  { step: '2', title: 'Get Auth Code', desc: 'Request the authorization/EPP code' },
  { step: '3', title: 'Start Transfer', desc: 'Enter your domain and auth code below' },
  { step: '4', title: 'Confirm Transfer', desc: 'Approve the transfer via email' },
]

export default function DomainTransfer() {
  const [domain, setDomain] = useState('')
  const [authCode, setAuthCode] = useState('')
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const handleTransfer = (e) => {
    e.preventDefault()
    if (!domain || !authCode) {
      toast.error('Please enter domain and auth code')
      return
    }
    toast.success('Transfer initiated! Check your email to confirm.')
  }

  return (
    <>
      <Helmet>
        <title>Domain Transfer - Move Your Domain | Magnetic Clouds</title>
        <meta name="description" content="Transfer your domain to Magnetic Clouds. Free privacy protection, extended registration, and no downtime." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-primary-950/20 to-dark-950" : "bg-gradient-to-b from-primary-50 via-white to-blue-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-blue-500 text-white mb-8 shadow-2xl shadow-primary-500/30">
            <ArrowRightLeft className="w-10 h-10" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}>
            Transfer Your{' '}<span className="bg-gradient-to-r from-primary-500 to-blue-500 bg-clip-text text-transparent">Domain</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}>
            Move your domain to Magnetic Clouds and get free privacy protection plus an extra year of registration.
          </motion.p>
        </div>
      </section>

      {/* Transfer Form */}
      <section className={clsx("py-16", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("rounded-3xl p-8 border", isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-200 shadow-xl")}>
            <h2 className={clsx("text-2xl font-bold mb-6 text-center", isDark ? "text-white" : "text-dark-900")}>Start Your Transfer</h2>
            <form onSubmit={handleTransfer} className="space-y-6">
              <div>
                <label className={clsx("block text-sm font-medium mb-2", isDark ? "text-dark-300" : "text-dark-700")}>Domain Name</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className={clsx("w-full pl-12 pr-4 py-4 rounded-xl border focus:ring-2 focus:ring-primary-500 transition-all", isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-white border-gray-300")}
                  />
                </div>
              </div>
              <div>
                <label className={clsx("block text-sm font-medium mb-2", isDark ? "text-dark-300" : "text-dark-700")}>Authorization Code (EPP)</label>
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Enter your auth code"
                  className={clsx("w-full px-4 py-4 rounded-xl border focus:ring-2 focus:ring-primary-500 transition-all", isDark ? "bg-dark-700 border-dark-600 text-white" : "bg-white border-gray-300")}
                />
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                Transfer Domain <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className={clsx("py-16", isDark ? "bg-dark-950" : "bg-gray-50")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display">Why Transfer to <span className="text-gradient">Us</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className={clsx("p-6 rounded-2xl text-center", isDark ? "bg-dark-800" : "bg-white shadow-lg")}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 text-white mb-4">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className={clsx("font-bold", isDark ? "text-white" : "text-dark-900")}>{benefit.title}</h3>
                <p className={clsx("mt-2 text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className={clsx("py-16", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display">How to <span className="text-gradient">Transfer</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="text-center">
                <div className={clsx("inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4", isDark ? "bg-primary-500/20 text-primary-400" : "bg-primary-100 text-primary-600")}>
                  {step.step}
                </div>
                <h3 className={clsx("font-bold", isDark ? "text-white" : "text-dark-900")}>{step.title}</h3>
                <p className={clsx("mt-2 text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Need Help with Your Transfer?</h2>
          <p className="mt-4 text-lg text-white/80">Our support team is here to assist you 24/7.</p>
          <div className="mt-8">
            <Link to="/support" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Contact Support <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

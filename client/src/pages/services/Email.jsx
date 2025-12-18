import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Shield, Clock, Smartphone, Send } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const emailPlans = [
  {
    name: 'Starter Email',
    price: 1.99,
    storage: '5 GB',
    accounts: 5,
    features: ['5 Email Accounts', '5 GB Storage/Account', 'Spam & Virus Protection', 'Webmail Access', 'Mobile Apps', 'Email Forwarding'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Business Email',
    price: 4.99,
    storage: '25 GB',
    accounts: 25,
    popular: true,
    features: ['25 Email Accounts', '25 GB Storage/Account', 'Advanced Spam Filter', 'Calendar & Contacts', 'Priority Support', 'Custom Signatures', 'Auto-responders'],
    color: 'from-primary-500 to-purple-500'
  },
  {
    name: 'Enterprise Email',
    price: 9.99,
    storage: '100 GB',
    accounts: 'Unlimited',
    features: ['Unlimited Accounts', '100 GB Storage/Account', 'AI Spam Protection', 'Team Collaboration', 'Admin Console', 'SSO Integration', 'Email Archiving', 'SLA Guarantee'],
    color: 'from-purple-500 to-pink-500'
  }
]

export default function Email() {
  const { format } = useCurrencyStore()
  const { themeStyle } = useThemeStore()
  const { addItem } = useCartStore()
  const isGradient = themeStyle === 'gradient'

  const handleAddToCart = (plan) => {
    addItem({
      id: `email-${plan.name.toLowerCase().replace(/\s/g, '-')}`,
      type: 'product',
      name: plan.name,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'email'
    })
    toast.success(`${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet><title>Professional Email - Magnetic Clouds</title></Helmet>
      
      <section className={clsx("py-20", isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-950")}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-6">
            <Mail className="w-4 h-4" /> Business Email
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-display">
            Professional <span className={isGradient ? "text-gradient" : "text-primary-500"}>Email</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
            Build trust with professional email addresses using your own domain. Secure, reliable, and feature-rich.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {emailPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={clsx(
                  "relative p-8 rounded-2xl border-2 transition-all hover:shadow-xl",
                  plan.popular
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
                    : "border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-dark-900 dark:text-white">{format(plan.price)}</span>
                  <span className="text-dark-500">/user/mo</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAddToCart(plan)}
                  className={clsx(
                    "w-full mt-6 py-3 rounded-xl font-semibold transition-all",
                    plan.popular
                      ? "bg-primary-500 text-white hover:bg-primary-600"
                      : "bg-dark-100 dark:bg-dark-700 text-dark-900 dark:text-white hover:bg-dark-200 dark:hover:bg-dark-600"
                  )}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-dark-900 dark:text-white mb-12">Email Features</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Spam Protection', desc: 'AI-powered spam filtering' },
              { icon: Clock, title: '99.9% Uptime', desc: 'Always available email' },
              { icon: Smartphone, title: 'Mobile Access', desc: 'iOS & Android apps' },
              { icon: Send, title: 'Easy Setup', desc: 'Works in minutes' }
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-white dark:bg-dark-700 rounded-2xl">
                <div className="w-14 h-14 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-dark-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-dark-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

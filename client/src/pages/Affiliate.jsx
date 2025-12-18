import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, DollarSign, TrendingUp, Gift, CheckCircle, ArrowRight, Percent, Clock, CreditCard, BarChart } from 'lucide-react'
import { useThemeStore } from '../store/useStore'
import clsx from 'clsx'

const benefits = [
  { icon: Percent, title: '30% Commission', desc: 'Earn 30% on every sale you refer to us', color: 'from-green-500 to-emerald-500' },
  { icon: Clock, title: '90-Day Cookie', desc: 'Long tracking window means more conversions', color: 'from-blue-500 to-cyan-500' },
  { icon: CreditCard, title: 'Monthly Payouts', desc: 'Get paid every month via PayPal or bank transfer', color: 'from-purple-500 to-violet-500' },
  { icon: BarChart, title: 'Real-time Stats', desc: 'Track your clicks, sales, and earnings live', color: 'from-orange-500 to-red-500' },
]

const steps = [
  { step: '1', title: 'Sign Up', desc: 'Create your free affiliate account in minutes' },
  { step: '2', title: 'Share', desc: 'Promote using your unique referral links' },
  { step: '3', title: 'Earn', desc: 'Get 30% commission on every successful referral' },
]

const tiers = [
  { name: 'Bronze', sales: '1-10', commission: '25%', bonus: '$0' },
  { name: 'Silver', sales: '11-50', commission: '30%', bonus: '$100' },
  { name: 'Gold', sales: '51-100', commission: '35%', bonus: '$500' },
  { name: 'Platinum', sales: '100+', commission: '40%', bonus: '$1,000' },
]

export default function Affiliate() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <>
      <Helmet>
        <title>Affiliate Program - Earn with Magnetic Clouds</title>
        <meta name="description" content="Join our affiliate program and earn up to 40% commission on every sale. Monthly payouts, real-time tracking, and dedicated support." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-green-950/20 to-dark-950" : "bg-gradient-to-b from-green-50 via-white to-emerald-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-green-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 text-white mb-8 shadow-2xl shadow-green-500/30">
            <Users className="w-10 h-10" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}>
            Earn with Our{' '}<span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Affiliate Program</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}>
            Join thousands of affiliates earning passive income by promoting Magnetic Clouds. Up to 40% commission per sale.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl transition-all flex items-center gap-2">
              Become an Affiliate <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '40%', label: 'Max Commission' },
              { value: '90', label: 'Day Cookie' },
              { value: '$50', label: 'Min Payout' },
              { value: '5000+', label: 'Affiliates' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{stat.value}</p>
                <p className={clsx("text-sm mt-1", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Why Join Our <span className="text-gradient">Program</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className={clsx("p-8 rounded-3xl text-center border", isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100 shadow-lg")}>
                <div className={clsx("inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br text-white mb-6", benefit.color)}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{benefit.title}</h3>
                <p className={clsx("mt-3", isDark ? "text-dark-400" : "text-dark-500")}>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={clsx("py-24", isDark ? "bg-dark-950" : "bg-gray-50")}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">How It <span className="text-gradient">Works</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-2xl font-bold mb-6 shadow-lg">
                  {step.step}
                </div>
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{step.title}</h3>
                <p className={clsx("mt-3", isDark ? "text-dark-400" : "text-dark-500")}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Commission <span className="text-gradient">Tiers</span></h2>
            <p className={clsx("mt-4", isDark ? "text-dark-400" : "text-dark-500")}>Earn more as you sell more</p>
          </div>
          <div className={clsx("rounded-3xl overflow-hidden border", isDark ? "border-dark-700" : "border-gray-200")}>
            <table className="w-full">
              <thead className={isDark ? "bg-dark-800" : "bg-gray-50"}>
                <tr>
                  <th className={clsx("px-6 py-4 text-left font-semibold", isDark ? "text-white" : "text-dark-900")}>Tier</th>
                  <th className={clsx("px-6 py-4 text-center font-semibold", isDark ? "text-white" : "text-dark-900")}>Sales/Month</th>
                  <th className={clsx("px-6 py-4 text-center font-semibold", isDark ? "text-white" : "text-dark-900")}>Commission</th>
                  <th className={clsx("px-6 py-4 text-center font-semibold", isDark ? "text-white" : "text-dark-900")}>Bonus</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <tr key={tier.name} className={clsx("border-t", isDark ? "border-dark-700" : "border-gray-100", i % 2 === 0 ? "" : isDark ? "bg-dark-800/50" : "bg-gray-50/50")}>
                    <td className={clsx("px-6 py-4 font-medium", isDark ? "text-white" : "text-dark-900")}>{tier.name}</td>
                    <td className={clsx("px-6 py-4 text-center", isDark ? "text-dark-300" : "text-dark-600")}>{tier.sales}</td>
                    <td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">{tier.commission}</span></td>
                    <td className={clsx("px-6 py-4 text-center font-semibold", isDark ? "text-white" : "text-dark-900")}>{tier.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Ready to Start Earning?</h2>
          <p className="mt-4 text-lg text-white/80">Join our affiliate program today and start earning commissions.</p>
          <div className="mt-8">
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Join Now - It's Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

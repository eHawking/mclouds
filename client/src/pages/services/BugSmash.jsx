import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Bug, Zap, Shield, Clock, CheckCircle, ArrowRight, Code, Search, Wrench, Target } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const plans = [
  { name: 'Quick Fix', price: 49, bugs: 1, time: '2 hours', support: 'Email', features: ['Single Bug Fix', 'Code Review', 'Fix Verification'] },
  { name: 'Standard', price: 149, bugs: 5, time: '24 hours', support: 'Priority', features: ['Up to 5 Bugs', 'Full Code Audit', 'Performance Check', 'Security Scan'], popular: true },
  { name: 'Unlimited', price: 399, bugs: 'Unlimited', time: 'Same Day', support: '24/7 VIP', features: ['Unlimited Bugs', 'Dedicated Developer', 'Real-time Fixes', 'Monthly Maintenance'] },
]

const features = [
  { icon: Zap, title: 'Instant Diagnosis', desc: 'AI-powered bug detection finds issues in seconds', color: 'from-yellow-500 to-orange-500' },
  { icon: Target, title: 'Precision Fixes', desc: 'Surgical fixes that don\'t break other features', color: 'from-red-500 to-rose-500' },
  { icon: Shield, title: 'Security Focused', desc: 'All fixes include security vulnerability checks', color: 'from-green-500 to-emerald-500' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'Most bugs fixed within hours, not days', color: 'from-blue-500 to-cyan-500' },
  { icon: Code, title: 'Clean Code', desc: 'Fixes follow best practices and coding standards', color: 'from-purple-500 to-violet-500' },
  { icon: Search, title: 'Root Cause Analysis', desc: 'We find and fix the source, not just symptoms', color: 'from-indigo-500 to-blue-500' },
]

export default function BugSmash() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isDark = theme === 'dark'

  const handleAddToCart = (plan) => {
    addItem({
      id: `bugsmash-${plan.name.toLowerCase().replace(/\s/g, '-')}`,
      type: 'service',
      name: `Bug Smash - ${plan.name}`,
      price: plan.price,
      billingCycle: 'one-time',
      product_type: 'bug-smash'
    })
    toast.success(`Bug Smash ${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>Bug Smash - Instant Bug Fixing | Magnetic Clouds</title>
        <meta name="description" content="Professional bug fixing service. Fast, reliable fixes for your website and application bugs. Same-day turnaround available." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-red-950/20 to-dark-950" : "bg-gradient-to-b from-red-50 via-white to-orange-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-red-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-orange-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 text-white mb-8 shadow-2xl shadow-red-500/30">
            <Bug className="w-10 h-10" />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6", isDark ? "bg-red-500/20 border border-red-500/30 text-red-400" : "bg-red-100 border border-red-200 text-red-600")}>
            <Zap className="w-4 h-4" />
            Instant Bug Fixes
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}>
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Bug Smash</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}>
            Squash bugs instantly. Our expert developers fix your website and app issues with precision and speed.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '2hrs', label: 'Avg Fix Time' },
              { value: '99%', label: 'Success Rate' },
              { value: '10k+', label: 'Bugs Fixed' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">{stat.value}</p>
                <p className={clsx("text-sm mt-1", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Choose Your <span className="text-gradient">Plan</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className={clsx("relative rounded-3xl p-8 transition-all", plan.popular ? "bg-gradient-to-b from-red-500/10 to-orange-500/5 border-2 border-red-500/50" : isDark ? "bg-dark-800 border border-dark-700" : "bg-white border border-gray-200 shadow-lg")}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold rounded-full">MOST POPULAR</div>}
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">{format(plan.price)}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.bugs} bug(s)</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.time} turnaround</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.support} support</span></li>
                  {plan.features.map((f) => <li key={f} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{f}</span></li>)}
                </ul>
                <button onClick={() => handleAddToCart(plan)} className={clsx("w-full mt-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2", plan.popular ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg" : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-100 text-red-700 hover:bg-red-200")}>
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={clsx("py-24", isDark ? "bg-dark-950" : "bg-gray-50")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">How We <span className="text-gradient">Smash Bugs</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className={clsx("group p-8 rounded-3xl border transition-all hover:shadow-xl", isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-100")}>
                <div className={clsx("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform", feature.color)}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{feature.title}</h3>
                <p className={clsx("mt-3", isDark ? "text-dark-400" : "text-dark-500")}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Got a Bug? Let's Smash It!</h2>
          <p className="mt-4 text-lg text-white/80">Submit your bug and we'll have it fixed in no time.</p>
          <div className="mt-8">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Report a Bug <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Bug, Lock, RefreshCw, Bell, CheckCircle, ArrowRight, Shield, Eye, Activity } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const plans = [
  { name: 'Basic', price: 9.99, sites: 1, scans: 'Daily', fixes: 'Manual', features: ['Vulnerability Scanning', 'Malware Detection', 'Email Alerts'] },
  { name: 'Pro', price: 29.99, sites: 5, scans: 'Hourly', fixes: 'Auto', features: ['All Basic Features', 'Auto Bug Fixes', 'Firewall Protection', 'DDoS Shield'], popular: true },
  { name: 'Enterprise', price: 79.99, sites: 'Unlimited', scans: 'Real-time', fixes: 'Instant', features: ['All Pro Features', 'Priority Fixes', 'Dedicated Support', 'Custom Rules'] },
]

const features = [
  { icon: Eye, title: 'Real-time Monitoring', desc: '24/7 surveillance of your website for threats and vulnerabilities', color: 'from-cyan-500 to-blue-500' },
  { icon: Zap, title: 'Instant Auto-Fix', desc: 'Automatically patches security holes before hackers exploit them', color: 'from-yellow-500 to-orange-500' },
  { icon: Bug, title: 'Bug Detection', desc: 'AI-powered detection finds bugs that break your site', color: 'from-red-500 to-rose-500' },
  { icon: Shield, title: 'Firewall Protection', desc: 'Enterprise-grade WAF blocks malicious traffic', color: 'from-green-500 to-emerald-500' },
  { icon: RefreshCw, title: 'Auto Recovery', desc: 'Automatic rollback if something goes wrong', color: 'from-purple-500 to-violet-500' },
  { icon: Bell, title: 'Instant Alerts', desc: 'Get notified immediately when issues are detected', color: 'from-pink-500 to-rose-500' },
]

export default function MagneticShieldX() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isDark = theme === 'dark'

  const handleAddToCart = (plan) => {
    addItem({
      id: `shieldx-${plan.name.toLowerCase()}`,
      type: 'product',
      name: `Magnetic ShieldX ${plan.name}`,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'magnetic-shieldx'
    })
    toast.success(`Magnetic ShieldX ${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>Magnetic ShieldX - Auto-Fix Security Extension | Magnetic Clouds</title>
        <meta name="description" content="Active security extension that auto-fixes bugs and vulnerabilities. Real-time protection for your Plesk websites." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-cyan-950/20 to-dark-950" : "bg-gradient-to-b from-cyan-50 via-white to-blue-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white mb-8 shadow-2xl shadow-cyan-500/30">
            <ShieldCheck className="w-10 h-10" />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6", isDark ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400" : "bg-cyan-100 border border-cyan-200 text-cyan-600")}>
            <Activity className="w-4 h-4" />
            Active Protection
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}>
            Magnetic{' '}<span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">ShieldX</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}>
            The active security extension that automatically detects and fixes bugs, vulnerabilities, and security issues on your Plesk websites.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-xl transition-all flex items-center gap-2">
              Protect My Site <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '10M+', label: 'Threats Blocked' },
              { value: '<1s', label: 'Response Time' },
              { value: '99.9%', label: 'Detection Rate' },
              { value: '24/7', label: 'Protection' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">{stat.value}</p>
                <p className={clsx("text-sm mt-1", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className={clsx("py-16", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display">How <span className="text-gradient">ShieldX</span> Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Detect', desc: 'Continuously scans your site for vulnerabilities and bugs', icon: Eye },
              { step: '2', title: 'Analyze', desc: 'AI analyzes the issue and determines the best fix', icon: Activity },
              { step: '3', title: 'Fix', desc: 'Automatically applies the fix without any downtime', icon: Zap },
            ].map((item) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white mb-4 shadow-lg">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{item.title}</h3>
                <p className={clsx("mt-2", isDark ? "text-dark-400" : "text-dark-500")}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={clsx("py-24", isDark ? "bg-dark-950" : "bg-gray-50")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Choose Your <span className="text-gradient">Protection</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className={clsx("relative rounded-3xl p-8 transition-all", plan.popular ? "bg-gradient-to-b from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/50" : isDark ? "bg-dark-800 border border-dark-700" : "bg-white border border-gray-200 shadow-lg")}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full">RECOMMENDED</div>}
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">{format(plan.price)}</span>
                  <span className={isDark ? "text-dark-400" : "text-dark-500"}>/mo</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.sites} site(s)</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.scans} scans</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.fixes} fixes</span></li>
                  {plan.features.map((f) => <li key={f} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{f}</span></li>)}
                </ul>
                <button onClick={() => handleAddToCart(plan)} className={clsx("w-full mt-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2", plan.popular ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg" : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200")}>
                  Get Protected <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Complete <span className="text-gradient">Protection</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className={clsx("group p-8 rounded-3xl border transition-all hover:shadow-xl", isDark ? "bg-dark-800 border-dark-700" : "bg-gray-50 border-gray-100")}>
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
      <section className="py-24 bg-gradient-to-r from-cyan-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Protect Your Website Today</h2>
          <p className="mt-4 text-lg text-white/80">Don't wait for a security breach. Get ShieldX protection now.</p>
          <div className="mt-8">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-cyan-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Start Protection <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

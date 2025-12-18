import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Gift, Copy, CheckCircle, Clock, Tag, Percent, Sparkles, Zap } from 'lucide-react'
import { useThemeStore } from '../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const coupons = [
  { code: 'WELCOME50', discount: '50%', description: 'First order discount', type: 'New Customers', expires: 'Dec 31, 2025', minOrder: '$10', featured: true },
  { code: 'HOSTING30', discount: '30%', description: 'On all hosting plans', type: 'Hosting', expires: 'Jan 15, 2026', minOrder: '$20' },
  { code: 'VPS25', discount: '25%', description: 'VPS server discount', type: 'VPS', expires: 'Feb 28, 2026', minOrder: '$50' },
  { code: 'CLOUD20', discount: '20%', description: 'Cloud server savings', type: 'Cloud', expires: 'Mar 31, 2026', minOrder: '$100' },
  { code: 'DOMAIN15', discount: '15%', description: 'Domain registration', type: 'Domains', expires: 'Ongoing', minOrder: 'None' },
  { code: 'SSL10', discount: '10%', description: 'SSL certificates', type: 'Security', expires: 'Ongoing', minOrder: 'None' },
]

const deals = [
  { title: 'Black Friday Sale', discount: 'Up to 70% Off', description: 'Biggest sale of the year on all products', icon: Sparkles, color: 'from-purple-500 to-pink-500', active: false },
  { title: 'Summer Special', discount: '40% Off', description: 'Cool savings on hosting plans', icon: Zap, color: 'from-yellow-500 to-orange-500', active: true },
  { title: 'Student Discount', discount: '25% Off', description: 'Valid student ID required', icon: Gift, color: 'from-blue-500 to-cyan-500', active: true },
]

export default function Coupons() {
  const [copiedCode, setCopiedCode] = useState(null)
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Coupon code "${code}" copied!`)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  return (
    <>
      <Helmet>
        <title>Coupons & Deals - Save on Magnetic Clouds</title>
        <meta name="description" content="Get exclusive discounts and deals on hosting, VPS, domains, and more. Save up to 70% with our coupon codes." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-pink-950/20 to-dark-950" : "bg-gradient-to-b from-pink-50 via-white to-purple-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-pink-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-500 text-white mb-8 shadow-2xl shadow-pink-500/30">
            <Gift className="w-10 h-10" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}>
            Coupons &{' '}<span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Deals</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}>
            Save big on hosting, servers, domains, and more with our exclusive coupon codes and special deals.
          </motion.p>
        </div>
      </section>

      {/* Active Deals */}
      <section className={clsx("py-16", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">
            <span className="text-gradient">Special Deals</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {deals.filter(d => d.active).map((deal, i) => (
              <motion.div key={deal.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className={clsx("relative rounded-3xl p-6 border overflow-hidden", isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-200 shadow-lg")}>
                <div className={clsx("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 bg-gradient-to-br", deal.color)} />
                <div className={clsx("relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br text-white mb-4", deal.color)}>
                  <deal.icon className="w-6 h-6" />
                </div>
                <h3 className={clsx("text-lg font-bold", isDark ? "text-white" : "text-dark-900")}>{deal.title}</h3>
                <p className={clsx("text-3xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent", deal.color)}>{deal.discount}</p>
                <p className={clsx("mt-2 text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{deal.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coupon Codes */}
      <section className={clsx("py-16", isDark ? "bg-dark-950" : "bg-gray-50")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">
            <span className="text-gradient">Coupon Codes</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon, i) => (
              <motion.div key={coupon.code} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i }}
                className={clsx("relative rounded-2xl p-6 border", coupon.featured ? "ring-2 ring-pink-500" : "", isDark ? "bg-dark-800 border-dark-700" : "bg-white border-gray-200 shadow-lg")}>
                {coupon.featured && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full">
                    FEATURED
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className={clsx("px-3 py-1 rounded-full text-xs font-medium", isDark ? "bg-dark-700 text-dark-300" : "bg-gray-100 text-gray-600")}>
                    {coupon.type}
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {coupon.discount}
                  </span>
                </div>
                <p className={clsx("font-medium", isDark ? "text-white" : "text-dark-900")}>{coupon.description}</p>
                <div className={clsx("mt-4 flex items-center justify-between p-3 rounded-xl", isDark ? "bg-dark-700" : "bg-gray-100")}>
                  <code className={clsx("font-mono font-bold tracking-wider", isDark ? "text-pink-400" : "text-pink-600")}>{coupon.code}</code>
                  <button onClick={() => copyCode(coupon.code)} className={clsx("p-2 rounded-lg transition-colors", copiedCode === coupon.code ? "bg-green-500 text-white" : isDark ? "hover:bg-dark-600 text-dark-400" : "hover:bg-gray-200 text-gray-600")}>
                    {copiedCode === coupon.code ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className={clsx("mt-4 flex items-center justify-between text-xs", isDark ? "text-dark-400" : "text-dark-500")}>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {coupon.expires}</span>
                  <span>Min: {coupon.minOrder}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className={clsx("py-16", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">
            How to <span className="text-gradient">Use Coupons</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Copy Code', desc: 'Click the copy button next to any coupon code' },
              { step: '2', title: 'Add to Cart', desc: 'Select your products and proceed to checkout' },
              { step: '3', title: 'Apply & Save', desc: 'Paste the code in the coupon field and save' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className="text-center">
                <div className={clsx("inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold mb-4", isDark ? "bg-pink-500/20 text-pink-400" : "bg-pink-100 text-pink-600")}>
                  {item.step}
                </div>
                <h3 className={clsx("font-bold", isDark ? "text-white" : "text-dark-900")}>{item.title}</h3>
                <p className={clsx("mt-2 text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-gradient-to-r from-pink-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Get Exclusive Deals</h2>
          <p className="mt-4 text-lg text-white/80">Subscribe to receive special offers and new coupon codes directly in your inbox.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button className="px-8 py-4 bg-white text-pink-600 font-semibold rounded-xl hover:bg-opacity-90 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

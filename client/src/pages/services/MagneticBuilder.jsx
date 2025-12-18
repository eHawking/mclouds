import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Hammer, Clock, Zap, Palette, Layout, Globe, CheckCircle, ArrowRight, Sparkles, Layers, MousePointer } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const plans = [
  { name: 'Starter', price: 19, sites: 1, pages: 10, storage: '1 GB', features: ['Drag & Drop Builder', '50+ Templates', 'Mobile Responsive', 'Free SSL'] },
  { name: 'Professional', price: 49, sites: 5, pages: 'Unlimited', storage: '10 GB', features: ['All Starter Features', 'Custom Domain', 'E-commerce Ready', 'Priority Support'], popular: true },
  { name: 'Agency', price: 99, sites: 'Unlimited', pages: 'Unlimited', storage: '100 GB', features: ['All Pro Features', 'White Label', 'Client Management', 'API Access'] },
]

const features = [
  { icon: MousePointer, title: 'Drag & Drop', desc: 'Build stunning websites without writing a single line of code', color: 'from-violet-500 to-purple-500' },
  { icon: Clock, title: '24-Hour Sites', desc: 'Launch your website in under 24 hours with our rapid builder', color: 'from-blue-500 to-cyan-500' },
  { icon: Palette, title: '200+ Templates', desc: 'Professional templates for every industry and purpose', color: 'from-pink-500 to-rose-500' },
  { icon: Layout, title: 'Responsive Design', desc: 'Looks perfect on desktop, tablet, and mobile devices', color: 'from-green-500 to-emerald-500' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed with global CDN delivery', color: 'from-yellow-500 to-orange-500' },
  { icon: Globe, title: 'SEO Built-in', desc: 'Rank higher with built-in SEO optimization tools', color: 'from-indigo-500 to-blue-500' },
]

export default function MagneticBuilder() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isDark = theme === 'dark'

  const handleAddToCart = (plan) => {
    addItem({
      id: `magnetic-builder-${plan.name.toLowerCase()}`,
      type: 'product',
      name: `Magnetic Builder ${plan.name}`,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'magnetic-builder'
    })
    toast.success(`Magnetic Builder ${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>Magnetic Builder - 24 Hour Site Builder | Magnetic Clouds</title>
        <meta name="description" content="Build stunning websites in 24 hours. Drag & drop builder with 200+ templates. No coding required." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-violet-950/20 to-dark-950" : "bg-gradient-to-b from-violet-50 via-white to-purple-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-500 text-white mb-8 shadow-2xl shadow-violet-500/30">
            <Hammer className="w-10 h-10" />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6", isDark ? "bg-violet-500/20 border border-violet-500/30 text-violet-400" : "bg-violet-100 border border-violet-200 text-violet-600")}>
            <Sparkles className="w-4 h-4" />
            Build in 24 Hours
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}>
            <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Magnetic Builder</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}>
            Create stunning websites in just 24 hours. Drag, drop, and launch - no coding skills required.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl transition-all flex items-center gap-2">
              Start Building Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '200+', label: 'Templates' },
              { value: '24hrs', label: 'Build Time' },
              { value: '50k+', label: 'Sites Built' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">{stat.value}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold font-display">Simple <span className="text-gradient">Pricing</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className={clsx("relative rounded-3xl p-8 transition-all", plan.popular ? "bg-gradient-to-b from-violet-500/10 to-purple-500/5 border-2 border-violet-500/50" : isDark ? "bg-dark-800 border border-dark-700" : "bg-white border border-gray-200 shadow-lg")}>
                {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold rounded-full">BEST VALUE</div>}
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">{format(plan.price)}</span>
                  <span className={isDark ? "text-dark-400" : "text-dark-500"}>/mo</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.sites} site(s)</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.pages} pages</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{plan.storage} storage</span></li>
                  {plan.features.map((f) => <li key={f} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{f}</span></li>)}
                </ul>
                <button onClick={() => handleAddToCart(plan)} className={clsx("w-full mt-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2", plan.popular ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:shadow-lg" : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-violet-100 text-violet-700 hover:bg-violet-200")}>
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
            <h2 className="text-3xl md:text-4xl font-bold font-display">Powerful <span className="text-gradient">Features</span></h2>
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
      <section className="py-24 bg-gradient-to-r from-violet-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Ready to Build Your Website?</h2>
          <p className="mt-4 text-lg text-white/80">Start building for free and launch in 24 hours.</p>
          <div className="mt-8">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

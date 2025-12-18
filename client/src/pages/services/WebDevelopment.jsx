import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Code, Palette, Smartphone, Zap, Shield, Users, Clock, CheckCircle, ArrowRight, Globe, Layers, Database } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const services = [
  { name: 'Landing Page', price: 299, delivery: '3-5 days', pages: 1, revisions: 3, features: ['Mobile Responsive', 'SEO Optimized', 'Contact Form', 'Fast Loading'] },
  { name: 'Business Website', price: 799, delivery: '7-10 days', pages: '5-10', revisions: 5, features: ['CMS Integration', 'Blog Setup', 'Analytics', 'SSL Certificate'], popular: true },
  { name: 'E-Commerce', price: 1999, delivery: '14-21 days', pages: 'Unlimited', revisions: 'Unlimited', features: ['Payment Gateway', 'Inventory System', 'Order Management', 'Customer Portal'] },
]

const features = [
  { icon: Palette, title: 'Custom Design', desc: 'Unique designs tailored to your brand identity', color: 'from-pink-500 to-rose-500' },
  { icon: Smartphone, title: 'Mobile First', desc: 'Responsive designs that work on all devices', color: 'from-blue-500 to-cyan-500' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed with 90+ PageSpeed score', color: 'from-yellow-500 to-orange-500' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'Built with security best practices', color: 'from-green-500 to-emerald-500' },
  { icon: Database, title: 'CMS Integration', desc: 'Easy content management for non-technical users', color: 'from-purple-500 to-violet-500' },
  { icon: Globe, title: 'SEO Optimized', desc: 'Built to rank high in search engines', color: 'from-indigo-500 to-blue-500' },
]

export default function WebDevelopment() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isDark = theme === 'dark'

  const handleAddToCart = (service) => {
    addItem({
      id: `webdev-${service.name.toLowerCase().replace(/\s/g, '-')}`,
      type: 'service',
      name: `Web Development - ${service.name}`,
      price: service.price,
      billingCycle: 'one-time',
      product_type: 'web-development'
    })
    toast.success(`${service.name} package added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>Web Development Services | Magnetic Clouds</title>
        <meta name="description" content="Professional web development services. Custom websites, e-commerce, and web applications built with modern technologies." />
      </Helmet>

      {/* Hero */}
      <section className={clsx("relative overflow-hidden py-24", isDark ? "bg-gradient-to-b from-dark-950 via-blue-950/20 to-dark-950" : "bg-gradient-to-b from-blue-50 via-white to-indigo-50")}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-indigo-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white mb-8 shadow-2xl shadow-blue-500/30">
            <Code className="w-10 h-10" />
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={clsx("text-4xl md:text-6xl font-bold font-display", isDark ? "text-white" : "text-dark-900")}>
            Professional{' '}<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Web Development</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={clsx("mt-6 text-xl max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}>
            Custom websites and web applications built with cutting-edge technologies. From landing pages to enterprise solutions.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all flex items-center gap-2">
              Get a Quote <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className={clsx("py-24", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display">Our <span className="text-gradient">Packages</span></h2>
            <p className={clsx("mt-4", isDark ? "text-dark-400" : "text-dark-500")}>Choose the perfect package for your project</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div key={service.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }}
                className={clsx("relative rounded-3xl p-8 transition-all", service.popular ? "bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border-2 border-blue-500/50" : isDark ? "bg-dark-800 border border-dark-700" : "bg-white border border-gray-200 shadow-lg")}>
                {service.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-full">BEST VALUE</div>}
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{service.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">{format(service.price)}</span>
                </div>
                <p className={clsx("mt-2 text-sm", isDark ? "text-dark-400" : "text-dark-500")}>Delivery: {service.delivery}</p>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{service.pages} page(s)</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{service.revisions} revisions</span></li>
                  {service.features.map((f) => <li key={f} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /><span className={isDark ? "text-dark-300" : "text-dark-600"}>{f}</span></li>)}
                </ul>
                <button onClick={() => handleAddToCart(service)} className={clsx("w-full mt-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2", service.popular ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg" : isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-blue-100 text-blue-700 hover:bg-blue-200")}>
                  Order Now <ArrowRight className="w-4 h-4" />
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
            <h2 className="text-3xl md:text-4xl font-bold font-display">Why Choose <span className="text-gradient">Us</span></h2>
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
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white">Ready to Build Your Dream Website?</h2>
          <p className="mt-4 text-lg text-white/80">Let's discuss your project and bring your vision to life.</p>
          <div className="mt-8">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all">
              Start Your Project <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

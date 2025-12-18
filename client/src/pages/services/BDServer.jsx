import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Server, CheckCircle, ArrowRight, Cpu, HardDrive, Gauge, Globe, Shield, Zap, Headphones, Lock, MapPin, Clock, Wifi, Check, X } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const bdPlans = [
  {
    name: 'BD Starter',
    price: 29.99,
    cpu: '2 vCPU',
    ram: '4 GB',
    storage: '80 GB NVMe',
    bandwidth: '2 TB',
    latency: '<5ms',
    ddos: true,
    backup: 'Daily',
    support: 'Priority',
    features: ['Ultra Low Latency', 'Local Support', 'Daily Backups', 'DDoS Protection']
  },
  {
    name: 'BD Pro',
    price: 59.99,
    cpu: '4 vCPU',
    ram: '8 GB',
    storage: '160 GB NVMe',
    bandwidth: '5 TB',
    latency: '<3ms',
    ddos: true,
    backup: 'Daily',
    dedicatedIp: true,
    support: 'Dedicated',
    features: ['Ultra Low Latency', 'Dedicated IP', 'Local Support', 'Premium DDoS'],
    popular: true
  },
  {
    name: 'BD Enterprise',
    price: 119.99,
    cpu: '8 vCPU',
    ram: '16 GB',
    storage: '320 GB NVMe',
    bandwidth: '10 TB',
    latency: '<1ms',
    ddos: true,
    backup: 'Hourly',
    dedicatedIp: true,
    sla: true,
    support: '24/7 VIP',
    features: ['Lowest Latency', 'Multiple IPs', 'Hourly Backups', 'SLA 99.99%']
  }
]

const specRows = [
  { key: 'cpu', label: 'vCPU Cores', icon: Cpu },
  { key: 'ram', label: 'RAM Memory', icon: Gauge },
  { key: 'storage', label: 'NVMe Storage', icon: HardDrive },
  { key: 'bandwidth', label: 'Bandwidth', icon: Globe },
  { key: 'latency', label: 'Local Latency', icon: Wifi },
  { key: 'support', label: 'Support Level', icon: Headphones },
]

const features = [
  { icon: MapPin, title: 'Dhaka Datacenter', desc: 'Servers located in Dhaka for lowest latency to Bangladesh users', color: 'from-green-500 to-emerald-500' },
  { icon: Wifi, title: 'Ultra Low Latency', desc: 'Under 5ms latency for Bangladesh visitors', color: 'from-blue-500 to-cyan-500' },
  { icon: Shield, title: 'Premium DDoS', desc: 'Enterprise-grade protection against attacks', color: 'from-purple-500 to-pink-500' },
  { icon: Clock, title: '99.99% Uptime', desc: 'Guaranteed uptime with SLA protection', color: 'from-yellow-500 to-orange-500' },
  { icon: Headphones, title: 'Local Support', desc: 'Bengali speaking support team available', color: 'from-indigo-500 to-violet-500' },
  { icon: Zap, title: 'Instant Setup', desc: 'Server ready in under 60 seconds', color: 'from-rose-500 to-red-500' },
]

export default function BDServer() {
  const { format } = useCurrencyStore()
  const { theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isDark = theme === 'dark'

  const handleAddToCart = (plan) => {
    addItem({
      id: `bd-server-${plan.name.toLowerCase().replace(/\s/g, '-')}`,
      type: 'product',
      name: plan.name,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'bd-server'
    })
    toast.success(`${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>BD Server - Premium Bangladesh Datacenter | Magnetic Clouds</title>
        <meta name="description" content="Ultra-low latency servers in Bangladesh. Premium Dhaka datacenter with local support and fastest speeds for BD users." />
      </Helmet>

      {/* Hero Section */}
      <section className={clsx(
        "relative overflow-hidden py-20",
        isDark ? "bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" : "bg-gradient-to-b from-green-50 via-white to-emerald-50"
      )}>
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-200/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm",
                isDark 
                  ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400" 
                  : "bg-green-100 border border-green-200 text-green-600"
              )}
            >
              <MapPin className="w-4 h-4" />
              Premium Bangladesh Datacenter
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={clsx(
                "text-4xl md:text-5xl lg:text-6xl font-bold font-display",
                isDark ? "text-white" : "text-dark-900"
              )}
            >
              <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                BD Server
              </span>
              {' '}Premium
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("mt-6 text-lg max-w-2xl mx-auto", isDark ? "text-dark-300" : "text-dark-600")}
            >
              Ultra-low latency servers located in Dhaka, Bangladesh. Get the fastest speeds for your local users with premium infrastructure.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-8"
            >
              {[
                { value: '<5ms', label: 'Local Latency' },
                { value: '99.99%', label: 'Uptime SLA' },
                { value: 'Dhaka', label: 'Datacenter' },
                { value: '24/7', label: 'Local Support' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{stat.value}</p>
                  <p className={clsx("text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className={clsx("py-16", isDark ? "bg-dark-900" : "bg-white")}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={clsx(
              "rounded-3xl overflow-hidden border",
              isDark ? "bg-dark-800/50 border-dark-700" : "bg-white border-gray-200 shadow-xl"
            )}
          >
            <div className={clsx("grid grid-cols-4 border-b", isDark ? "border-dark-700" : "border-gray-200")}>
              <div className={clsx("p-6 font-semibold", isDark ? "bg-dark-800 text-white" : "bg-gray-50 text-dark-900")}>
                <Server className="w-6 h-6 mb-2 text-green-500" />
                Compare Plans
              </div>
              {bdPlans.map((plan) => (
                <div key={plan.name} className={clsx("p-6 text-center relative", plan.popular ? "bg-gradient-to-b from-green-500/10 to-emerald-500/5" : isDark ? "bg-dark-800/50" : "bg-gray-50/50")}>
                  {plan.popular && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-b-lg">
                      POPULAR
                    </div>
                  )}
                  <h3 className={clsx("text-lg font-bold mb-2", isDark ? "text-white" : "text-dark-900")}>{plan.name.replace('BD ', '')}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={clsx("text-3xl font-bold", plan.popular ? "text-green-500" : isDark ? "text-white" : "text-dark-900")}>{format(plan.price)}</span>
                    <span className={isDark ? "text-dark-400" : "text-dark-500"}>/mo</span>
                  </div>
                </div>
              ))}
            </div>

            {specRows.map((spec, rowIndex) => (
              <div key={spec.key} className={clsx("grid grid-cols-4 border-b", isDark ? "border-dark-700" : "border-gray-100", rowIndex % 2 === 0 ? isDark ? "bg-dark-800/30" : "bg-gray-50/50" : "")}>
                <div className={clsx("p-4 flex items-center gap-3", isDark ? "text-dark-300" : "text-dark-600")}>
                  <spec.icon className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{spec.label}</span>
                </div>
                {bdPlans.map((plan) => (
                  <div key={`${plan.name}-${spec.key}`} className={clsx("p-4 text-center flex items-center justify-center", plan.popular ? "bg-green-500/5" : "", isDark ? "text-white" : "text-dark-800")}>
                    <span className="font-medium">{plan[spec.key] || '-'}</span>
                  </div>
                ))}
              </div>
            ))}

            {[
              { key: 'ddos', label: 'DDoS Protection' },
              { key: 'dedicatedIp', label: 'Dedicated IP' },
              { key: 'sla', label: 'SLA 99.99%' },
            ].map((feature, rowIndex) => (
              <div key={feature.key} className={clsx("grid grid-cols-4 border-b", isDark ? "border-dark-700" : "border-gray-100", (specRows.length + rowIndex) % 2 === 0 ? isDark ? "bg-dark-800/30" : "bg-gray-50/50" : "")}>
                <div className={clsx("p-4 flex items-center gap-3", isDark ? "text-dark-300" : "text-dark-600")}>
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{feature.label}</span>
                </div>
                {bdPlans.map((plan) => (
                  <div key={`${plan.name}-${feature.key}`} className={clsx("p-4 text-center flex items-center justify-center", plan.popular ? "bg-green-500/5" : "")}>
                    {plan[feature.key] ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-dark-400" />}
                  </div>
                ))}
              </div>
            ))}

            <div className={clsx("grid grid-cols-4", isDark ? "bg-dark-800" : "bg-gray-50")}>
              <div className="p-6"></div>
              {bdPlans.map((plan) => (
                <div key={`action-${plan.name}`} className={clsx("p-6 text-center", plan.popular ? "bg-green-500/5" : "")}>
                  <button onClick={() => handleAddToCart(plan)} className={clsx("w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2", plan.popular ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/30" : isDark ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" : "bg-green-100 text-green-700 hover:bg-green-200")}>
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={clsx("py-24", isDark ? "bg-dark-950" : "bg-gray-50")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold font-display">
              Why Choose <span className="text-gradient">BD Server</span>?
            </motion.h2>
            <p className={clsx("mt-4 max-w-2xl mx-auto", isDark ? "text-dark-400" : "text-dark-500")}>
              Premium infrastructure designed for Bangladesh users
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i }} className={clsx("group p-8 rounded-3xl border transition-all hover:shadow-xl", isDark ? "bg-dark-800 border-dark-700 hover:border-green-500/30" : "bg-white border-gray-100 hover:border-green-500/30")}>
                <div className={clsx("w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg", feature.color)}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className={clsx("text-xl font-bold", isDark ? "text-white" : "text-dark-900")}>{feature.title}</h3>
                <p className={clsx("mt-3", isDark ? "text-dark-400" : "text-dark-500")}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold font-display text-white">
            Ready for Ultra-Fast BD Hosting?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-white/80">
            Deploy your server in our Dhaka datacenter today and experience the lowest latency.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
              Contact Sales <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

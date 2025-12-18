import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Database, CheckCircle, ArrowRight, Cpu, HardDrive, Shield, Zap, Globe, Server, Headphones, Lock, Check, X } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import { settingsAPI } from '../../lib/api'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const defaultPlans = [
  { name: 'Starter', price: 99.99, cpu: 'Intel Xeon E-2236', ram: '32 GB DDR4', storage: '1 TB NVMe', bandwidth: '10 TB', rootAccess: true, ipmi: true, ddos: true, raid: false, support: 'Standard', features: ['Full Root Access', 'IPMI Access', 'DDoS Protection', '24/7 Support'] },
  { name: 'Professional', price: 199.99, popular: true, cpu: 'Intel Xeon E-2288G', ram: '64 GB DDR4', storage: '2 TB NVMe', bandwidth: '20 TB', rootAccess: true, ipmi: true, ddos: true, raid: true, support: 'Priority', features: ['Full Root Access', 'IPMI Access', 'Advanced DDoS', 'Priority Support', 'Hardware RAID'] },
  { name: 'Enterprise', price: 399.99, cpu: 'Dual Xeon Gold', ram: '128 GB DDR4', storage: '4 TB RAID', bandwidth: 'Unlimited', rootAccess: true, ipmi: true, ddos: true, raid: true, sla: true, support: 'Dedicated', features: ['Full Root Access', 'IPMI Access', 'Premium DDoS', 'Dedicated Support', 'Hardware RAID', 'SLA 99.99%'] }
]

// Spec rows for comparison table
const specRows = [
  { key: 'cpu', label: 'Processor', icon: Cpu },
  { key: 'ram', label: 'RAM Memory', icon: Database },
  { key: 'storage', label: 'Storage', icon: HardDrive },
  { key: 'bandwidth', label: 'Bandwidth', icon: Globe },
  { key: 'support', label: 'Support Level', icon: Headphones },
]

const features = [
  { icon: Cpu, title: 'Dedicated Hardware', desc: 'No virtualization overhead - pure bare-metal performance', color: 'from-orange-500 to-red-500' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Advanced DDoS protection and hardware firewall', color: 'from-green-500 to-emerald-500' },
  { icon: HardDrive, title: 'NVMe RAID Storage', desc: 'Hardware RAID with hot-swap capability', color: 'from-purple-500 to-pink-500' },
  { icon: Zap, title: 'Maximum Performance', desc: 'No noisy neighbors, all resources are yours', color: 'from-yellow-500 to-orange-500' },
  { icon: Globe, title: 'Global Locations', desc: 'Deploy in strategic locations worldwide', color: 'from-indigo-500 to-violet-500' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'Personal account manager for enterprise clients', color: 'from-rose-500 to-red-500' },
]

export default function Dedicated() {
  const { format } = useCurrencyStore()
  const { themeStyle, theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isGradient = themeStyle === 'gradient'
  const isDark = theme === 'dark'

  const { data: pricingData } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => settingsAPI.getPricing().then(res => res.data.pricing)
  })

  const dedicatedPlans = pricingData?.dedicated || defaultPlans

  const handleAddToCart = (plan) => {
    addItem({
      id: `dedicated-${plan.name.toLowerCase().replace(/\s/g, '-')}`,
      type: 'product',
      name: plan.name,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'dedicated'
    })
    toast.success(`${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>Dedicated Servers - Magnetic Clouds</title>
        <meta name="description" content="Maximum performance with dedicated hardware and full server control. Enterprise-grade bare-metal servers." />
      </Helmet>

      {/* Hero Section */}
      <section className={clsx(
        "relative overflow-hidden py-20",
        isDark ? "bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950" : "bg-gradient-to-b from-orange-50 via-white to-red-50"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0">
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          ) : (
            <>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm",
                isDark 
                  ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400" 
                  : "bg-orange-100 border border-orange-200 text-orange-600"
              )}
            >
              <Server className="w-4 h-4" />
              Enterprise Bare-Metal
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
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Dedicated
              </span>{' '}
              Servers
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={clsx("mt-6 text-lg", isDark ? "text-dark-300" : "text-dark-600")}
            >
              Maximum performance with dedicated hardware. Full server control with enterprise-grade infrastructure.
            </motion.p>
            
            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center gap-8"
            >
              {[
                { value: '100%', label: 'Dedicated' },
                { value: '99.99%', label: 'Uptime SLA' },
                { value: 'IPMI', label: 'Access' },
                { value: '24/7', label: 'Support' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{stat.value}</p>
                  <p className={clsx("text-sm", isDark ? "text-dark-400" : "text-dark-500")}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Row-by-Row Pricing Table */}
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
            {/* Table Header - Plan Names & Prices */}
            <div className={clsx(
              "grid grid-cols-4 border-b",
              isDark ? "border-dark-700" : "border-gray-200"
            )}>
              <div className={clsx(
                "p-6 font-semibold",
                isDark ? "bg-dark-800 text-white" : "bg-gray-50 text-dark-900"
              )}>
                <Server className="w-6 h-6 mb-2 text-orange-500" />
                Compare Plans
              </div>
              {dedicatedPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={clsx(
                    "p-6 text-center relative",
                    plan.popular 
                      ? "bg-gradient-to-b from-orange-500/10 to-red-500/5" 
                      : isDark ? "bg-dark-800/50" : "bg-gray-50/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-b-lg">
                      BEST VALUE
                    </div>
                  )}
                  <h3 className={clsx(
                    "text-lg font-bold mb-2",
                    isDark ? "text-white" : "text-dark-900"
                  )}>{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={clsx(
                      "text-3xl font-bold",
                      plan.popular ? "text-orange-500" : isDark ? "text-white" : "text-dark-900"
                    )}>{format(plan.price)}</span>
                    <span className={isDark ? "text-dark-400" : "text-dark-500"}>/mo</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Spec Rows */}
            {specRows.map((spec, rowIndex) => (
              <div
                key={spec.key}
                className={clsx(
                  "grid grid-cols-4 border-b",
                  isDark ? "border-dark-700" : "border-gray-100",
                  rowIndex % 2 === 0 
                    ? isDark ? "bg-dark-800/30" : "bg-gray-50/50"
                    : ""
                )}
              >
                <div className={clsx(
                  "p-4 flex items-center gap-3",
                  isDark ? "text-dark-300" : "text-dark-600"
                )}>
                  <spec.icon className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">{spec.label}</span>
                </div>
                {dedicatedPlans.map((plan) => (
                  <div
                    key={`${plan.name}-${spec.key}`}
                    className={clsx(
                      "p-4 text-center flex items-center justify-center",
                      plan.popular ? "bg-orange-500/5" : "",
                      isDark ? "text-white" : "text-dark-800"
                    )}
                  >
                    <span className="font-medium text-sm">{plan[spec.key] || '-'}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Boolean Features */}
            {[
              { key: 'rootAccess', label: 'Full Root Access' },
              { key: 'ipmi', label: 'IPMI Access' },
              { key: 'ddos', label: 'DDoS Protection' },
              { key: 'raid', label: 'Hardware RAID' },
              { key: 'sla', label: 'SLA 99.99%' },
            ].map((feature, rowIndex) => (
              <div
                key={feature.key}
                className={clsx(
                  "grid grid-cols-4 border-b",
                  isDark ? "border-dark-700" : "border-gray-100",
                  (specRows.length + rowIndex) % 2 === 0 
                    ? isDark ? "bg-dark-800/30" : "bg-gray-50/50"
                    : ""
                )}
              >
                <div className={clsx(
                  "p-4 flex items-center gap-3",
                  isDark ? "text-dark-300" : "text-dark-600"
                )}>
                  <Shield className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">{feature.label}</span>
                </div>
                {dedicatedPlans.map((plan) => (
                  <div
                    key={`${plan.name}-${feature.key}`}
                    className={clsx(
                      "p-4 text-center flex items-center justify-center",
                      plan.popular ? "bg-orange-500/5" : ""
                    )}
                  >
                    {plan[feature.key] ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-dark-400" />
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Action Row */}
            <div className={clsx(
              "grid grid-cols-4",
              isDark ? "bg-dark-800" : "bg-gray-50"
            )}>
              <div className="p-6"></div>
              {dedicatedPlans.map((plan) => (
                <div
                  key={`action-${plan.name}`}
                  className={clsx(
                    "p-6 text-center",
                    plan.popular ? "bg-orange-500/5" : ""
                  )}
                >
                  <button
                    onClick={() => handleAddToCart(plan)}
                    className={clsx(
                      "w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                      plan.popular
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/30"
                        : isDark 
                          ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" 
                          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    )}
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={clsx("mt-8 flex flex-wrap justify-center items-center gap-6 text-sm", isDark ? "text-dark-400" : "text-dark-600")}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Full Root Access
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              DDoS Protection
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-red-500" />
              Dedicated Support
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold font-display"
            >
              Why Choose{' '}
              <span className="text-gradient">Dedicated Servers</span>
            </motion.h2>
            <p className="mt-4 text-dark-500 max-w-2xl mx-auto">
              Uncompromised performance with enterprise-grade hardware
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="group p-8 rounded-3xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-xl hover:border-orange-500/30 transition-all"
              >
                <div className={clsx(
                  "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg",
                  feature.color
                )}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white">{feature.title}</h3>
                <p className="mt-3 text-dark-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-white"
          >
            Need Custom Hardware Configuration?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-white/80"
          >
            Our enterprise team can build a custom dedicated server solution for your specific needs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
              Contact Sales <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

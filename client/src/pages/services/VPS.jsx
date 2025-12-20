import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, ArrowRight, HardDrive, Shield, Cpu, Gauge, Globe, Zap, Server, Lock, Headphones, Star, Settings, Plus, Minus, Check, X } from 'lucide-react'
import { useCurrencyStore, useThemeStore, useCartStore } from '../../store/useStore'
import { settingsAPI } from '../../lib/api'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const defaultPlans = [
  { name: 'VPS Starter', price: 5.99, cpu: '1 vCPU', ram: '1 GB', storage: '25 GB SSD', bandwidth: '1 TB', rootAccess: true, kvm: true, ddos: false, backup: false, support: 'Email', features: ['Full Root Access', 'KVM Virtualization', '24/7 Support'] },
  { name: 'VPS Professional', price: 12.99, popular: true, cpu: '2 vCPU', ram: '4 GB', storage: '80 GB SSD', bandwidth: '3 TB', rootAccess: true, kvm: true, ddos: true, backup: true, support: 'Priority', features: ['Full Root Access', 'KVM Virtualization', 'DDoS Protection', 'Priority Support'] },
  { name: 'VPS Business', price: 24.99, cpu: '4 vCPU', ram: '8 GB', storage: '160 GB SSD', bandwidth: '5 TB', rootAccess: true, kvm: true, ddos: true, backup: true, dedicatedIp: true, support: 'Dedicated', features: ['Full Root Access', 'KVM Virtualization', 'DDoS Protection', 'Dedicated IP', 'Daily Backups'] }
]

// Spec rows for comparison table
const specRows = [
  { key: 'cpu', label: 'vCPU Cores', icon: Cpu },
  { key: 'ram', label: 'RAM Memory', icon: Gauge },
  { key: 'storage', label: 'NVMe Storage', icon: HardDrive },
  { key: 'bandwidth', label: 'Bandwidth', icon: Globe },
  { key: 'support', label: 'Support Level', icon: Headphones },
]

const features = [
  { icon: Cpu, title: 'Dedicated Resources', desc: 'Guaranteed CPU and RAM allocation with no overselling', color: 'from-blue-500 to-cyan-500' },
  { icon: Shield, title: 'DDoS Protection', desc: 'Enterprise-grade protection up to 10Tbps', color: 'from-green-500 to-emerald-500' },
  { icon: HardDrive, title: 'NVMe SSD Storage', desc: 'Up to 10x faster than traditional SSDs', color: 'from-purple-500 to-pink-500' },
  { icon: Zap, title: 'Instant Deployment', desc: 'Server provisioned in under 60 seconds', color: 'from-yellow-500 to-orange-500' },
  { icon: Globe, title: '10 Global Locations', desc: 'Deploy close to your users worldwide', color: 'from-indigo-500 to-violet-500' },
  { icon: Headphones, title: '24/7 Expert Support', desc: 'Average response time under 5 minutes', color: 'from-rose-500 to-red-500' },
]

export default function VPS() {
  const { format } = useCurrencyStore()
  const { themeStyle, theme } = useThemeStore()
  const { addItem } = useCartStore()
  const isGradient = themeStyle === 'gradient'
  const isDark = theme === 'dark'

  // Custom VPS configurator state
  const [customConfig, setCustomConfig] = useState({
    cpu: 2,
    ram: 4,
    storage: 80,
    bandwidth: 3,
    billingPeriod: 'monthly', // monthly, 1year, 2years, 3years
    datacenter: 'germany', // uk, germany, spain, usa
    ddos: false,
    plesk: false,
    managed: false,
    backupGB: 0 // GB of backup storage (0 = no backup)
  })

  const { data: pricingData } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => settingsAPI.getPricing().then(res => res.data.pricing)
  })

  const { data: customPricing } = useQuery({
    queryKey: ['custom-vps-pricing'],
    queryFn: () => settingsAPI.getCustomVPSPricing().then(res => res.data.pricing)
  })

  // Default pricing if not loaded
  const pricing = customPricing || {
    cpu_price_per_core: 3.00,
    ram_price_per_gb: 1.50,
    storage_price_per_gb: 0.05,
    bandwidth_price_per_tb: 1.00,
    min_cpu: 1, min_ram: 1, min_storage: 20, min_bandwidth: 1,
    max_cpu: 32, max_ram: 128, max_storage: 2000, max_bandwidth: 100,
    cpu_step: 1, ram_step: 1, storage_step: 10, bandwidth_step: 1,
    ddos_protection_price: 5.00,
    plesk_price: 10.00,
    managed_vps_price: 15.00,
    backup_price_per_gb: 0.10,
    min_backup_gb: 0,
    max_backup_gb: 500,
    backup_step: 10,
    // Yearly discounts (percentage off)
    discount_1year: 10,
    discount_2years: 15,
    discount_3years: 20,
    // Datacenters
    datacenters: [
      { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
      { id: 'germany', name: 'Germany North', flag: '🇩🇪' },
      { id: 'spain', name: 'Spain', flag: '🇪🇸' },
      { id: 'usa', name: 'United States', flag: '🇺🇸' },
    ]
  }

  // Calculate custom VPS price
  const calculateCustomPrice = () => {
    let monthlyTotal = 0
    // Base resources
    monthlyTotal += customConfig.cpu * pricing.cpu_price_per_core
    monthlyTotal += customConfig.ram * pricing.ram_price_per_gb
    monthlyTotal += customConfig.storage * pricing.storage_price_per_gb
    monthlyTotal += customConfig.bandwidth * pricing.bandwidth_price_per_tb
    // Add-ons
    if (customConfig.ddos) monthlyTotal += pricing.ddos_protection_price
    if (customConfig.plesk) monthlyTotal += pricing.plesk_price
    if (customConfig.managed) monthlyTotal += pricing.managed_vps_price
    if (customConfig.backupGB > 0) monthlyTotal += customConfig.backupGB * pricing.backup_price_per_gb

    // Apply yearly discount
    let discount = 0
    let months = 1
    if (customConfig.billingPeriod === '1year') {
      discount = pricing.discount_1year / 100
      months = 12
    } else if (customConfig.billingPeriod === '2years') {
      discount = pricing.discount_2years / 100
      months = 24
    } else if (customConfig.billingPeriod === '3years') {
      discount = pricing.discount_3years / 100
      months = 36
    }

    const discountedMonthly = monthlyTotal * (1 - discount)
    return { monthly: discountedMonthly, total: discountedMonthly * months, discount, months }
  }

  const handleAddCustomToCart = () => {
    const priceInfo = calculateCustomPrice()
    const billingLabels = { monthly: 'Monthly', '1year': '1 Year', '2years': '2 Years', '3years': '3 Years' }
    const datacenterLabel = (pricing.datacenters || []).find(d => d.id === customConfig.datacenter)?.name || customConfig.datacenter

    addItem({
      id: `custom-vps-${Date.now()}`,
      type: 'product',
      name: `Custom VPS (${customConfig.cpu} vCPU, ${customConfig.ram}GB RAM, ${customConfig.storage}GB SSD) - ${datacenterLabel}`,
      price: priceInfo.monthly,
      billingCycle: customConfig.billingPeriod === 'monthly' ? 'monthly' : 'yearly',
      billingPeriod: customConfig.billingPeriod,
      product_type: 'vps',
      customConfig: customConfig
    })
    toast.success('Custom VPS added to cart!')
  }

  const updateConfig = (key, value) => {
    setCustomConfig(prev => ({ ...prev, [key]: value }))
  }

  const incrementConfig = (key, step, max) => {
    setCustomConfig(prev => ({
      ...prev,
      [key]: Math.min(prev[key] + step, max)
    }))
  }

  const decrementConfig = (key, step, min) => {
    setCustomConfig(prev => ({
      ...prev,
      [key]: Math.max(prev[key] - step, min)
    }))
  }

  const vpsPlans = (pricingData?.vps || defaultPlans).map(p => ({
    ...p,
    specs: { cpu: p.cpu, ram: p.ram, storage: p.storage, bandwidth: p.bandwidth },
    features: p.features || ['Full Root Access', 'KVM Virtualization', '24/7 Support']
  }))

  const handleAddToCart = (plan) => {
    addItem({
      id: `vps-${plan.name.toLowerCase().replace(/\s/g, '-')}`,
      type: 'product',
      name: plan.name,
      price: plan.price,
      billingCycle: 'monthly',
      product_type: 'vps'
    })
    toast.success(`${plan.name} added to cart!`)
  }

  return (
    <>
      <Helmet>
        <title>VPS Servers - Magnetic Clouds</title>
        <meta name="description" content="High-performance VPS servers with full root access, NVMe SSD storage, and global locations." />
      </Helmet>

      {/* Ultra Premium Hero with Plans */}
      <section className="relative min-h-screen bg-gray-50 dark:bg-dark-950 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-gray-50 to-purple-100/50 dark:from-blue-950/50 dark:via-dark-950 dark:to-purple-950/50" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-conic from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:via-transparent dark:to-purple-500/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-6"
            >
              <Server className="w-4 h-4" />
              Virtual Private Servers
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-dark-900 dark:text-white mb-6"
            >
              Powerful{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                VPS Servers
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto"
            >
              Full root access with dedicated resources. Deploy your applications on enterprise-grade infrastructure.
            </motion.p>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 mb-12"
          >
            {[
              { value: '99.99%', label: 'Uptime SLA' },
              { value: '<60s', label: 'Deploy Time' },
              { value: '10+', label: 'Locations' },
              { value: '24/7', label: 'Support' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-dark-500 dark:text-dark-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

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
                <Server className="w-6 h-6 mb-2 text-blue-500" />
                Compare Plans
              </div>
              {vpsPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={clsx(
                    "p-6 text-center relative",
                    plan.popular
                      ? "bg-gradient-to-b from-blue-500/10 to-purple-500/5"
                      : isDark ? "bg-dark-800/50" : "bg-gray-50/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-b-lg">
                      POPULAR
                    </div>
                  )}
                  <h3 className={clsx(
                    "text-lg font-bold mb-2",
                    isDark ? "text-white" : "text-dark-900"
                  )}>{plan.name.replace('VPS ', '')}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={clsx(
                      "text-3xl font-bold",
                      plan.popular ? "text-blue-500" : isDark ? "text-white" : "text-dark-900"
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
                  <spec.icon className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{spec.label}</span>
                </div>
                {vpsPlans.map((plan) => (
                  <div
                    key={`${plan.name}-${spec.key}`}
                    className={clsx(
                      "p-4 text-center flex items-center justify-center",
                      plan.popular ? "bg-blue-500/5" : "",
                      isDark ? "text-white" : "text-dark-800"
                    )}
                  >
                    <span className="font-medium">{plan[spec.key] || '-'}</span>
                  </div>
                ))}
              </div>
            ))}

            {/* Boolean Features */}
            {[
              { key: 'rootAccess', label: 'Full Root Access' },
              { key: 'kvm', label: 'KVM Virtualization' },
              { key: 'ddos', label: 'DDoS Protection' },
              { key: 'backup', label: 'Daily Backups' },
              { key: 'dedicatedIp', label: 'Dedicated IP' },
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
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{feature.label}</span>
                </div>
                {vpsPlans.map((plan) => (
                  <div
                    key={`${plan.name}-${feature.key}`}
                    className={clsx(
                      "p-4 text-center flex items-center justify-center",
                      plan.popular ? "bg-blue-500/5" : ""
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
              {vpsPlans.map((plan) => (
                <div
                  key={`action-${plan.name}`}
                  className={clsx(
                    "p-6 text-center",
                    plan.popular ? "bg-blue-500/5" : ""
                  )}
                >
                  <button
                    onClick={() => handleAddToCart(plan)}
                    className={clsx(
                      "w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2",
                      plan.popular
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/30"
                        : isDark
                          ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
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
              <Shield className="w-5 h-5 text-green-500" />
              DDoS Protection
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Full Root Access
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-500" />
              24/7 Expert Support
            </div>
          </motion.div>
        </div>
      </section>

      {/* Custom VPS Configurator */}
      <section className="py-24 bg-white dark:bg-dark-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium mb-6"
            >
              <Settings className="w-4 h-4" />
              Build Your Own
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold font-display"
            >
              Customize Your{' '}
              <span className="text-gradient">VPS Server</span>
            </motion.h2>
            <p className="mt-4 text-dark-500 max-w-2xl mx-auto">
              Configure your perfect server with exactly the resources you need
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 border-2 border-purple-500/20"
          >
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Configuration Controls */}
              <div className="lg:col-span-2 space-y-6">
                {/* CPU */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">vCPU Cores</span>
                    </div>
                    <span className="text-sm text-dark-500">${pricing.cpu_price_per_core}/core</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementConfig('cpu', pricing.cpu_step, pricing.min_cpu)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={pricing.min_cpu}
                        max={pricing.max_cpu}
                        step={pricing.cpu_step}
                        value={customConfig.cpu}
                        onChange={(e) => updateConfig('cpu', parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => incrementConfig('cpu', pricing.cpu_step, pricing.max_cpu)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="w-20 text-center">
                      <span className="text-2xl font-bold text-blue-600">{customConfig.cpu}</span>
                      <span className="text-sm text-dark-500 ml-1">cores</span>
                    </div>
                  </div>
                </div>

                {/* RAM */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">RAM Memory</span>
                    </div>
                    <span className="text-sm text-dark-500">${pricing.ram_price_per_gb}/GB</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementConfig('ram', pricing.ram_step, pricing.min_ram)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-purple-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={pricing.min_ram}
                        max={pricing.max_ram}
                        step={pricing.ram_step}
                        value={customConfig.ram}
                        onChange={(e) => updateConfig('ram', parseInt(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <button
                      onClick={() => incrementConfig('ram', pricing.ram_step, pricing.max_ram)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-purple-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="w-20 text-center">
                      <span className="text-2xl font-bold text-purple-600">{customConfig.ram}</span>
                      <span className="text-sm text-dark-500 ml-1">GB</span>
                    </div>
                  </div>
                </div>

                {/* Storage */}
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-pink-500" />
                      <span className="font-medium">NVMe Storage</span>
                    </div>
                    <span className="text-sm text-dark-500">${pricing.storage_price_per_gb}/GB</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementConfig('storage', pricing.storage_step, pricing.min_storage)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-pink-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={pricing.min_storage}
                        max={pricing.max_storage}
                        step={pricing.storage_step}
                        value={customConfig.storage}
                        onChange={(e) => updateConfig('storage', parseInt(e.target.value))}
                        className="w-full accent-pink-500"
                      />
                    </div>
                    <button
                      onClick={() => incrementConfig('storage', pricing.storage_step, pricing.max_storage)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-pink-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="w-20 text-center">
                      <span className="text-2xl font-bold text-pink-600">{customConfig.storage}</span>
                      <span className="text-sm text-dark-500 ml-1">GB</span>
                    </div>
                  </div>
                </div>

                {/* Bandwidth */}
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-500" />
                      <span className="font-medium">Bandwidth</span>
                    </div>
                    <span className="text-sm text-dark-500">${pricing.bandwidth_price_per_tb}/TB</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementConfig('bandwidth', pricing.bandwidth_step, pricing.min_bandwidth)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-cyan-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={pricing.min_bandwidth}
                        max={pricing.max_bandwidth}
                        step={pricing.bandwidth_step}
                        value={customConfig.bandwidth}
                        onChange={(e) => updateConfig('bandwidth', parseInt(e.target.value))}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                    <button
                      onClick={() => incrementConfig('bandwidth', pricing.bandwidth_step, pricing.max_bandwidth)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-cyan-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="w-20 text-center">
                      <span className="text-2xl font-bold text-cyan-600">{customConfig.bandwidth}</span>
                      <span className="text-sm text-dark-500 ml-1">TB</span>
                    </div>
                  </div>
                </div>

                {/* Billing Period & Datacenter */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Billing Period */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-indigo-500" />
                      <span className="font-medium">Billing Period</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'monthly', label: 'Monthly', discount: 0 },
                        { id: '1year', label: '1 Year', discount: pricing.discount_1year },
                        { id: '2years', label: '2 Years', discount: pricing.discount_2years },
                        { id: '3years', label: '3 Years', discount: pricing.discount_3years },
                      ].map(period => (
                        <button
                          key={period.id}
                          onClick={() => updateConfig('billingPeriod', period.id)}
                          className={clsx(
                            "p-3 rounded-xl text-sm font-medium transition-all relative",
                            customConfig.billingPeriod === period.id
                              ? "bg-indigo-500 text-white shadow-lg"
                              : "bg-white dark:bg-dark-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                          )}
                        >
                          {period.label}
                          {period.discount > 0 && (
                            <span className={clsx(
                              "absolute -top-2 -right-2 px-1.5 py-0.5 text-xs rounded-full",
                              customConfig.billingPeriod === period.id
                                ? "bg-green-400 text-green-900"
                                : "bg-green-500 text-white"
                            )}>
                              -{period.discount}%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Datacenter Location */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Datacenter Location</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(pricing.datacenters || []).map(dc => (
                        <button
                          key={dc.id}
                          onClick={() => updateConfig('datacenter', dc.id)}
                          className={clsx(
                            "p-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                            customConfig.datacenter === dc.id
                              ? "bg-blue-500 text-white shadow-lg"
                              : "bg-white dark:bg-dark-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          )}
                        >
                          <span>{dc.flag}</span>
                          <span className="truncate">{dc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Automated Backups Slider */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-amber-500" />
                      <span className="font-medium">Automated Backups</span>
                    </div>
                    <span className="text-sm text-dark-500">${pricing.backup_price_per_gb}/GB</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => decrementConfig('backupGB', pricing.backup_step || 10, pricing.min_backup_gb || 0)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-amber-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min={pricing.min_backup_gb || 0}
                        max={pricing.max_backup_gb || 500}
                        step={pricing.backup_step || 10}
                        value={customConfig.backupGB}
                        onChange={(e) => updateConfig('backupGB', parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <button
                      onClick={() => incrementConfig('backupGB', pricing.backup_step || 10, pricing.max_backup_gb || 500)}
                      className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 flex items-center justify-center hover:border-amber-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <div className="w-20 text-center">
                      <span className="text-2xl font-bold text-amber-600">{customConfig.backupGB}</span>
                      <span className="text-sm text-dark-500 ml-1">GB</span>
                    </div>
                  </div>
                  {customConfig.backupGB === 0 && (
                    <p className="text-xs text-dark-400 mt-2">No backup storage selected</p>
                  )}
                </div>

                {/* Feature Add-ons */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <label className={clsx(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all",
                    customConfig.ddos
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : "border-dark-200 dark:border-dark-700 hover:border-green-500/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={customConfig.ddos}
                      onChange={(e) => updateConfig('ddos', e.target.checked)}
                      className="hidden"
                    />
                    <Shield className="w-6 h-6 text-green-500 mb-2" />
                    <div className="font-medium text-sm">DDoS Protection</div>
                    <div className="text-xs text-dark-500">+${pricing.ddos_protection_price}/mo</div>
                  </label>

                  <label className={clsx(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all",
                    customConfig.plesk
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-dark-200 dark:border-dark-700 hover:border-orange-500/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={customConfig.plesk}
                      onChange={(e) => updateConfig('plesk', e.target.checked)}
                      className="hidden"
                    />
                    <Server className="w-6 h-6 text-orange-500 mb-2" />
                    <div className="font-medium text-sm">Plesk Included</div>
                    <div className="text-xs text-dark-500">+${pricing.plesk_price}/mo</div>
                  </label>

                  <label className={clsx(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all",
                    customConfig.managed
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-dark-200 dark:border-dark-700 hover:border-purple-500/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={customConfig.managed}
                      onChange={(e) => updateConfig('managed', e.target.checked)}
                      className="hidden"
                    />
                    <Headphones className="w-6 h-6 text-purple-500 mb-2" />
                    <div className="font-medium text-sm">Managed VPS</div>
                    <div className="text-xs text-dark-500">+${pricing.managed_vps_price}/mo</div>
                  </label>

                  {/* SSL Included - Always Included */}
                  <div className="p-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
                    <Lock className="w-6 h-6 text-green-500 mb-2" />
                    <div className="font-medium text-sm">SSL Included</div>
                    <div className="text-xs text-green-600 font-semibold">FREE</div>
                  </div>
                </div>

                {/* Always Included Features */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Always Included
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Headphones className="w-4 h-4" />
                      <span>FREE 24/7 Technical Support</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Star className="w-4 h-4" />
                      <span>Personal Consultant</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Lock className="w-4 h-4" />
                      <span>SSL Certificate Included</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Zap className="w-4 h-4" />
                      <span>Instant Deployment</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl border border-purple-500/20">
                  <h3 className="text-lg font-bold mb-4">Your Configuration</h3>

                  <div className="space-y-3 mb-6">
                    {/* Billing Period & Datacenter */}
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">Billing</span>
                      <span className="font-medium">
                        {customConfig.billingPeriod === 'monthly' ? 'Monthly' :
                          customConfig.billingPeriod === '1year' ? '1 Year' :
                            customConfig.billingPeriod === '2years' ? '2 Years' : '3 Years'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">Datacenter</span>
                      <span className="font-medium">
                        {(pricing.datacenters || []).find(d => d.id === customConfig.datacenter)?.flag}{' '}
                        {(pricing.datacenters || []).find(d => d.id === customConfig.datacenter)?.name}
                      </span>
                    </div>

                    <div className="border-t border-dark-200 dark:border-dark-700 pt-3 mt-3" />

                    {/* Resources */}
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">{customConfig.cpu} vCPU</span>
                      <span>${(customConfig.cpu * pricing.cpu_price_per_core).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">{customConfig.ram} GB RAM</span>
                      <span>${(customConfig.ram * pricing.ram_price_per_gb).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">{customConfig.storage} GB Storage</span>
                      <span>${(customConfig.storage * pricing.storage_price_per_gb).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500">{customConfig.bandwidth} TB Bandwidth</span>
                      <span>${(customConfig.bandwidth * pricing.bandwidth_price_per_tb).toFixed(2)}</span>
                    </div>

                    {/* Add-ons */}
                    {customConfig.ddos && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>DDoS Protection</span>
                        <span>+${pricing.ddos_protection_price.toFixed(2)}</span>
                      </div>
                    )}
                    {customConfig.plesk && (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>Plesk</span>
                        <span>+${pricing.plesk_price.toFixed(2)}</span>
                      </div>
                    )}
                    {customConfig.managed && (
                      <div className="flex justify-between text-sm text-purple-600">
                        <span>Managed VPS</span>
                        <span>+${pricing.managed_vps_price.toFixed(2)}</span>
                      </div>
                    )}
                    {customConfig.backupGB > 0 && (
                      <div className="flex justify-between text-sm text-amber-600">
                        <span>{customConfig.backupGB} GB Backups</span>
                        <span>+${(customConfig.backupGB * pricing.backup_price_per_gb).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Free Includes */}
                    <div className="flex justify-between text-sm text-green-600">
                      <span>SSL Certificate</span>
                      <span>FREE</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Technical Support</span>
                      <span>FREE</span>
                    </div>
                  </div>

                  <div className="border-t border-dark-200 dark:border-dark-700 pt-4 mb-6">
                    {(() => {
                      const priceInfo = calculateCustomPrice()
                      return (
                        <>
                          <div className="flex justify-between items-baseline">
                            <span className="text-lg font-medium">Monthly</span>
                            <div>
                              <span className="text-3xl font-bold text-gradient">{format(priceInfo.monthly)}</span>
                              <span className="text-dark-500">/mo</span>
                            </div>
                          </div>
                          {priceInfo.discount > 0 && (
                            <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                              <span className="text-green-700 dark:text-green-400 text-sm font-medium">
                                You save {(priceInfo.discount * 100).toFixed(0)}% ({format(priceInfo.monthly * priceInfo.discount * priceInfo.months)} off)
                              </span>
                            </div>
                          )}
                          {priceInfo.months > 1 && (
                            <div className="mt-2 text-sm text-dark-500 text-center">
                              Total: {format(priceInfo.total)} for {priceInfo.months} months
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  <button
                    onClick={handleAddCustomToCart}
                    className="w-full btn-primary justify-center py-4"
                  >
                    <Server className="w-5 h-5 mr-2" />
                    Deploy Custom VPS
                  </button>

                  <p className="text-xs text-dark-500 text-center mt-4">
                    Instant deployment • Full root access • Personal consultant
                  </p>
                </div>
              </div>
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
              Enterprise-Grade{' '}
              <span className="text-gradient">VPS Features</span>
            </motion.h2>
            <p className="mt-4 text-dark-500 max-w-2xl mx-auto">
              Everything you need for high-performance applications
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
                className="group p-8 rounded-3xl bg-dark-50 dark:bg-dark-800 border border-dark-100 dark:border-dark-700 hover:shadow-xl hover:border-blue-500/30 transition-all"
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
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-display text-white"
          >
            Ready to Deploy Your VPS?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-white/80"
          >
            Get started in minutes with our instant provisioning system.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
              Contact Sales <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

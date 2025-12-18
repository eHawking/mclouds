import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Server, HardDrive, Cloud, CheckCircle } from 'lucide-react'
import { useCurrencyStore, useThemeStore } from '../store/useStore'
import clsx from 'clsx'

const categories = [
  { name: 'Web Hosting', icon: Server, to: '/hosting', plans: [
    { name: 'Starter', price: 2.99, features: ['1 Website', '10 GB SSD', 'Free SSL'] },
    { name: 'Business', price: 5.99, features: ['Unlimited Sites', '50 GB SSD', 'Free Domain'], popular: true },
    { name: 'Enterprise', price: 9.99, features: ['Unlimited Sites', '100 GB NVMe', 'Dedicated IP'] },
  ]},
  { name: 'VPS Servers', icon: HardDrive, to: '/vps', plans: [
    { name: 'Basic', price: 9.99, features: ['1 vCPU', '2 GB RAM', '40 GB SSD'] },
    { name: 'Standard', price: 19.99, features: ['2 vCPU', '4 GB RAM', '80 GB SSD'], popular: true },
    { name: 'Pro', price: 39.99, features: ['4 vCPU', '8 GB RAM', '160 GB SSD'] },
  ]},
  { name: 'Cloud Servers', icon: Cloud, to: '/cloud', plans: [
    { name: 'Starter', price: 24.99, features: ['2 vCPU', '4 GB RAM', 'Auto Scaling'] },
    { name: 'Business', price: 49.99, features: ['4 vCPU', '8 GB RAM', 'Load Balancer'], popular: true },
    { name: 'Enterprise', price: 149.99, features: ['8 vCPU', '32 GB RAM', 'Private Network'] },
  ]},
]

export default function Pricing() {
  const { format } = useCurrencyStore()
  const { themeStyle } = useThemeStore()
  const isGradient = themeStyle === 'gradient'

  return (
    <>
      <Helmet><title>Pricing - Magnetic Clouds</title></Helmet>
      <section className={clsx("py-20", isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-950")}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-display">
            Simple, Transparent <span className={isGradient ? "text-gradient" : "text-primary-500"}>Pricing</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-dark-500 max-w-2xl mx-auto">
            No hidden fees. No surprises. Choose the plan that works best for you.
          </motion.p>
        </div>
      </section>

      {categories.map((category, ci) => (
        <section key={category.name} className={clsx("section", ci % 2 === 1 && (isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-900"))}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white",
                  isGradient ? "bg-gradient-to-br from-primary-500 to-secondary-500" : "bg-primary-500")}>
                  <category.icon className="w-7 h-7" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">{category.name}</h2>
              </div>
              <Link to={category.to} className="text-primary-500 hover:underline font-medium">View all →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {category.plans.map((plan, i) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} className={clsx("card p-8", plan.popular && "pricing-popular")}>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{format(plan.price)}</span>
                    <span className="text-dark-500">/mo</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link to={category.to} className={clsx("w-full mt-6", plan.popular ? "btn-primary" : "btn-outline")}>
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

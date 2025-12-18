import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Users, Award, Globe, Heart, Target, Eye } from 'lucide-react'
import { useThemeStore } from '../store/useStore'
import clsx from 'clsx'

const stats = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '10+', label: 'Data Centers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
]

const team = [
  { name: 'Ahmed Rahman', role: 'CEO & Founder', avatar: 'AR' },
  { name: 'Fatima Khan', role: 'CTO', avatar: 'FK' },
  { name: 'Mohammad Ali', role: 'Head of Operations', avatar: 'MA' },
  { name: 'Sarah Ahmed', role: 'Customer Success', avatar: 'SA' },
]

export default function About() {
  const { themeStyle } = useThemeStore()
  const isGradient = themeStyle === 'gradient'

  return (
    <>
      <Helmet><title>About Us - Magnetic Clouds</title></Helmet>

      <section className={clsx("py-20", isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-950")}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-display">
            About <span className={isGradient ? "text-gradient" : "text-primary-500"}>Magnetic Clouds</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-dark-500 max-w-3xl mx-auto">
            We are a Bangladesh-based web hosting company dedicated to providing reliable, 
            secure, and affordable hosting solutions to businesses worldwide.
          </motion.p>
        </div>
      </section>

      <section className="py-12 bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}>
                <p className="text-4xl font-bold text-gradient">{stat.value}</p>
                <p className="mt-2 text-dark-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading">Our Story</h2>
              <p className="mt-6 text-dark-600 dark:text-dark-400">
                Founded in 2020, Magnetic Clouds started with a simple mission: to make enterprise-grade 
                hosting accessible to everyone. From our headquarters in Dhaka, Bangladesh, we've grown 
                to serve over 50,000 customers across 100+ countries.
              </p>
              <p className="mt-4 text-dark-600 dark:text-dark-400">
                Today, we operate 10+ data centers worldwide, providing lightning-fast hosting solutions 
                backed by our 24/7 expert support team. Our commitment to quality, reliability, and 
                customer satisfaction has made us one of the fastest-growing hosting providers in South Asia.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="card p-6">
                <Target className="w-10 h-10 text-primary-500" />
                <h3 className="mt-4 font-bold">Our Mission</h3>
                <p className="mt-2 text-sm text-dark-500">To empower businesses with reliable hosting solutions.</p>
              </div>
              <div className="card p-6">
                <Eye className="w-10 h-10 text-secondary-500" />
                <h3 className="mt-4 font-bold">Our Vision</h3>
                <p className="mt-2 text-sm text-dark-500">To be the leading hosting provider in South Asia.</p>
              </div>
              <div className="card p-6">
                <Heart className="w-10 h-10 text-red-500" />
                <h3 className="mt-4 font-bold">Our Values</h3>
                <p className="mt-2 text-sm text-dark-500">Customer-first approach in everything we do.</p>
              </div>
              <div className="card p-6">
                <Award className="w-10 h-10 text-yellow-500" />
                <h3 className="mt-4 font-bold">Our Promise</h3>
                <p className="mt-2 text-sm text-dark-500">99.9% uptime with 45-day money-back guarantee.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={clsx("section", isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-900")}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-heading text-center">Our Leadership Team</h2>
          <p className="section-subheading text-center mx-auto">Meet the people behind Magnetic Clouds</p>
          <div className="mt-12 grid md:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="text-center">
                <div className={clsx("w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold",
                  isGradient ? "bg-gradient-to-br from-primary-500 to-secondary-500" : "bg-primary-500")}>
                  {member.avatar}
                </div>
                <h3 className="mt-4 font-bold">{member.name}</h3>
                <p className="text-dark-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

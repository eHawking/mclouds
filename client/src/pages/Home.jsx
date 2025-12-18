import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Server, Cloud, Database, Globe, Shield, Mail,
  Archive, CheckCircle, Zap, Clock, HeadphonesIcon, MapPin,
  ArrowRight, ChevronRight, Star, Users, Award, TrendingUp
} from 'lucide-react'
import { productsAPI, domainsAPI, settingsAPI } from '../lib/api'
import { useCurrencyStore, useThemeStore, useSiteSettingsStore } from '../store/useStore'
import clsx from 'clsx'

const features = [
  { icon: Zap, title: '99.9% Uptime', desc: 'Enterprise-grade reliability', color: 'from-yellow-500 to-orange-500' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Expert help anytime', color: 'from-green-500 to-emerald-500' },
  { icon: Shield, title: 'Free SSL', desc: 'Secure your website', color: 'from-blue-500 to-cyan-500' },
  { icon: Archive, title: 'Daily Backups', desc: 'Your data is safe', color: 'from-purple-500 to-pink-500' },
  { icon: Clock, title: '45-Day Money Back', desc: 'Risk-free guarantee', color: 'from-red-500 to-rose-500' },
  { icon: MapPin, title: 'Global Network', desc: '10+ locations', color: 'from-indigo-500 to-violet-500' },
]

const services = [
  { icon: Server, title: 'Web Hosting', desc: 'Fast & reliable shared hosting', to: '/hosting', price: 2.99 },
  { icon: Database, title: 'VPS Servers', desc: 'Full root access & control', to: '/vps', price: 9.99 },
  { icon: Cloud, title: 'Cloud Servers', desc: 'Scalable cloud infrastructure', to: '/cloud', price: 24.99 },
  { icon: Server, title: 'Dedicated Servers', desc: 'Maximum performance', to: '/dedicated', price: 99.99 },
  { icon: Globe, title: 'Domains', desc: 'Register your perfect domain', to: '/domains', price: 2.99 },
  { icon: Shield, title: 'SSL Certificates', desc: 'Secure your website', to: '/ssl', price: 9.99 },
  { icon: Mail, title: 'Professional Email', desc: 'Business email solutions', to: '/email', price: 1.99 },
  { icon: Archive, title: 'Website Backup', desc: 'Automated backups', to: '/backup', price: 2.99 },
]

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
  { value: '10+', label: 'Data Centers' },
]

export default function Home() {
  const navigate = useNavigate()
  const { format } = useCurrencyStore()
  const { themeStyle } = useThemeStore()
  const { logo, siteName, partnerLogos } = useSiteSettingsStore()
  const [domainSearch, setDomainSearch] = useState('')

  const { data: datacenters } = useQuery({
    queryKey: ['datacenters'],
    queryFn: () => settingsAPI.getDatacenters().then(res => res.data.datacenters)
  })

  const handleDomainSearch = (e) => {
    e.preventDefault()
    if (domainSearch.trim()) {
      navigate(`/domains?search=${encodeURIComponent(domainSearch)}`)
    }
  }

  const isGradient = themeStyle === 'gradient'

  return (
    <>
      <Helmet>
        <title>Magnetic Clouds - Premium Web Hosting from Bangladesh</title>
        <meta name="description" content="Premium web hosting, VPS, cloud & dedicated servers from Bangladesh. 24/7 support, free SSL, 45-day money back guarantee." />
      </Helmet>

      {/* Hero Section */}
      <section className={clsx(
        "relative min-h-[90vh] flex items-center overflow-hidden",
        isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-950"
      )}>
        {/* Background elements */}
        {isGradient && (
          <>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary-500/20 to-transparent blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-secondary-500/20 to-transparent blur-3xl" />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                Trusted by 50,000+ customers worldwide
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display leading-tight">
                Premium Cloud Hosting
                <span className={clsx(
                  "block mt-2",
                  isGradient ? "text-gradient" : "text-primary-500"
                )}>
                  Built for Speed
                </span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-dark-600 dark:text-dark-400 max-w-xl">
                Experience lightning-fast hosting with 99.9% uptime guarantee. From Bangladesh to the world.
              </p>

              {/* Domain search */}
              <form onSubmit={handleDomainSearch} className="mt-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                    <input
                      type="text"
                      value={domainSearch}
                      onChange={(e) => setDomainSearch(e.target.value)}
                      placeholder="Search your perfect domain..."
                      className="input-lg pl-12"
                    />
                  </div>
                  <button type="submit" className="btn-primary px-8 py-4 text-lg">
                    Search
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-dark-500">
                  <span>Popular:</span>
                  {['.com', '.net', '.io', '.ai'].map((tld) => (
                    <button
                      key={tld}
                      type="button"
                      onClick={() => setDomainSearch(`yourdomain${tld}`)}
                      className="px-3 py-1 bg-dark-100 dark:bg-dark-800 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                    >
                      {tld}
                    </button>
                  ))}
                </div>
              </form>

              {/* CTA buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/hosting" className="btn-primary">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link to="/pricing" className="btn-outline">
                  View Plans
                </Link>
              </div>

              {/* Trust indicators */}
              <Link to="/reviews" className="mt-10 flex items-center gap-6 group cursor-pointer">
                <div className="flex -space-x-3">
                  {[
                    { name: 'Sarah M.', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
                    { name: 'James K.', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
                    { name: 'Emily R.', img: null, initial: 'E' },
                    { name: 'Michael T.', img: 'https://randomuser.me/api/portraits/men/67.jpg' },
                    { name: 'Lisa P.', img: null, initial: 'L' },
                  ].map((user, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-dark-900 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary-400 to-purple-500 text-white text-xs font-bold transition-transform group-hover:scale-105"
                    >
                      {user.img ? (
                        <img src={user.img} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.initial
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-sm text-dark-500 group-hover:text-primary-500 transition-colors">
                    4.9/5 from 2000+ reviews <span className="text-primary-500">→</span>
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Right content - Ultra Premium Status Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Premium Glass Card */}
                <div className="relative">
                  {/* Glow effect behind */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl rounded-full" />
                  
                  {/* Main premium status card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    {/* Status indicator with Logo - Magnet attracting clouds */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="relative">
                        {/* Ultra Premium Magnet + Clouds Vector Animation */}
                        
                        {/* Outer glow rings */}
                        <div className="absolute inset-0 -m-16">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: `radial-gradient(circle, transparent 60%, rgba(139, 92, 246, ${0.1 - i * 0.03}) 100%)`,
                                margin: `${i * 20}px`
                              }}
                              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                              transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                            />
                          ))}
                        </div>

                        {/* Magnetic field curved lines */}
                        <svg className="absolute inset-0 w-full h-full -m-8" viewBox="0 0 200 200" style={{ width: 'calc(100% + 64px)', height: 'calc(100% + 64px)' }}>
                          <defs>
                            <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                            <motion.path
                              key={angle}
                              d={`M 100 100 Q ${100 + 60 * Math.cos((angle - 20) * Math.PI / 180)} ${100 + 60 * Math.sin((angle - 20) * Math.PI / 180)} ${100 + 85 * Math.cos(angle * Math.PI / 180)} ${100 + 85 * Math.sin(angle * Math.PI / 180)}`}
                              fill="none"
                              stroke="url(#fieldGradient)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: [0, 1, 0], opacity: [0, 0.6, 0] }}
                              transition={{ duration: 2.5, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          ))}
                        </svg>

                        {/* Floating clouds being attracted */}
                        {[
                          { x: -95, y: -70, delay: 0, scale: 1.2 },
                          { x: 100, y: -50, delay: 0.4, scale: 0.9 },
                          { x: -110, y: 40, delay: 0.8, scale: 1 },
                          { x: 95, y: 65, delay: 1.2, scale: 0.8 },
                          { x: -70, y: 90, delay: 1.6, scale: 0.7 },
                          { x: 80, y: -85, delay: 2, scale: 0.85 },
                          { x: -45, y: -100, delay: 2.4, scale: 0.75 },
                          { x: 55, y: 95, delay: 2.8, scale: 0.65 },
                        ].map((cloud, i) => (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{ marginLeft: -12, marginTop: -12 }}
                            animate={{
                              x: [cloud.x, cloud.x * 0.2, cloud.x],
                              y: [cloud.y, cloud.y * 0.2, cloud.y],
                              opacity: [0.3, 1, 0.3],
                              scale: [cloud.scale, cloud.scale * 1.3, cloud.scale]
                            }}
                            transition={{
                              duration: 3.5,
                              delay: cloud.delay,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                              <path
                                d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
                                fill="url(#cloudGrad)"
                                stroke="rgba(139, 92, 246, 0.5)"
                                strokeWidth="0.5"
                              />
                              <defs>
                                <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#a78bfa" />
                                  <stop offset="100%" stopColor="#818cf8" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </motion.div>
                        ))}

                        {/* Main premium cloud favicon circle */}
                        <motion.div
                          animate={{ scale: [1, 1.03, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="relative z-10 w-44 h-44"
                        >
                          {/* Gradient border ring */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-[3px] shadow-2xl shadow-purple-500/40">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                              
                              {/* Premium Cloud Favicon SVG */}
                              <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none">
                                <defs>
                                  <linearGradient id="cloudMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="50%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                  </linearGradient>
                                  <linearGradient id="cloudShine" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                  </linearGradient>
                                  <filter id="cloudGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                    <feMerge>
                                      <feMergeNode in="coloredBlur"/>
                                      <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                  </filter>
                                  <filter id="innerShadow">
                                    <feOffset dx="0" dy="2"/>
                                    <feGaussianBlur stdDeviation="2"/>
                                    <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/>
                                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"/>
                                    <feBlend in2="SourceGraphic" mode="normal"/>
                                  </filter>
                                </defs>
                                
                                {/* Cloud shape with premium styling */}
                                <g filter="url(#cloudGlow)">
                                  <path 
                                    d="M75 55h-2.5A18 18 0 0 0 40 38a18 18 0 0 0-17.8 15.5A12 12 0 0 0 25 77h50a12 12 0 0 0 0-24z" 
                                    fill="url(#cloudMainGrad)"
                                    filter="url(#innerShadow)"
                                  />
                                  {/* Shine overlay */}
                                  <path 
                                    d="M75 55h-2.5A18 18 0 0 0 40 38a18 18 0 0 0-17.8 15.5A12 12 0 0 0 25 77h50a12 12 0 0 0 0-24z" 
                                    fill="url(#cloudShine)"
                                    opacity="0.5"
                                  />
                                </g>
                                
                                {/* Animated sparkles */}
                                <motion.g
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <circle cx="35" cy="58" r="2" fill="white" opacity="0.8" />
                                  <circle cx="50" cy="52" r="1.5" fill="white" opacity="0.6" />
                                  <circle cx="65" cy="60" r="1.5" fill="white" opacity="0.7" />
                                </motion.g>
                              </svg>
                              
                            </div>
                          </div>
                          
                          {/* Inner glow */}
                          <div className="absolute inset-4 rounded-full bg-gradient-to-t from-purple-500/20 to-transparent blur-xl" />
                        </motion.div>

                        {/* Energy particles flowing to magnet */}
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500"
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                            animate={{
                              x: [Math.cos(i * 30 * Math.PI / 180) * 100, 0],
                              y: [Math.sin(i * 30 * Math.PI / 180) * 100, 0],
                              opacity: [0, 1, 0],
                              scale: [0.5, 1.5, 0]
                            }}
                            transition={{
                              duration: 2,
                              delay: i * 0.15,
                              repeat: Infinity,
                              ease: "easeIn"
                            }}
                          />
                        ))}
                        
                        {/* Pulse rings */}
                        <motion.div 
                          className="absolute inset-0 rounded-full border-2 border-purple-400/40"
                          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div 
                          className="absolute -inset-4 rounded-full border border-violet-400/30"
                          animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                          transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                        />
                        <motion.div 
                          className="absolute -inset-8 rounded-full border border-indigo-400/20"
                          animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                          transition={{ duration: 2, delay: 1, repeat: Infinity }}
                        />
                      </div>
                    </div>

                    {/* Status text */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
                          Powerful Cloud Infrastructure
                        </span>
                      </h3>
                      <p className="text-dark-600 dark:text-dark-400">Enterprise-grade servers at your fingertips</p>
                    </div>

                    {/* Stats row with 4 columns - uniform alignment */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Active Users', value: '50,000+', color: 'text-primary-400' },
                        { label: 'Uptime', value: '99.99%', color: 'text-green-400' },
                        { label: 'Response', value: '<50ms', color: 'text-blue-400' },
                        { label: 'Performance', value: '+99.9%', color: 'text-emerald-400' }
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="text-center p-5 rounded-2xl bg-white/80 dark:bg-dark-800/50 backdrop-blur border border-gray-200 dark:border-dark-700 shadow-lg"
                        >
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-dark-500 mt-2">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className={clsx(
                  "text-4xl md:text-5xl font-bold font-display",
                  isGradient ? "text-gradient" : "text-primary-400"
                )}>
                  {stat.value}
                </p>
                <p className="mt-2 text-dark-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              Why Choose <span className={isGradient ? "text-gradient" : "text-primary-500"}>Magnetic Clouds</span>?
            </motion.h2>
            <p className="section-subheading mx-auto">
              Experience enterprise-grade hosting with features designed for your success.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover p-6"
              >
                <div className={clsx(
                  "feature-icon",
                  isGradient ? `bg-gradient-to-br ${feature.color}` : "bg-primary-500"
                )}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-dark-600 dark:text-dark-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={clsx(
        "section",
        isGradient ? "bg-gradient-mesh" : "bg-dark-50 dark:bg-dark-900"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              Our <span className={isGradient ? "text-gradient" : "text-primary-500"}>Services</span>
            </motion.h2>
            <p className="section-subheading mx-auto">
              From shared hosting to dedicated servers, we have the perfect solution for you.
            </p>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={service.to}
                  className="block card-hover p-6 group"
                >
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    isGradient 
                      ? "bg-gradient-to-br from-primary-500 to-secondary-500 text-white" 
                      : "bg-primary-100 dark:bg-primary-900/30 text-primary-500"
                  )}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold group-hover:text-primary-500 transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-1 text-dark-500 text-sm">{service.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-dark-400">Starting at</span>
                    <span className="font-bold text-primary-500">{format(service.price)}/mo</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section - Ultra Premium with Google Badge */}
      <section className="section bg-gradient-to-b from-dark-50 to-white dark:from-dark-900 dark:to-dark-950 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 rounded-full shadow-lg border border-dark-100 dark:border-dark-700 mb-6"
            >
              {/* Google Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="text-sm font-semibold text-dark-700 dark:text-dark-300">328 Reviews on Google</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold font-display mb-4"
            >
              Loved by <span className={isGradient ? "text-gradient" : "text-primary-500"}>50,000+</span> Customers
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto"
            >
              Join thousands of businesses who trust us for their cloud infrastructure
            </motion.p>
          </div>
        </div>

        {/* Row 1 - Scrolling Left */}
        <div className="relative mb-6">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-dark-50 dark:from-dark-900 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dark-50 dark:from-dark-900 to-transparent z-10" />
          <div className="flex animate-marquee-left">
            {[
              { name: 'Ahmed Wasim', role: 'CEO, Magnetic Clouds', img: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5, comment: 'Exceptional service! Our website has never been faster. The support team is incredible.', verified: true },
              { name: 'Hassan Sarwar', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/22.jpg', rating: 5, comment: 'Best hosting provider in Bangladesh. Reliable servers and amazing uptime.', verified: true },
              { name: 'Emily Chen', role: 'E-commerce Owner', img: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 5, comment: 'Migrated from another host and the difference is night and day. Highly recommend!', verified: true },
              { name: 'Michael Brown', role: 'Startup Founder', img: 'https://randomuser.me/api/portraits/men/75.jpg', rating: 5, comment: 'The cloud servers are blazing fast. Perfect for our growing business needs.', verified: true },
              { name: 'Fatima Rahman', role: 'Blogger', img: 'https://randomuser.me/api/portraits/women/26.jpg', rating: 5, comment: 'Simple setup and great performance. My blog loads instantly now!', verified: true },
              { name: 'James Wilson', role: 'Agency Director', img: 'https://randomuser.me/api/portraits/men/52.jpg', rating: 5, comment: 'We host 50+ client sites here. Never had any issues. Premium quality service.', verified: true },
              { name: 'Sophie Anderson', role: 'Marketing Manager', img: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5, comment: 'Incredible speed and reliability. Our campaigns run smoothly every time.', verified: true },
              { name: 'Robert Taylor', role: 'Tech Lead', img: 'https://randomuser.me/api/portraits/men/67.jpg', rating: 5, comment: 'Best infrastructure I\'ve worked with. Scaling is effortless.', verified: true },
            ].concat([
              { name: 'Ahmed Wasim', role: 'CEO, Magnetic Clouds', img: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5, comment: 'Exceptional service! Our website has never been faster. The support team is incredible.', verified: true },
              { name: 'Hassan Sarwar', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/22.jpg', rating: 5, comment: 'Best hosting provider in Bangladesh. Reliable servers and amazing uptime.', verified: true },
              { name: 'Emily Chen', role: 'E-commerce Owner', img: 'https://randomuser.me/api/portraits/women/68.jpg', rating: 5, comment: 'Migrated from another host and the difference is night and day. Highly recommend!', verified: true },
              { name: 'Michael Brown', role: 'Startup Founder', img: 'https://randomuser.me/api/portraits/men/75.jpg', rating: 5, comment: 'The cloud servers are blazing fast. Perfect for our growing business needs.', verified: true },
              { name: 'Fatima Rahman', role: 'Blogger', img: 'https://randomuser.me/api/portraits/women/26.jpg', rating: 5, comment: 'Simple setup and great performance. My blog loads instantly now!', verified: true },
              { name: 'James Wilson', role: 'Agency Director', img: 'https://randomuser.me/api/portraits/men/52.jpg', rating: 5, comment: 'We host 50+ client sites here. Never had any issues. Premium quality service.', verified: true },
              { name: 'Sophie Anderson', role: 'Marketing Manager', img: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5, comment: 'Incredible speed and reliability. Our campaigns run smoothly every time.', verified: true },
              { name: 'Robert Taylor', role: 'Tech Lead', img: 'https://randomuser.me/api/portraits/men/67.jpg', rating: 5, comment: 'Best infrastructure I\'ve worked with. Scaling is effortless.', verified: true },
            ]).map((review, i) => (
              <div
                key={`row1-${i}`}
                className="flex-shrink-0 w-[340px] mx-3 p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 shadow-xl shadow-dark-900/5 dark:shadow-dark-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20" />
                      {review.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark-900 dark:text-white">{review.name}</h4>
                      <p className="text-xs text-dark-500">{review.role}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 opacity-60" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-dark-600 dark:text-dark-300 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolling Right */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-dark-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-dark-950 to-transparent z-10" />
          <div className="flex animate-marquee-right">
            {[
              { name: 'Priya Sharma', role: 'Designer', img: 'https://randomuser.me/api/portraits/women/89.jpg', rating: 5, comment: 'Beautiful dashboard and amazing performance. Love it!', verified: true },
              { name: 'David Kim', role: 'Entrepreneur', img: 'https://randomuser.me/api/portraits/men/46.jpg', rating: 5, comment: 'Started my business here. Couldn\'t ask for better hosting.', verified: true },
              { name: 'Lisa Wang', role: 'Product Manager', img: 'https://randomuser.me/api/portraits/women/55.jpg', rating: 5, comment: 'Seamless integration with our workflow. Highly recommended!', verified: true },
              { name: 'Alex Johnson', role: 'CTO', img: 'https://randomuser.me/api/portraits/men/33.jpg', rating: 5, comment: 'Enterprise-grade security and performance. Top notch!', verified: true },
              { name: 'Maria Garcia', role: 'Freelancer', img: 'https://randomuser.me/api/portraits/women/37.jpg', rating: 5, comment: 'Affordable and reliable. Perfect for freelancers like me.', verified: true },
              { name: 'John Smith', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/55.jpg', rating: 5, comment: 'The API is fantastic. Integration was a breeze.', verified: true },
              { name: 'Sarah Lee', role: 'Startup CEO', img: 'https://randomuser.me/api/portraits/women/72.jpg', rating: 5, comment: 'Migrated our entire infrastructure. Zero regrets!', verified: true },
              { name: 'Chris Davis', role: 'DevOps Engineer', img: 'https://randomuser.me/api/portraits/men/28.jpg', rating: 5, comment: 'Best uptime I\'ve seen. Production-ready from day one.', verified: true },
            ].concat([
              { name: 'Priya Sharma', role: 'Designer', img: 'https://randomuser.me/api/portraits/women/89.jpg', rating: 5, comment: 'Beautiful dashboard and amazing performance. Love it!', verified: true },
              { name: 'David Kim', role: 'Entrepreneur', img: 'https://randomuser.me/api/portraits/men/46.jpg', rating: 5, comment: 'Started my business here. Couldn\'t ask for better hosting.', verified: true },
              { name: 'Lisa Wang', role: 'Product Manager', img: 'https://randomuser.me/api/portraits/women/55.jpg', rating: 5, comment: 'Seamless integration with our workflow. Highly recommended!', verified: true },
              { name: 'Alex Johnson', role: 'CTO', img: 'https://randomuser.me/api/portraits/men/33.jpg', rating: 5, comment: 'Enterprise-grade security and performance. Top notch!', verified: true },
              { name: 'Maria Garcia', role: 'Freelancer', img: 'https://randomuser.me/api/portraits/women/37.jpg', rating: 5, comment: 'Affordable and reliable. Perfect for freelancers like me.', verified: true },
              { name: 'John Smith', role: 'Developer', img: 'https://randomuser.me/api/portraits/men/55.jpg', rating: 5, comment: 'The API is fantastic. Integration was a breeze.', verified: true },
              { name: 'Sarah Lee', role: 'Startup CEO', img: 'https://randomuser.me/api/portraits/women/72.jpg', rating: 5, comment: 'Migrated our entire infrastructure. Zero regrets!', verified: true },
              { name: 'Chris Davis', role: 'DevOps Engineer', img: 'https://randomuser.me/api/portraits/men/28.jpg', rating: 5, comment: 'Best uptime I\'ve seen. Production-ready from day one.', verified: true },
            ]).map((review, i) => (
              <div
                key={`row2-${i}`}
                className="flex-shrink-0 w-[340px] mx-3 p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 shadow-xl shadow-dark-900/5 dark:shadow-dark-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={review.img} alt={review.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20" />
                      {review.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark-900 dark:text-white">{review.name}</h4>
                      <p className="text-xs text-dark-500">{review.role}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 opacity-60" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-dark-600 dark:text-dark-300 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link to="/reviews" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all">
              View All 2,847 Reviews <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Partners Section - Animated Marquee */}
      <section className="py-16 bg-white dark:bg-dark-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold font-display mb-3"
            >
              Trusted <span className={isGradient ? "text-gradient" : "text-primary-500"}>Partners</span> & Payment Methods
            </motion.h3>
            <p className="text-dark-500 dark:text-dark-400">Secure payments powered by industry leaders</p>
          </div>
        </div>

        {/* Partners Row - Scrolling */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-dark-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-dark-950 to-transparent z-10" />
          <div className="flex animate-marquee-left items-center">
            {(partnerLogos && partnerLogos.length > 0 
              ? [...partnerLogos, ...partnerLogos]
              : [
                  { name: 'Visa', logo: 'https://cdn.worldvectorlogo.com/logos/visa-2.svg' },
                  { name: 'Mastercard', logo: 'https://cdn.worldvectorlogo.com/logos/mastercard-2.svg' },
                  { name: 'American Express', logo: 'https://cdn.worldvectorlogo.com/logos/american-express-1.svg' },
                  { name: 'AWS', logo: 'https://cdn.worldvectorlogo.com/logos/aws-2.svg' },
                  { name: 'Cloudflare', logo: 'https://cdn.worldvectorlogo.com/logos/cloudflare-1.svg' },
                  { name: 'Google Cloud', logo: 'https://cdn.worldvectorlogo.com/logos/google-cloud-1.svg' },
                  { name: 'Stripe', logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg' },
                  { name: 'PayPal', logo: 'https://cdn.worldvectorlogo.com/logos/paypal-2.svg' },
                  { name: 'bKash', logo: 'https://cdn.worldvectorlogo.com/logos/bkash.svg' },
                  { name: 'Apple Pay', logo: 'https://cdn.worldvectorlogo.com/logos/apple-pay.svg' },
                  { name: 'Google Pay', logo: 'https://cdn.worldvectorlogo.com/logos/google-pay-primary-logo-1.svg' },
                  { name: 'Bitcoin', logo: 'https://cdn.worldvectorlogo.com/logos/bitcoin.svg' },
                  { name: 'Ethereum', logo: 'https://cdn.worldvectorlogo.com/logos/ethereum-1.svg' },
                  { name: 'Binance', logo: 'https://cdn.worldvectorlogo.com/logos/binance-coin-bnb.svg' },
                ].concat([
                  { name: 'Visa', logo: 'https://cdn.worldvectorlogo.com/logos/visa-2.svg' },
                  { name: 'Mastercard', logo: 'https://cdn.worldvectorlogo.com/logos/mastercard-2.svg' },
                  { name: 'American Express', logo: 'https://cdn.worldvectorlogo.com/logos/american-express-1.svg' },
                  { name: 'AWS', logo: 'https://cdn.worldvectorlogo.com/logos/aws-2.svg' },
                  { name: 'Cloudflare', logo: 'https://cdn.worldvectorlogo.com/logos/cloudflare-1.svg' },
                  { name: 'Google Cloud', logo: 'https://cdn.worldvectorlogo.com/logos/google-cloud-1.svg' },
                  { name: 'Stripe', logo: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg' },
                  { name: 'PayPal', logo: 'https://cdn.worldvectorlogo.com/logos/paypal-2.svg' },
                  { name: 'bKash', logo: 'https://cdn.worldvectorlogo.com/logos/bkash.svg' },
                  { name: 'Apple Pay', logo: 'https://cdn.worldvectorlogo.com/logos/apple-pay.svg' },
                  { name: 'Google Pay', logo: 'https://cdn.worldvectorlogo.com/logos/google-pay-primary-logo-1.svg' },
                  { name: 'Bitcoin', logo: 'https://cdn.worldvectorlogo.com/logos/bitcoin.svg' },
                  { name: 'Ethereum', logo: 'https://cdn.worldvectorlogo.com/logos/ethereum-1.svg' },
                  { name: 'Binance', logo: 'https://cdn.worldvectorlogo.com/logos/binance-coin-bnb.svg' },
                ])
            ).map((partner, i) => (
              <div
                key={`partner-${i}`}
                className="flex-shrink-0 mx-6 px-8 py-4 bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-dark-100 dark:border-dark-700 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                <img src={partner.logo} alt={partner.name} className="h-8 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={clsx(
            "relative rounded-3xl p-8 md:p-16 overflow-hidden",
            isGradient 
              ? "bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500" 
              : "bg-primary-500"
          )}>
            {/* Background pattern */}
            {isGradient && (
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,white_0%,transparent_50%)]" />
              </div>
            )}
            
            <div className="relative text-center text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                Join thousands of satisfied customers and experience the difference.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/hosting"
                  className="btn bg-white text-primary-600 hover:bg-dark-100 shadow-xl"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/contact"
                  className="btn bg-white/10 hover:bg-white/20 text-white border border-white/30"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

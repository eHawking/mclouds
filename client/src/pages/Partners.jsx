import { motion } from 'framer-motion'
import { Users2, TrendingUp, Users, Award, ArrowRight, CheckCircle, Globe, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const partnerTypes = [
  {
    title: 'Reseller Partners',
    icon: TrendingUp,
    description: 'Sell our cloud solutions under your brand and earn competitive commissions.',
    benefits: [
      'Up to 40% commission on sales',
      'White-label solutions available',
      'Dedicated partner support',
      'Marketing materials provided'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Affiliate Partners',
    icon: Users,
    description: 'Refer customers and earn recurring commissions for every successful signup.',
    benefits: [
      '20% recurring commission',
      'Real-time tracking dashboard',
      '30-day cookie duration',
      'Monthly payouts via PayPal/Wire'
    ],
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Technology Partners',
    icon: Zap,
    description: 'Integrate your software with our platform and reach thousands of customers.',
    benefits: [
      'API access and documentation',
      'Technical integration support',
      'Co-marketing opportunities',
      'Featured partner listing'
    ],
    color: 'from-orange-500 to-red-500'
  }
]

const partners = [
  { name: 'cPanel', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/CPanel_logo.svg' },
  { name: 'Plesk', logo: 'https://www.plesk.com/wp-content/uploads/2019/03/plesk-logo.svg' },
  { name: 'CloudLinux', logo: 'https://www.cloudlinux.com/images/logo.svg' },
  { name: 'LiteSpeed', logo: 'https://www.litespeedtech.com/images/logos/litespeed-logo.svg' },
  { name: 'WHMCS', logo: 'https://www.whmcs.com/assets/images/whmcs-logo-blue.svg' },
  { name: 'Softaculous', logo: 'https://www.softaculous.com/images/softaculous_logo.svg' }
]

const stats = [
  { value: '500+', label: 'Active Partners' },
  { value: '$2M+', label: 'Partner Earnings' },
  { value: '50+', label: 'Countries' },
  { value: '98%', label: 'Satisfaction Rate' }
]

export default function Partners() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
              <Users2 className="w-4 h-4" />
              Partner Program
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Grow Together With
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Magnetic Clouds
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Join our partner ecosystem and unlock new revenue streams while helping 
              businesses succeed with world-class cloud solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#programs" className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                View Programs
              </a>
              <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur">
                Apply Now
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-dark-900">
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
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-dark-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Programs */}
      <section id="programs" className="py-20 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Partner Programs
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
              Choose the program that best fits your business model and start earning today.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type, i) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-dark-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">{type.title}</h3>
                <p className="text-dark-600 dark:text-dark-300 mb-6">{type.description}</p>
                <ul className="space-y-3 mb-8">
                  {type.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-dark-700 dark:text-dark-200">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 bg-dark-900 dark:bg-primary-600 text-white font-semibold rounded-xl hover:bg-dark-800 dark:hover:bg-primary-700 transition-colors">
                  Apply Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Partners */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Our Technology Partners
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
              We work with industry-leading technology providers to deliver the best solutions.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {['cPanel', 'Plesk', 'CloudLinux', 'LiteSpeed', 'WHMCS', 'Softaculous'].map((partner, i) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-800 rounded-2xl"
              >
                <span className="text-lg font-bold text-dark-600 dark:text-dark-300">{partner}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Apply', desc: 'Fill out our simple partner application form' },
              { step: '2', title: 'Get Approved', desc: 'Our team reviews and approves your application' },
              { step: '3', title: 'Start Selling', desc: 'Access your partner dashboard and start promoting' },
              { step: '4', title: 'Earn Money', desc: 'Track earnings and get paid monthly' }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-dark-600 dark:text-dark-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Partner With Us?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join hundreds of successful partners and start growing your business today.
          </p>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
            Apply Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  )
}

import { motion } from 'framer-motion'
import { Briefcase, MapPin, Clock, ArrowRight, Users, Heart, Zap, Globe, Coffee, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

const jobs = [
  {
    title: 'Senior Backend Developer',
    department: 'Engineering',
    location: 'Dhaka, Bangladesh',
    type: 'Full-time',
    description: 'Build scalable cloud infrastructure and APIs that power thousands of businesses worldwide.'
  },
  {
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Remote',
    type: 'Full-time',
    description: 'Manage and optimize our global datacenter infrastructure and deployment pipelines.'
  },
  {
    title: 'Customer Success Manager',
    department: 'Support',
    location: 'Dhaka, Bangladesh',
    type: 'Full-time',
    description: 'Help our enterprise clients succeed and grow with our cloud solutions.'
  },
  {
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create beautiful, intuitive interfaces for our control panel and customer portal.'
  },
  {
    title: 'Sales Executive',
    department: 'Sales',
    location: 'Dhaka, Bangladesh',
    type: 'Full-time',
    description: 'Drive growth by connecting businesses with the right cloud solutions.'
  }
]

const benefits = [
  { icon: Heart, title: 'Health Insurance', description: 'Comprehensive health coverage for you and your family' },
  { icon: Coffee, title: 'Flexible Hours', description: 'Work when you\'re most productive' },
  { icon: Globe, title: 'Remote Options', description: 'Work from anywhere in the world' },
  { icon: GraduationCap, title: 'Learning Budget', description: 'Annual budget for courses and conferences' },
  { icon: Zap, title: 'Latest Tech', description: 'Best tools and equipment provided' },
  { icon: Users, title: 'Great Team', description: 'Collaborative and supportive culture' }
]

export default function Careers() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
              <Briefcase className="w-4 h-4" />
              Join Our Team
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Build the Future of
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Cloud Computing
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Join a team of passionate innovators building world-class cloud infrastructure 
              that empowers businesses across the globe.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#positions" className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                View Open Positions
              </a>
              <Link to="/about" className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur">
                Learn About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50+', label: 'Team Members' },
              { value: '15+', label: 'Countries' },
              { value: '4.9', label: 'Glassdoor Rating' },
              { value: '95%', label: 'Retention Rate' }
            ].map((stat, i) => (
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

      {/* Benefits */}
      <section className="py-20 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Why Work With Us?
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
              We believe in taking care of our team so they can focus on what matters most.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white dark:bg-dark-700 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-dark-600 dark:text-dark-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 dark:text-white mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300 max-w-2xl mx-auto">
              Find your perfect role and help us shape the future of cloud technology.
            </p>
          </motion.div>

          <div className="space-y-4">
            {jobs.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-gray-50 dark:bg-dark-800 rounded-2xl hover:bg-primary-50 dark:hover:bg-dark-700 transition-colors cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-dark-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-dark-600 dark:text-dark-300 mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-dark-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {job.type}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Don't See the Right Role?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            We're always looking for talented people. Send us your resume and we'll keep you in mind.
          </p>
          <a href="mailto:careers@magneticclouds.com" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
            Send Your Resume <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  )
}

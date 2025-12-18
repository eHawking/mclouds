import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Clock, Server, Globe, Database, Shield, Mail, Activity, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const services = [
  { name: 'Web Hosting Servers', status: 'operational', uptime: '99.99%', icon: Server },
  { name: 'VPS Infrastructure', status: 'operational', uptime: '99.98%', icon: Database },
  { name: 'Cloud Platform', status: 'operational', uptime: '99.99%', icon: Globe },
  { name: 'DNS Services', status: 'operational', uptime: '100%', icon: Globe },
  { name: 'Email Servers', status: 'operational', uptime: '99.97%', icon: Mail },
  { name: 'SSL/TLS Services', status: 'operational', uptime: '100%', icon: Shield },
  { name: 'Control Panel', status: 'operational', uptime: '99.99%', icon: Server },
  { name: 'API Gateway', status: 'operational', uptime: '99.99%', icon: Activity }
]

const incidents = [
  {
    date: 'Dec 5, 2025',
    title: 'Scheduled Maintenance - Network Upgrade',
    status: 'completed',
    description: 'Scheduled network infrastructure upgrade completed successfully. All systems operational.',
    duration: '2 hours'
  },
  {
    date: 'Nov 28, 2025',
    title: 'Brief DNS Latency',
    status: 'resolved',
    description: 'DNS resolution experienced minor latency for approximately 15 minutes. Issue identified and resolved.',
    duration: '15 minutes'
  },
  {
    date: 'Nov 15, 2025',
    title: 'Scheduled Maintenance - Security Patches',
    status: 'completed',
    description: 'Applied critical security updates across all servers. No service disruption.',
    duration: '1 hour'
  }
]

const uptimeData = [
  { month: 'Jul', uptime: 99.99 },
  { month: 'Aug', uptime: 99.98 },
  { month: 'Sep', uptime: 100 },
  { month: 'Oct', uptime: 99.99 },
  { month: 'Nov', uptime: 99.97 },
  { month: 'Dec', uptime: 99.99 }
]

const getStatusIcon = (status) => {
  switch (status) {
    case 'operational': return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'degraded': return <AlertCircle className="w-5 h-5 text-yellow-500" />
    case 'outage': return <XCircle className="w-5 h-5 text-red-500" />
    default: return <CheckCircle className="w-5 h-5 text-green-500" />
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'operational': return 'bg-green-500'
    case 'degraded': return 'bg-yellow-500'
    case 'outage': return 'bg-red-500'
    default: return 'bg-green-500'
  }
}

export default function SystemStatus() {
  const [expandedIncident, setExpandedIncident] = useState(null)
  const overallStatus = services.every(s => s.status === 'operational') ? 'operational' : 'degraded'

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className={`absolute inset-0 ${overallStatus === 'operational' ? 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700' : 'bg-gradient-to-br from-yellow-600 via-orange-600 to-red-700'}`} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              {overallStatus === 'operational' ? (
                <CheckCircle className="w-12 h-12 text-white" />
              ) : (
                <AlertCircle className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {overallStatus === 'operational' ? 'All Systems Operational' : 'Some Systems Degraded'}
            </h1>
            <p className="text-xl text-white/80 mb-2">
              Last updated: {new Date().toLocaleString()}
            </p>
            <p className="text-white/60">
              Average uptime this month: <span className="font-bold text-white">99.99%</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Uptime Overview */}
      <section className="py-12 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-white mb-6">6-Month Uptime History</h2>
          <div className="grid grid-cols-6 gap-2">
            {uptimeData.map((data) => (
              <div key={data.month} className="text-center">
                <div className="h-24 bg-dark-800 rounded-lg flex items-end justify-center p-2 mb-2">
                  <div
                    className={`w-full rounded ${data.uptime >= 99.95 ? 'bg-green-500' : data.uptime >= 99.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ height: `${(data.uptime - 99) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-dark-400">{data.month}</p>
                <p className="text-sm font-bold text-white">{data.uptime}%</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-16 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
              Service Status
            </h2>
            <p className="text-dark-600 dark:text-dark-300">
              Current status of all Magnetic Clouds services
            </p>
          </motion.div>

          <div className="space-y-3">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-dark-600 rounded-lg flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-dark-900 dark:text-white">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-dark-500">Uptime: {service.uptime}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <span className={`text-sm font-medium capitalize ${
                      service.status === 'operational' ? 'text-green-600' :
                      service.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
              Recent Incidents
            </h2>
            <p className="text-dark-600 dark:text-dark-300">
              Past incidents and maintenance windows
            </p>
          </motion.div>

          <div className="space-y-4">
            {incidents.map((incident, i) => (
              <motion.div
                key={incident.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 dark:bg-dark-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIncident(expandedIncident === i ? null : i)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      incident.status === 'completed' || incident.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div className="text-left">
                      <h3 className="font-semibold text-dark-900 dark:text-white">{incident.title}</h3>
                      <p className="text-sm text-dark-500">{incident.date} • Duration: {incident.duration}</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-dark-400 transition-transform ${expandedIncident === i ? 'rotate-180' : ''}`} />
                </button>
                {expandedIncident === i && (
                  <div className="px-4 pb-4 pl-11">
                    <p className="text-dark-600 dark:text-dark-300">{incident.description}</p>
                    <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                      incident.status === 'completed' || incident.status === 'resolved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Informed
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Subscribe to receive notifications about service status and maintenance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

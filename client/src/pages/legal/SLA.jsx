import { motion } from 'framer-motion'
import { Shield, Clock, CheckCircle, AlertCircle, FileText, TrendingUp } from 'lucide-react'

const slaMetrics = [
  {
    service: 'Web Hosting',
    uptime: '99.9%',
    credit: '10% per 0.1% below SLA',
    support: '< 4 hours'
  },
  {
    service: 'VPS Servers',
    uptime: '99.95%',
    credit: '15% per 0.1% below SLA',
    support: '< 2 hours'
  },
  {
    service: 'Cloud Platform',
    uptime: '99.99%',
    credit: '20% per 0.01% below SLA',
    support: '< 1 hour'
  },
  {
    service: 'Dedicated Servers',
    uptime: '99.99%',
    credit: '25% per 0.01% below SLA',
    support: '< 30 minutes'
  }
]

export default function SLA() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
              <Shield className="w-4 h-4" />
              Service Level Agreement
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Commitment to You
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Industry-leading uptime guarantees backed by service credits
            </p>
            <p className="text-white/60 mt-4">
              Last Updated: December 1, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* SLA Overview */}
      <section className="py-16 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: TrendingUp, value: '99.99%', label: 'Uptime Guarantee' },
              { icon: Clock, value: '< 15min', label: 'Response Time' },
              { icon: Shield, value: '100%', label: 'Credit Coverage' },
              { icon: CheckCircle, value: '24/7', label: 'Monitoring' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-white dark:bg-dark-700 rounded-2xl text-center"
              >
                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-dark-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* SLA Table */}
          <div className="bg-white dark:bg-dark-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-dark-600">
              <h2 className="text-xl font-bold text-dark-900 dark:text-white">Service Level Commitments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-700 dark:text-dark-200">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-700 dark:text-dark-200">Uptime SLA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-700 dark:text-dark-200">Service Credit</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-700 dark:text-dark-200">Support Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
                  {slaMetrics.map((item) => (
                    <tr key={item.service}>
                      <td className="px-6 py-4 font-medium text-dark-900 dark:text-white">{item.service}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                          {item.uptime}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-600 dark:text-dark-300">{item.credit}</td>
                      <td className="px-6 py-4 text-dark-600 dark:text-dark-300">{item.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SLA Terms */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Uptime Guarantee</h2>
            <p>
              Magnetic Clouds guarantees the availability of its services as specified in the Service Level 
              Commitments table above. "Uptime" is calculated as follows:
            </p>
            <p className="bg-gray-50 dark:bg-dark-800 p-4 rounded-xl font-mono text-sm">
              Uptime % = ((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) × 100
            </p>

            <h2>2. Excluded Downtime</h2>
            <p>The following events are not counted as downtime:</p>
            <ul>
              <li>Scheduled maintenance (announced 72 hours in advance)</li>
              <li>Emergency security patches (announced when possible)</li>
              <li>Issues caused by customer actions or third-party services</li>
              <li>DNS propagation delays</li>
              <li>Force majeure events</li>
              <li>Issues beyond our network (upstream providers, Internet backbone)</li>
            </ul>

            <h2>3. Service Credits</h2>
            <p>
              If we fail to meet our SLA commitments, you are entitled to service credits as outlined in 
              the Service Level Commitments table. Credits are calculated as a percentage of your monthly 
              service fee.
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl">
              <h3 className="text-primary-700 dark:text-primary-400 mt-0">Credit Calculation Example</h3>
              <p className="mb-0">
                If your VPS service (99.95% SLA) experiences 99.85% uptime in a month, you would receive 
                a 15% credit (0.1% below SLA × 15%) on your monthly fee.
              </p>
            </div>

            <h2>4. Claiming Credits</h2>
            <p>To claim service credits:</p>
            <ol>
              <li>Submit a support ticket within 30 days of the incident</li>
              <li>Include the date, time, and duration of the outage</li>
              <li>Provide any relevant documentation or error messages</li>
              <li>Credits will be applied to your next billing cycle</li>
            </ol>

            <h2>5. Maximum Credits</h2>
            <p>
              Service credits are capped at 100% of the monthly fee for the affected service. Credits 
              do not accumulate across months and cannot be redeemed for cash.
            </p>

            <h2>6. Support Response Times</h2>
            <p>Our support team commits to the following initial response times:</p>
            <ul>
              <li><strong>Critical (Service Down):</strong> 15 minutes</li>
              <li><strong>High (Major Impact):</strong> 1 hour</li>
              <li><strong>Medium (Minor Impact):</strong> 4 hours</li>
              <li><strong>Low (General Inquiry):</strong> 24 hours</li>
            </ul>

            <h2>7. Monitoring & Reporting</h2>
            <p>
              We continuously monitor all services and publish real-time status updates at our 
              <a href="/status" className="text-primary-600"> System Status</a> page. Monthly uptime 
              reports are available upon request.
            </p>

            <h2>8. Changes to SLA</h2>
            <p>
              We may update this SLA from time to time. Changes will be announced 30 days in advance 
              and will not apply retroactively to existing incidents.
            </p>

            <h2>9. Contact</h2>
            <p>
              For SLA-related inquiries or to claim service credits, contact us at:
            </p>
            <ul>
              <li>Email: sla@magneticclouds.com</li>
              <li>Support Portal: dashboard.magneticclouds.com/tickets</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

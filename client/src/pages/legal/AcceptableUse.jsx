import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const prohibited = [
  'Illegal content including child exploitation material',
  'Phishing sites or fraud operations',
  'Malware, viruses, or ransomware distribution',
  'Spam or unsolicited bulk email',
  'Copyright or trademark infringement',
  'DDoS attacks or network abuse',
  'Cryptocurrency mining without authorization',
  'Proxy or anonymization services for illegal activities',
  'Pirated software distribution',
  'Hate speech or content promoting violence'
]

const allowed = [
  'Legitimate business websites and applications',
  'E-commerce and online stores',
  'Personal blogs and portfolios',
  'SaaS applications',
  'Development and testing environments',
  'Content management systems',
  'Email marketing (opt-in only)',
  'Gaming servers (licensed games)',
  'Educational platforms',
  'Non-profit organization websites'
]

export default function AcceptableUse() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-primary-900" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
              <FileText className="w-4 h-4" />
              Legal Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Acceptable Use Policy
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Guidelines for responsible use of Magnetic Clouds services
            </p>
            <p className="text-white/60 mt-4">
              Effective Date: December 1, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-12 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Prohibited */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-700 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-dark-900 dark:text-white">Prohibited Activities</h2>
              </div>
              <ul className="space-y-3">
                {prohibited.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-dark-600 dark:text-dark-300">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Allowed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-700 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-dark-900 dark:text-white">Permitted Uses</h2>
              </div>
              <ul className="space-y-3">
                {allowed.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-dark-600 dark:text-dark-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Policy */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              This Acceptable Use Policy ("AUP") governs your use of Magnetic Clouds services. By using 
              our services, you agree to comply with this policy. We reserve the right to suspend or 
              terminate services for violations.
            </p>

            <h2>2. Prohibited Content</h2>
            <p>You may not host, store, or transmit content that:</p>
            <ul>
              <li>Violates any applicable law or regulation</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains malware, viruses, or malicious code</li>
              <li>Promotes illegal activities or violence</li>
              <li>Constitutes harassment, defamation, or threats</li>
              <li>Contains child exploitation material (zero tolerance)</li>
              <li>Deceives users (phishing, scams, fraud)</li>
            </ul>

            <h2>3. Prohibited Activities</h2>
            <p>The following activities are strictly prohibited:</p>
            
            <h3>3.1 Network Abuse</h3>
            <ul>
              <li>Launching DDoS attacks or participating in botnets</li>
              <li>Port scanning or network probing without authorization</li>
              <li>Attempting to gain unauthorized access to systems</li>
              <li>Interfering with other customers' services</li>
            </ul>

            <h3>3.2 Email Abuse</h3>
            <ul>
              <li>Sending spam or unsolicited bulk email</li>
              <li>Email spoofing or phishing</li>
              <li>Operating open mail relays</li>
              <li>Harvesting email addresses</li>
            </ul>

            <h3>3.3 Resource Abuse</h3>
            <ul>
              <li>Cryptocurrency mining without explicit authorization</li>
              <li>Running processes that negatively impact shared resources</li>
              <li>Circumventing resource limits</li>
            </ul>

            <h2>4. Security Requirements</h2>
            <p>You are responsible for:</p>
            <ul>
              <li>Keeping your software and applications updated</li>
              <li>Using strong, unique passwords</li>
              <li>Securing your server against unauthorized access</li>
              <li>Promptly addressing security vulnerabilities</li>
              <li>Reporting any security incidents to our team</li>
            </ul>

            <h2>5. Compliance</h2>
            <p>
              You must comply with all applicable laws, including but not limited to:
            </p>
            <ul>
              <li>Data protection and privacy laws (GDPR, CCPA, etc.)</li>
              <li>Export control regulations</li>
              <li>Intellectual property laws</li>
              <li>Consumer protection laws</li>
            </ul>

            <h2>6. Enforcement</h2>
            <p>
              We actively monitor for policy violations and may take the following actions:
            </p>
            <ul>
              <li><strong>Warning:</strong> For first-time minor violations</li>
              <li><strong>Suspension:</strong> For serious or repeated violations</li>
              <li><strong>Termination:</strong> For severe violations or illegal activity</li>
              <li><strong>Legal Action:</strong> When required by law or to protect our rights</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-xl my-8">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-800 dark:text-yellow-400 mt-0">Zero Tolerance Policy</h3>
                  <p className="mb-0 text-yellow-700 dark:text-yellow-300">
                    We have zero tolerance for child exploitation material, terrorism-related content, 
                    and activities that pose immediate harm. Such violations result in immediate termination 
                    and reporting to law enforcement.
                  </p>
                </div>
              </div>
            </div>

            <h2>7. Reporting Violations</h2>
            <p>
              If you become aware of any violations of this policy, please report them immediately:
            </p>
            <ul>
              <li>Email: <a href="mailto:abuse@magneticclouds.com">abuse@magneticclouds.com</a></li>
              <li>Report Form: <Link to="/report-abuse">magneticclouds.com/report-abuse</Link></li>
            </ul>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this policy at any time. Significant changes will be communicated via email 
              or dashboard notification. Continued use of our services constitutes acceptance of 
              the updated policy.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              For questions about this Acceptable Use Policy, contact:
            </p>
            <ul>
              <li>Email: legal@magneticclouds.com</li>
              <li>Address: Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-dark-600 dark:text-dark-300 mb-6">
            Have questions about acceptable use or need to report a violation?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
              Contact Us
            </Link>
            <Link to="/report-abuse" className="px-6 py-3 bg-dark-900 dark:bg-white text-white dark:text-dark-900 rounded-xl hover:bg-dark-800 dark:hover:bg-gray-100 transition-colors">
              Report Abuse
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

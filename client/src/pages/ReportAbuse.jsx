import { motion } from 'framer-motion'
import { AlertTriangle, Shield, Send, FileText, Mail, Globe, Server, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const abuseTypes = [
  { id: 'spam', label: 'Spam/Unsolicited Email', icon: Mail },
  { id: 'phishing', label: 'Phishing/Fraud', icon: Shield },
  { id: 'malware', label: 'Malware/Virus Distribution', icon: AlertTriangle },
  { id: 'copyright', label: 'Copyright Infringement', icon: FileText },
  { id: 'illegal', label: 'Illegal Content', icon: Server },
  { id: 'ddos', label: 'DDoS/Network Attack', icon: Globe },
  { id: 'other', label: 'Other Abuse', icon: AlertTriangle }
]

export default function ReportAbuse() {
  const [formData, setFormData] = useState({
    abuseType: '',
    url: '',
    ip: '',
    email: '',
    description: '',
    evidence: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">
            Report Submitted
          </h1>
          <p className="text-dark-600 dark:text-dark-300 mb-8">
            Thank you for reporting this issue. Our abuse team will investigate and take appropriate action within 24-48 hours.
          </p>
          <p className="text-sm text-dark-500 mb-8">
            Reference ID: <span className="font-mono font-bold">ABU-{Date.now().toString(36).toUpperCase()}</span>
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Submit Another Report
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
              <Shield className="w-4 h-4" />
              Abuse Report Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Report Abuse
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Help us maintain a safe and secure hosting environment by reporting any abuse or violations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-dark-700 rounded-xl">
              <AlertTriangle className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="font-bold text-dark-900 dark:text-white mb-2">What to Report</h3>
              <p className="text-sm text-dark-600 dark:text-dark-300">
                Spam, phishing, malware, copyright violations, illegal content, or any Terms of Service violations.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-dark-700 rounded-xl">
              <Shield className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-dark-900 dark:text-white mb-2">Our Commitment</h3>
              <p className="text-sm text-dark-600 dark:text-dark-300">
                We investigate all reports within 24-48 hours and take appropriate action to maintain platform integrity.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-dark-700 rounded-xl">
              <Mail className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="font-bold text-dark-900 dark:text-white mb-2">Direct Contact</h3>
              <p className="text-sm text-dark-600 dark:text-dark-300">
                For urgent issues, email us directly at <span className="font-bold">abuse@magneticclouds.com</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Report Form */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-8">
              Submit Abuse Report
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Abuse Type */}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-200 mb-3">
                  Type of Abuse *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {abuseTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, abuseType: type.id })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.abuseType === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                      }`}
                    >
                      <type.icon className={`w-5 h-5 mb-2 ${formData.abuseType === type.id ? 'text-primary-600' : 'text-dark-400'}`} />
                      <span className={`text-sm font-medium ${formData.abuseType === type.id ? 'text-primary-600' : 'text-dark-700 dark:text-dark-200'}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL/Domain */}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-200 mb-2">
                  URL or Domain Involved *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/abusive-page"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* IP Address */}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-200 mb-2">
                  IP Address (if known)
                </label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Your Email */}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-200 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-200 mb-2">
                  Description of Abuse *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please provide detailed information about the abuse..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Evidence */}
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-200 mb-2">
                  Supporting Evidence (URLs, screenshots links, etc.)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste links to evidence, screenshots, email headers, etc."
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Abuse Report
              </button>

              <p className="text-sm text-dark-500 text-center">
                By submitting this report, you confirm that the information provided is accurate to the best of your knowledge.
              </p>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

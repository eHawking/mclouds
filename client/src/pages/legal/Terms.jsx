import { Helmet } from 'react-helmet-async'
import { Shield, FileText, CreditCard, Server, AlertTriangle, Clock, RefreshCw, XCircle, Scale, Mail } from 'lucide-react'

const sections = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    content: `By accessing, browsing, or using Magnetic Clouds services (including our website at clouds.hassanscode.com), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

These terms apply to all users, including visitors, registered users, and customers who purchase our hosting, domain, VPS, cloud server, and related services.`
  },
  {
    icon: Server,
    title: '2. Services Provided',
    content: `Magnetic Clouds provides the following services:
• VPS Hosting - Virtual Private Server solutions with dedicated resources
• Cloud Servers - Scalable cloud infrastructure with auto-scaling capabilities
• Dedicated Servers - Full bare-metal server solutions
• Domain Registration - Domain name registration and management
• SSL Certificates - Secure Socket Layer certificates for website security
• Website Backup - Automated daily backup solutions
• Professional Email - Business email hosting solutions
• Web Development - Custom website and application development
• NoBot AI - AI-powered chatbot solutions
• SEO Tools - Search engine optimization tools and services

All services are subject to availability and our technical specifications as listed on our website.`
  },
  {
    icon: Shield,
    title: '3. Account Registration & Security',
    content: `To use our services, you must:
• Provide accurate, current, and complete registration information
• Maintain and promptly update your account information
• Keep your password secure and confidential
• Notify us immediately of any unauthorized use of your account
• Be at least 18 years of age or have parental consent

You are solely responsible for all activities that occur under your account. Magnetic Clouds is not liable for any loss or damage arising from your failure to maintain account security.`
  },
  {
    icon: CreditCard,
    title: '4. Payment Terms & Billing',
    content: `• All services are billed in advance on a recurring basis (monthly, quarterly, annually, or as specified)
• Payments are processed securely through our payment partners (bKash, Nagad, credit/debit cards)
• Prices are listed in BDT (Bangladeshi Taka) and USD and are subject to change with 30 days prior notice
• Failed payments may result in service suspension after a 7-day grace period
• Taxes may apply based on your location and local regulations
• All fees are non-refundable except as specified in our Refund Policy`
  },
  {
    icon: AlertTriangle,
    title: '5. Acceptable Use Policy',
    content: `You agree NOT to use Magnetic Clouds services for:
• Hosting, distributing, or linking to malicious software, viruses, or malware
• Sending spam, unsolicited bulk emails, or phishing attempts
• Hosting content that infringes on intellectual property rights
• Mining cryptocurrency without explicit written authorization
• Hosting adult content, gambling sites, or illegal material
• Conducting DDoS attacks or other malicious network activities
• Storing or distributing pirated software, movies, or music
• Any activity that violates local, national, or international laws
• Excessive resource usage that affects other customers

Violation of this policy may result in immediate account suspension without refund.`
  },
  {
    icon: Clock,
    title: '6. Service Level Agreement (SLA)',
    content: `Magnetic Clouds guarantees:
• 99.9% network uptime for all hosting services
• 99.95% uptime for VPS and Cloud servers
• 99.99% uptime for Dedicated servers

For downtime exceeding these guarantees, customers are eligible for service credits:
• 10% credit for 99.0% - 99.9% monthly uptime
• 25% credit for 98.0% - 99.0% monthly uptime
• 50% credit for below 98.0% monthly uptime

Credits must be requested within 30 days of the incident and apply only to hosting fees, not domain registrations or one-time services.`
  },
  {
    icon: RefreshCw,
    title: '7. Refund Policy',
    content: `• VPS & Cloud Hosting: 7-day money-back guarantee for new customers
• Dedicated Servers: 3-day money-back guarantee for new customers
• Domain Registrations: Non-refundable after registration is processed
• SSL Certificates: Refundable within 7 days if not yet issued
• One-time Services (Web Development, Bug Smash): Non-refundable once work has commenced

To request a refund, contact support@magneticclouds.com with your order details. Refunds are processed within 7-10 business days to the original payment method.`
  },
  {
    icon: XCircle,
    title: '8. Termination & Suspension',
    content: `Magnetic Clouds reserves the right to:
• Suspend services immediately for suspected abuse or security threats
• Terminate accounts that violate these Terms of Service
• Suspend services for non-payment after the grace period
• Terminate inactive accounts after 12 months of inactivity

Upon termination:
• All data will be deleted after 30 days unless otherwise arranged
• Outstanding balances remain due and payable
• Domain names may be released after the registration period expires`
  },
  {
    icon: Scale,
    title: '9. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW:
• Magnetic Clouds shall not be liable for any indirect, incidental, special, consequential, or punitive damages
• Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim
• We are not responsible for data loss due to customer negligence or third-party actions
• We do not guarantee that services will be uninterrupted or error-free

You agree to indemnify and hold Magnetic Clouds harmless from any claims arising from your use of our services or violation of these terms.`
  },
  {
    icon: Mail,
    title: '10. Contact Information',
    content: `For questions, concerns, or disputes regarding these Terms of Service:

Email: legal@magneticclouds.com
Support: support@magneticclouds.com
Website: clouds.hassanscode.com

Magnetic Clouds
Dhaka, Bangladesh

These terms are governed by the laws of Bangladesh. Any disputes shall be resolved in the courts of Dhaka, Bangladesh.`
  }
]

export default function Terms() {
  return (
    <>
      <Helmet><title>Terms of Service - Magnetic Clouds</title></Helmet>
      <div className="min-h-screen bg-gradient-to-b from-dark-50 to-white dark:from-dark-950 dark:to-dark-900">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-bold font-display">Terms of Service</h1>
            <p className="mt-4 text-lg text-white/80">Please read these terms carefully before using our services</p>
            <p className="mt-2 text-sm text-white/60">Last updated: December 15, 2024</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
            {sections.map((section, index) => (
              <div 
                key={section.title}
                className={`p-6 md:p-8 ${index !== sections.length - 1 ? 'border-b border-dark-200 dark:border-dark-700' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">{section.title}</h2>
                    <div className="text-dark-600 dark:text-dark-400 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agreement Notice */}
          <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800">
            <p className="text-center text-dark-700 dark:text-dark-300">
              By using Magnetic Clouds services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our{' '}
              <a href="/legal/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

import { Helmet } from 'react-helmet-async'

export default function Privacy() {
  return (
    <>
      <Helmet><title>Privacy Policy - Magnetic Clouds</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-dark-500">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly, including name, email, billing information, and account credentials.</p>
          
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To process payments and transactions</li>
            <li>To send important service updates</li>
            <li>To provide customer support</li>
            <li>To improve our services</li>
          </ul>
          
          <h2>3. Data Security</h2>
          <p>We implement industry-standard security measures including encryption, firewalls, and secure data centers.</p>
          
          <h2>4. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with service providers who assist in operations.</p>
          
          <h2>5. Cookies</h2>
          <p>We use cookies to improve user experience and analyze website traffic.</p>
          
          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time.</p>
          
          <h2>7. Contact</h2>
          <p>For privacy inquiries, contact privacy@magneticclouds.com</p>
        </div>
      </div>
    </>
  )
}

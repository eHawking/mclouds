import { Helmet } from 'react-helmet-async'
import { CheckCircle, Clock, Shield } from 'lucide-react'

export default function Refund() {
  return (
    <>
      <Helmet><title>Refund Policy - Magnetic Clouds</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold mb-4">45-Day Money Back Guarantee</h1>
        <p className="text-lg text-dark-500 mb-12">We stand behind our services with a risk-free guarantee.</p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 text-center">
            <Shield className="w-12 h-12 text-green-500 mx-auto" />
            <h3 className="mt-4 font-bold">Risk-Free</h3>
            <p className="text-sm text-dark-500 mt-2">Try our services with confidence</p>
          </div>
          <div className="card p-6 text-center">
            <Clock className="w-12 h-12 text-blue-500 mx-auto" />
            <h3 className="mt-4 font-bold">45 Days</h3>
            <p className="text-sm text-dark-500 mt-2">Longest guarantee in the industry</p>
          </div>
          <div className="card p-6 text-center">
            <CheckCircle className="w-12 h-12 text-primary-500 mx-auto" />
            <h3 className="mt-4 font-bold">No Questions</h3>
            <p className="text-sm text-dark-500 mt-2">Full refund, no hassle</p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Eligible Services</h2>
          <ul>
            <li><strong>Shared Hosting:</strong> 45-day money-back guarantee</li>
            <li><strong>VPS Servers:</strong> 7-day money-back guarantee</li>
            <li><strong>Cloud Servers:</strong> 7-day money-back guarantee</li>
            <li><strong>Dedicated Servers:</strong> 7-day money-back guarantee</li>
          </ul>
          
          <h2>Non-Refundable Items</h2>
          <ul>
            <li>Domain registrations and transfers</li>
            <li>SSL certificates (after issuance)</li>
            <li>Setup fees</li>
            <li>Add-on services</li>
          </ul>
          
          <h2>How to Request a Refund</h2>
          <ol>
            <li>Log into your account dashboard</li>
            <li>Open a support ticket in the Billing department</li>
            <li>Request cancellation and refund</li>
            <li>Refunds are processed within 5-7 business days</li>
          </ol>
          
          <h2>Contact</h2>
          <p>For refund inquiries, contact billing@magneticclouds.com</p>
        </div>
      </div>
    </>
  )
}

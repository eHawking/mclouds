import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, CheckCircle, Building2, Banknote, Upload, X, Loader2, Smartphone, Wallet, Mail, MapPin, User, Shield, RefreshCcw, Star, Zap, Clock, Award } from 'lucide-react'
import { useCartStore, useCurrencyStore, useAuthStore } from '../store/useStore'
import { ordersAPI, paymentsAPI, settingsAPI, authAPI } from '../lib/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Service reviews for checkout - expanded list for rotation
const serviceReviews = [
  { name: 'Sarah M.', service: 'VPS Hosting', rating: 5, comment: 'Blazing fast servers! My website loads in under 1 second now.', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Ahmed W.', service: 'Dedicated Server', rating: 5, comment: 'Best support team I\'ve ever worked with. 24/7 availability!', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Emily C.', service: 'Cloud Server', rating: 5, comment: 'Seamless migration experience. Zero downtime during transfer.', img: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { name: 'Hassan S.', service: 'VPS Professional', rating: 5, comment: 'Incredible performance for the price. Highly recommended!', img: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { name: 'Lisa P.', service: 'Cloud Enterprise', rating: 5, comment: 'Scaled from 100 to 10,000 users without any issues.', img: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { name: 'Michael T.', service: 'Dedicated Server', rating: 5, comment: 'Security features are top-notch. DDoS protection works great.', img: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Jennifer L.', service: 'Domain + Hosting', rating: 5, comment: 'One-stop shop for all my hosting needs. Love the bundle deals!', img: 'https://randomuser.me/api/portraits/women/55.jpg' },
  { name: 'David C.', service: 'VPS Starter', rating: 5, comment: 'Perfect for my startup. Easy to upgrade as we grow.', img: 'https://randomuser.me/api/portraits/men/52.jpg' },
  { name: 'Amanda F.', service: 'SSL + Hosting', rating: 5, comment: 'Free SSL certificate included. Great value for money!', img: 'https://randomuser.me/api/portraits/women/77.jpg' },
  { name: 'Robert M.', service: 'Game Server', rating: 5, comment: 'Low latency gaming servers. My players are very happy!', img: 'https://randomuser.me/api/portraits/men/67.jpg' },
]

const trustBadges = [
  { icon: Shield, label: '256-bit SSL', desc: 'Encrypted' },
  { icon: RefreshCcw, label: '45 Days', desc: 'Money Back' },
  { icon: Zap, label: '99.9%', desc: 'Uptime' },
  { icon: Clock, label: '24/7', desc: 'Support' },
]

const getPaymentMethods = (settings) => {
  const methods = []
  if (settings.stripe_enabled) {
    methods.push({ id: 'card', name: 'Credit/Debit Card', icon: CreditCard, requiresProof: false, isStripe: true, color: 'from-[#635BFF] to-[#8B7DFF]' })
  }
  if (settings.paypal_enabled) {
    methods.push({ id: 'paypal', name: 'PayPal', icon: Wallet, requiresProof: true, color: 'from-[#003087] to-[#009cde]' })
  }
  if (settings.bkash_enabled) {
    methods.push({ id: 'bkash', name: 'bKash', icon: Smartphone, requiresProof: true, color: 'from-[#E2136E] to-[#ff4d94]', details: settings.bkash_details })
  }
  if (settings.rocket_enabled) {
    methods.push({ id: 'rocket', name: 'Rocket', icon: Smartphone, requiresProof: true, color: 'from-[#8C3494] to-[#b94dc2]', details: settings.rocket_details })
  }
  if (settings.bank_transfer_enabled) {
    methods.push({ id: 'bank', name: 'Bank Transfer', icon: Building2, requiresProof: true, color: 'from-emerald-600 to-emerald-400', details: settings.bank_details })
  }
  if (settings.cash_payment_enabled) {
    methods.push({ id: 'cash', name: 'Cash Payment', icon: Banknote, requiresProof: true, color: 'from-amber-600 to-amber-400' })
  }
  return methods
}

// Stripe Card Input Styles
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
}

// Stripe-enabled checkout form (uses Stripe hooks)
function StripeCheckoutForm({ paymentSettings }) {
  const stripe = useStripe()
  const elements = useElements()
  return <CheckoutFormInner stripeEnabled={true} stripe={stripe} elements={elements} paymentSettings={paymentSettings} />
}

// Main checkout form component
function CheckoutFormInner({ stripeEnabled, stripe = null, elements = null, paymentSettings = {} }) {
  const navigate = useNavigate()
  const { items, coupon, getTotal, clearCart } = useCartStore()
  const { format } = useCurrencyStore()
  const { user, isAuthenticated, login } = useAuthStore()
  const { subtotal, discount, total } = getTotal()
  const [loading, setLoading] = useState(false)
  
  const paymentMethods = getPaymentMethods({ ...paymentSettings, stripe_enabled: stripeEnabled })
  
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]?.id || 'card')
  const [paymentProof, setPaymentProof] = useState(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState(null)
  const [cardComplete, setCardComplete] = useState(false)
  
  // Guest checkout fields
  const guestEmail = sessionStorage.getItem('guestEmail') || ''
  const [email, setEmail] = useState(user?.email || guestEmail)
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  // Auto-rotate reviews every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex(prev => (prev + 1) % serviceReviews.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const selectedMethod = paymentMethods.find(m => m.id === paymentMethod)

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentProof(reader.result)
        setPaymentProofPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProof = () => {
    setPaymentProof(null)
    setPaymentProofPreview(null)
  }

  const handleCheckout = async () => {
    // Validate required fields
    if (!email || !firstName || !lastName) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service to continue')
      return
    }
    
    if (selectedMethod?.requiresProof && !paymentProof) {
      toast.error('Please upload payment proof')
      return
    }

    // Validate Stripe card if card payment selected
    if (paymentMethod === 'card' && stripeEnabled) {
      if (!stripe || !elements) {
        toast.error('Payment system not ready. Please try again.')
        return
      }
      if (!cardComplete) {
        toast.error('Please complete your card details')
        return
      }
    }

    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        type: item.type || 'product',
        product_uuid: item.product_uuid || item.uuid || item.id,
        domain_name: item.domain_name,
        tld: item.tld,
        action: item.action,
        billing_cycle: item.billingCycle,
        product_type: item.product_type,
        years: item.years,
        quantity: item.quantity || 1,
        price: item.price,
        name: item.name
      }))

      // For guest checkout, create account first
      let userToken = null
      let createdUser = null
      if (!isAuthenticated) {
        try {
          const registerRes = await authAPI.guestCheckout({
            email,
            first_name: firstName,
            last_name: lastName,
            address,
            city,
            country
          })
          userToken = registerRes.data.token
          createdUser = registerRes.data.user
          // Auto login
          login(createdUser, userToken)
        } catch (regErr) {
          console.error('Guest checkout error:', regErr.response?.data, regErr.message)
          const errorMsg = regErr.response?.data?.error || regErr.message || 'Failed to create account'
          // If user exists, show specific message
          if (errorMsg.toLowerCase().includes('exist') || errorMsg.toLowerCase().includes('duplicate')) {
            toast.error('An account with this email already exists. Please login first.')
          } else {
            toast.error(errorMsg)
          }
          setLoading(false)
          return
        }
      }

      // Create order
      const orderRes = await ordersAPI.create({
        items: orderItems,
        coupon_code: coupon?.code,
        payment_method: paymentMethod,
        payment_proof: paymentProof,
        billing_address: {
          name: `${firstName} ${lastName}`,
          email: email,
          address,
          city,
          country
        }
      })

      // Handle Stripe payment
      if (paymentMethod === 'card' && stripeEnabled && stripe && elements) {
        try {
          const intentRes = await paymentsAPI.createStripeIntent({
            amount: total,
            currency: 'usd',
            order_uuid: orderRes.data.order.uuid
          })

          const { clientSecret } = intentRes.data
          const cardElement = elements.getElement(CardElement)
          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${firstName} ${lastName}`,
                email: email,
              },
            },
          })

          if (error) {
            toast.error(error.message)
            return
          }

          if (paymentIntent.status === 'succeeded') {
            await paymentsAPI.confirmStripePayment({
              payment_intent_id: paymentIntent.id,
              order_uuid: orderRes.data.order.uuid
            })
          }
        } catch (paymentErr) {
          toast.error('Payment failed. Please try again.')
          return
        }
      }

      // Clear cart and session storage
      clearCart()
      sessionStorage.removeItem('guestEmail')
      
      toast.success('🎉 Order placed successfully! Check your email for login details.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <>
      <Helmet><title>Secure Checkout - Magnetic Clouds</title></Helmet>
      
      {/* Ultra Premium Header */}
      <div className="bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Secure Checkout</h1>
                <p className="text-sm text-white/70">256-bit SSL Encrypted</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-white/90">
                  <badge.icon className="w-5 h-5" />
                  <div className="text-xs">
                    <p className="font-bold">{badge.label}</p>
                    <p className="text-white/60">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 bg-dark-50 dark:bg-dark-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-xl border border-dark-100 dark:border-dark-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Contact Information</h2>
                    <p className="text-sm text-dark-500">We'll send your login details here</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className="input pl-11 w-full" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="input pl-11 w-full" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="input pl-11 w-full" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Billing Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-xl border border-dark-100 dark:border-dark-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Billing Address</h2>
                    <p className="text-sm text-dark-500">For invoice purposes</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Street Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main Street" className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="New York" className="input w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="United States" className="input w-full" />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-xl border border-dark-100 dark:border-dark-700"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Payment Method</h2>
                    <p className="text-sm text-dark-500">Choose how you'd like to pay</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => {
                    if (method.isStripe && !stripeEnabled) return null
                    return (
                      <label key={method.id} className={clsx(
                        "relative flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all hover:scale-[1.02]",
                        paymentMethod === method.id 
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg" 
                          : "border-dark-200 dark:border-dark-700 hover:border-primary-300"
                      )}>
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)} className="hidden" />
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-lg`}>
                          <method.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-medium text-sm text-center">{method.name}</span>
                        {paymentMethod === method.id && (
                          <CheckCircle className="w-5 h-5 text-primary-500 absolute top-2 right-2" />
                        )}
                      </label>
                    )
                  })}
                </div>

                {/* Stripe Card Element */}
                {paymentMethod === 'card' && stripeEnabled && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Card Details</label>
                    <div className="p-4 border border-dark-200 dark:border-dark-700 rounded-xl bg-white dark:bg-dark-800">
                      <CardElement 
                        options={cardElementOptions}
                        onChange={(e) => setCardComplete(e.complete)}
                      />
                    </div>
                    <p className="text-xs text-dark-500 mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Your card details are secured with 256-bit encryption
                    </p>
                  </div>
                )}

                {/* Payment Proof Upload for Bank/Cash/bKash/Rocket/PayPal */}
                {selectedMethod?.requiresProof && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Payment Instructions</h3>
                    
                    {/* bKash */}
                    {paymentMethod === 'bkash' && (
                      <div className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#E2136E] rounded-lg flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold">bKash</span>
                        </div>
                        <p><strong>Number:</strong> {paymentSettings.bkash_details?.number || 'Not configured'}</p>
                        <p><strong>Account Type:</strong> {paymentSettings.bkash_details?.account_type || 'Personal'}</p>
                        {paymentSettings.bkash_details?.instructions && (
                          <p className="mt-2 text-xs">{paymentSettings.bkash_details.instructions}</p>
                        )}
                        <p className="mt-2 text-xs">Use your Order ID as reference when sending payment.</p>
                      </div>
                    )}
                    
                    {/* Rocket */}
                    {paymentMethod === 'rocket' && (
                      <div className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#8C3494] rounded-lg flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold">Rocket</span>
                        </div>
                        <p><strong>Number:</strong> {paymentSettings.rocket_details?.number || 'Not configured'}</p>
                        <p><strong>Account Type:</strong> {paymentSettings.rocket_details?.account_type || 'Personal'}</p>
                        {paymentSettings.rocket_details?.instructions && (
                          <p className="mt-2 text-xs">{paymentSettings.rocket_details.instructions}</p>
                        )}
                        <p className="mt-2 text-xs">Use your Order ID as reference when sending payment.</p>
                      </div>
                    )}
                    
                    {/* PayPal */}
                    {paymentMethod === 'paypal' && (
                      <div className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#003087] rounded-lg flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-bold">PayPal</span>
                        </div>
                        <p>Please send payment via PayPal and upload the confirmation screenshot.</p>
                        <p className="mt-2 text-xs">Include your Order ID in the payment note.</p>
                      </div>
                    )}
                    
                    {/* Bank Transfer */}
                    {paymentMethod === 'bank' && (
                      <div className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        <p className="mb-2">Transfer to:</p>
                        <p><strong>Bank:</strong> {paymentSettings.bank_details?.bank_name || 'Not configured'}</p>
                        <p><strong>Account:</strong> {paymentSettings.bank_details?.account_number || 'Not configured'}</p>
                        <p><strong>Name:</strong> {paymentSettings.bank_details?.account_holder || 'Not configured'}</p>
                        {paymentSettings.bank_details?.additional_info && (
                          <p className="mt-2 text-xs">{paymentSettings.bank_details.additional_info}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Cash */}
                    {paymentMethod === 'cash' && (
                      <div className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                        <p>{paymentSettings.cash_instructions || 'Contact us to arrange cash payment. Upload receipt after payment.'}</p>
                      </div>
                    )}
                    
                    <label className="block">
                      <span className="text-sm font-medium mb-2 block">Upload Payment Proof *</span>
                      {paymentProofPreview ? (
                        <div className="relative inline-block">
                          <img src={paymentProofPreview} alt="Payment proof" className="max-w-xs max-h-48 rounded-lg border" />
                          <button onClick={removeProof} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
                          <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" id="proof-upload" />
                          <label htmlFor="proof-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-dark-400" />
                            <p className="text-sm text-dark-500">Click to upload receipt/screenshot</p>
                            <p className="text-xs text-dark-400">Max 5MB, JPG/PNG</p>
                          </label>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Order Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-xl border border-dark-100 dark:border-dark-700"
                >
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary-500" />
                    Order Summary
                  </h2>
                  <div className="space-y-3 mb-6">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-start py-2 border-b border-dark-100 dark:border-dark-700">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-dark-500">{item.billingCycle}</p>
                        </div>
                        <span className="font-semibold">{format(item.price)}</span>
                      </div>
                    ))}
                    <div className="pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-500">Subtotal</span>
                        <span>{format(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-500 mt-1">
                          <span>Discount</span>
                          <span>-{format(discount)}</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-dark-200 dark:border-dark-700 pt-3 flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-primary-500">{format(total)}</span>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-3 mb-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-600 dark:text-dark-400">
                      I agree to the{' '}
                      <button type="button" onClick={() => setShowTermsModal(true)} className="text-primary-500 hover:underline font-medium">Terms of Service</button>
                      {' '}and{' '}
                      <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-primary-500 hover:underline font-medium">Privacy Policy</button>
                    </span>
                  </label>

                  <button 
                    onClick={handleCheckout} 
                    disabled={loading || (paymentMethod === 'card' && stripeEnabled && (!stripe || !elements))} 
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <><Lock className="w-5 h-5" /> Complete Payment</>
                    )}
                  </button>

                  <p className="mt-3 text-xs text-dark-500 text-center">
                    Your password will be sent to your email after payment
                  </p>
                </motion.div>

                {/* Money Back Guarantee */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-2xl p-5 border border-emerald-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <RefreshCcw className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-700 dark:text-emerald-400">45-Day Money Back</h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-500">Full refund, no questions asked</p>
                    </div>
                  </div>
                </motion.div>

                {/* Customer Reviews - Rotating with Premium Transitions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-xl border border-dark-100 dark:border-dark-700 overflow-hidden"
                >
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Customer Reviews
                    <span className="ml-auto text-xs text-dark-400 font-normal">{currentReviewIndex + 1}/{serviceReviews.length}</span>
                  </h3>
                  
                  {/* Single rotating review with premium animation */}
                  <div className="relative min-h-[120px]">
                    {serviceReviews.map((review, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ 
                          opacity: i === currentReviewIndex ? 1 : 0,
                          x: i === currentReviewIndex ? 0 : (i < currentReviewIndex ? -50 : 50),
                          scale: i === currentReviewIndex ? 1 : 0.95
                        }}
                        transition={{ 
                          duration: 0.6, 
                          ease: [0.4, 0, 0.2, 1],
                          opacity: { duration: 0.4 }
                        }}
                        className={clsx(
                          "absolute inset-0 flex flex-col",
                          i !== currentReviewIndex && "pointer-events-none"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <motion.img 
                            src={review.img} 
                            alt={review.name} 
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20 shadow-lg"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: i === currentReviewIndex ? 1 : 0.8 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">{review.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">{review.service}</span>
                            </div>
                            <div className="flex mt-1">
                              {[...Array(review.rating)].map((_, j) => (
                                <motion.div
                                  key={j}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: i === currentReviewIndex ? 1 : 0, scale: i === currentReviewIndex ? 1 : 0 }}
                                  transition={{ duration: 0.3, delay: 0.2 + j * 0.05 }}
                                >
                                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <motion.p 
                          className="text-sm text-dark-600 dark:text-dark-400 mt-3 leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: i === currentReviewIndex ? 1 : 0, y: i === currentReviewIndex ? 0 : 10 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        >
                          "{review.comment}"
                        </motion.p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Progress dots */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {serviceReviews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentReviewIndex(i)}
                        className={clsx(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          i === currentReviewIndex 
                            ? "bg-primary-500 w-6" 
                            : "bg-dark-200 dark:bg-dark-600 hover:bg-primary-300"
                        )}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3">
                  {trustBadges.slice(0, 2).map((badge) => (
                    <div key={badge.label} className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-dark-100 dark:border-dark-700 flex items-center gap-2">
                      <badge.icon className="w-5 h-5 text-primary-500" />
                      <div className="text-xs">
                        <p className="font-bold">{badge.label}</p>
                        <p className="text-dark-500">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowTermsModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
              <h2 className="text-xl font-bold">Terms of Service</h2>
              <button onClick={() => setShowTermsModal(false)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] prose dark:prose-invert prose-sm">
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using Magnetic Clouds services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
              
              <h3>2. Service Description</h3>
              <p>Magnetic Clouds provides web hosting, cloud computing, domain registration, and related services. We reserve the right to modify, suspend, or discontinue any service at any time.</p>
              
              <h3>3. User Responsibilities</h3>
              <p>You are responsible for maintaining the security of your account and password. You agree not to use our services for any illegal or unauthorized purpose.</p>
              
              <h3>4. Payment Terms</h3>
              <p>All fees are due in advance and are non-refundable except as specified in our Refund Policy. We reserve the right to change our pricing at any time with 30 days notice.</p>
              
              <h3>5. Service Level Agreement</h3>
              <p>We guarantee 99.9% uptime for all hosting services. Downtime due to scheduled maintenance or circumstances beyond our control is excluded from this guarantee.</p>
              
              <h3>6. Data Protection</h3>
              <p>We implement industry-standard security measures to protect your data. However, you are responsible for maintaining backups of your own data.</p>
              
              <h3>7. Limitation of Liability</h3>
              <p>Magnetic Clouds shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
              
              <h3>8. Termination</h3>
              <p>We may terminate or suspend your account at any time for violation of these terms. You may cancel your account at any time through your dashboard.</p>
              
              <h3>9. Contact</h3>
              <p>For questions about these terms, please contact us at legal@magneticclouds.com</p>
            </div>
            <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex justify-end">
              <button onClick={() => setShowTermsModal(false)} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPrivacyModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-dark-700">
              <h2 className="text-xl font-bold">Privacy Policy</h2>
              <button onClick={() => setShowPrivacyModal(false)} className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] prose dark:prose-invert prose-sm">
              <h3>1. Information We Collect</h3>
              <p>We collect information you provide directly, including name, email, billing address, and payment information. We also collect usage data and technical information about your devices.</p>
              
              <h3>2. How We Use Your Information</h3>
              <p>We use your information to provide and improve our services, process payments, communicate with you, and ensure security of our platform.</p>
              
              <h3>3. Information Sharing</h3>
              <p>We do not sell your personal information. We may share data with service providers who assist in our operations, or when required by law.</p>
              
              <h3>4. Data Security</h3>
              <p>We implement industry-standard security measures including encryption, firewalls, and secure data centers to protect your information.</p>
              
              <h3>5. Cookies and Tracking</h3>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. You can control cookie settings in your browser.</p>
              
              <h3>6. Your Rights</h3>
              <p>You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time.</p>
              
              <h3>7. Data Retention</h3>
              <p>We retain your data for as long as your account is active or as needed to provide services. We may retain certain information as required by law.</p>
              
              <h3>8. International Transfers</h3>
              <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>
              
              <h3>9. Updates to This Policy</h3>
              <p>We may update this policy from time to time. We will notify you of significant changes via email or through our services.</p>
              
              <h3>10. Contact Us</h3>
              <p>For privacy-related inquiries, please contact us at privacy@magneticclouds.com</p>
            </div>
            <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex justify-end">
              <button onClick={() => setShowPrivacyModal(false)} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

// Main Checkout component with Stripe Elements wrapper
export default function Checkout() {
  const navigate = useNavigate()
  const { items } = useCartStore()
  const [stripePromise, setStripePromise] = useState(null)
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)
    
    // Check if cart is empty
    if (items.length === 0) {
      navigate('/cart')
      return
    }

    // Load payment settings
    const loadPaymentSettings = async () => {
      try {
        // Load both Stripe key and payment methods in parallel
        const [stripeRes, methodsRes] = await Promise.all([
          settingsAPI.getStripeKey(),
          settingsAPI.getPaymentMethods()
        ])
        
        if (stripeRes.data.enabled && stripeRes.data.publishableKey) {
          setStripeEnabled(true)
          setStripePromise(loadStripe(stripeRes.data.publishableKey))
        }
        
        setPaymentSettings(methodsRes.data)
      } catch (err) {
        console.error('Failed to load payment settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadPaymentSettings()
  }, [items.length, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (stripeEnabled && stripePromise) {
    return (
      <Elements stripe={stripePromise}>
        <StripeCheckoutForm paymentSettings={paymentSettings} />
      </Elements>
    )
  }

  return <CheckoutFormInner stripeEnabled={false} paymentSettings={paymentSettings} />
}

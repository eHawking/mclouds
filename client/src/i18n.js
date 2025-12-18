import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        hosting: 'Web Hosting',
        vps: 'VPS Servers',
        cloud: 'Cloud Servers',
        dedicated: 'Dedicated Servers',
        domains: 'Domains',
        ssl: 'SSL Certificates',
        email: 'Professional Email',
        backup: 'Website Backup',
        datacenters: 'Datacenters',
        support: 'Support',
        login: 'Login',
        signup: 'Sign Up',
        dashboard: 'Dashboard',
        logout: 'Logout'
      },
      // Hero section
      hero: {
        title: 'Premium Cloud Hosting',
        titleHighlight: 'Built for Speed',
        subtitle: 'Experience lightning-fast hosting with 99.9% uptime guarantee. From Bangladesh to the World.',
        searchDomain: 'Search for your perfect domain...',
        search: 'Search',
        startingAt: 'Starting at',
        perMonth: '/mo'
      },
      // Features
      features: {
        uptime: '99.9% Uptime',
        uptimeDesc: 'Enterprise-grade reliability',
        support: '24/7 Support',
        supportDesc: 'Expert help anytime',
        ssl: 'Free SSL',
        sslDesc: 'Secure your website',
        backup: 'Daily Backups',
        backupDesc: 'Your data is safe',
        moneyBack: '45-Day Money Back',
        moneyBackDesc: 'Risk-free guarantee',
        global: 'Global Network',
        globalDesc: '10+ datacenter locations'
      },
      // Pricing
      pricing: {
        monthly: 'Monthly',
        annually: 'Annually',
        save: 'Save',
        popular: 'Most Popular',
        getStarted: 'Get Started',
        features: 'Features',
        perMonth: '/month'
      },
      // Common
      common: {
        learnMore: 'Learn More',
        viewAll: 'View All',
        loading: 'Loading...',
        error: 'Something went wrong',
        success: 'Success!',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        reset: 'Reset'
      },
      // Footer
      footer: {
        aboutUs: 'About Us',
        contactUs: 'Contact Us',
        support: 'Support',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        refund: 'Refund Policy',
        careers: 'Careers',
        blog: 'Blog',
        newsletter: 'Subscribe to Newsletter',
        newsletterDesc: 'Get the latest updates and offers.',
        subscribe: 'Subscribe',
        rights: 'All rights reserved.',
        madeWith: 'Made with',
        inBangladesh: 'in Bangladesh'
      },
      // Auth
      auth: {
        login: 'Login',
        signup: 'Sign Up',
        email: 'Email Address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        phone: 'Phone Number',
        company: 'Company (Optional)',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember me',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        createAccount: 'Create Account',
        loginSuccess: 'Welcome back!',
        signupSuccess: 'Account created successfully!'
      },
      // Dashboard
      dashboard: {
        welcome: 'Welcome back',
        overview: 'Overview',
        services: 'My Services',
        domains: 'My Domains',
        invoices: 'Invoices',
        tickets: 'Support Tickets',
        profile: 'Profile',
        settings: 'Settings',
        activeServices: 'Active Services',
        pendingInvoices: 'Pending Invoices',
        openTickets: 'Open Tickets',
        totalSpent: 'Total Spent'
      }
    }
  },
  bn: {
    translation: {
      nav: {
        home: 'হোম',
        hosting: 'ওয়েব হোস্টিং',
        vps: 'ভিপিএস সার্ভার',
        cloud: 'ক্লাউড সার্ভার',
        dedicated: 'ডেডিকেটেড সার্ভার',
        domains: 'ডোমেইন',
        ssl: 'এসএসএল সার্টিফিকেট',
        support: 'সাপোর্ট',
        login: 'লগইন',
        signup: 'সাইন আপ',
        dashboard: 'ড্যাশবোর্ড',
        logout: 'লগআউট'
      },
      hero: {
        title: 'প্রিমিয়াম ক্লাউড হোস্টিং',
        titleHighlight: 'গতির জন্য তৈরি',
        subtitle: 'বাংলাদেশ থেকে বিশ্বে। ৯৯.৯% আপটাইম গ্যারান্টি সহ দ্রুতগতির হোস্টিং।',
        searchDomain: 'আপনার পারফেক্ট ডোমেইন খুঁজুন...',
        search: 'খুঁজুন'
      },
      common: {
        learnMore: 'আরও জানুন',
        loading: 'লোড হচ্ছে...'
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n

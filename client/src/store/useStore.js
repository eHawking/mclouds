import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Theme store
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light', // 'light' or 'dark'
      themeStyle: 'gradient', // 'gradient' or 'flat'
      setTheme: (theme) => set({ theme }),
      setThemeStyle: (style) => set({ themeStyle: style }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      }))
    }),
    {
      name: 'magnetic-theme'
    }
  )
)

// Auth store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) => set({
        user,
        token,
        isAuthenticated: !!user
      }),
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: !!user
      }),
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      }),
      updateUser: (data) => set((state) => ({
        user: { ...state.user, ...data }
      }))
    }),
    {
      name: 'magnetic-auth'
    }
  )
)

// Cart store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addItem: (item) => set((state) => {
        const existing = state.items.find(
          i => i.id === item.id && i.billingCycle === item.billingCycle
        )
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === item.id && i.billingCycle === item.billingCycle
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          }
        }
        return { items: [...state.items, { ...item, quantity: 1 }] }
      }),
      removeItem: (id, billingCycle) => set((state) => ({
        items: state.items.filter(
          i => !(i.id === id && i.billingCycle === billingCycle)
        )
      })),
      updateQuantity: (id, billingCycle, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.id === id && i.billingCycle === billingCycle
            ? { ...i, quantity }
            : i
        )
      })),
      clearCart: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      getTotal: () => {
        const state = get()
        const subtotal = state.items.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        )
        const discount = state.coupon
          ? state.coupon.type === 'percentage'
            ? subtotal * (state.coupon.value / 100)
            : state.coupon.value
          : 0
        return {
          subtotal,
          discount,
          total: subtotal - discount
        }
      }
    }),
    {
      name: 'magnetic-cart'
    }
  )
)

// Currency store
export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: 'USD',
      rates: {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        BDT: 110,
        INR: 83,
        SGD: 1.35,
        AUD: 1.53
      },
      setCurrency: (currency) => set({ currency }),
      setRates: (rates) => set({ rates }),
      convert: (amount, from = 'USD') => {
        const state = get()
        const fromRate = state.rates[from] || 1
        const toRate = state.rates[state.currency] || 1
        return (amount / fromRate) * toRate
      },
      format: (amount, from = 'USD') => {
        const state = get()
        const converted = state.convert(amount, from)
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: state.currency,
          minimumFractionDigits: 2
        }).format(converted)
      }
    }),
    {
      name: 'magnetic-currency'
    }
  )
)

// Settings store
export const useSettingsStore = create(
  persist(
    (set) => ({
      settings: {},
      setSettings: (settings) => set({ settings }),
      updateSetting: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
      }))
    }),
    {
      name: 'magnetic-settings'
    }
  )
)

// Site Settings store (logo, favicon, site name, partner logos)
export const useSiteSettingsStore = create(
  persist(
    (set) => ({
      siteName: 'Magnetic Clouds',
      siteTagline: 'Premium Cloud Hosting',
      logo: null,
      headerLogoDark: null,
      headerLogoHeight: 40,
      footerLogo: null,
      footerLogoDark: null,
      footerLogoHeight: 40,
      favicon: null,
      contactEmail: 'support@magneticclouds.com',
      contactPhone: '',
      partnerLogos: [],
      loaded: false,
      setSiteSettings: (data) => set({ ...data, loaded: true }),
      updateSiteSetting: (key, value) => set({ [key]: value }),
      setPartnerLogos: (logos) => set({ partnerLogos: logos }),
      addPartnerLogo: (logo) => set((state) => ({
        partnerLogos: [...state.partnerLogos, logo]
      })),
      removePartnerLogo: (index) => set((state) => ({
        partnerLogos: state.partnerLogos.filter((_, i) => i !== index)
      }))
    }),
    {
      name: 'magnetic-site-settings'
    }
  )
)

// Header & Footer Settings store (dynamic settings from admin)
// Uses persist to prevent flash of default content on page load
export const useHeaderFooterStore = create(
  persist(
    (set) => ({
      headerSettings: null,
      footerSettings: null,
      loaded: false,
      setHeaderSettings: (settings) => set({ headerSettings: settings }),
      setFooterSettings: (settings) => set({ footerSettings: settings }),
      setSettings: (header, footer) => set({
        headerSettings: header,
        footerSettings: footer,
        loaded: true
      })
    }),
    {
      name: 'magnetic-header-footer'
    }
  )
)


// Language store with translations
const LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  ar: { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.hosting': 'Hosting',
    'nav.servers': 'Servers',
    'nav.domains': 'Domains',
    'nav.pricing': 'Pricing',
    'nav.support': 'Support',
    'nav.contact': 'Contact',
    'nav.about': 'About Us',
    'nav.company': 'Company',
    'nav.securityTools': 'Security & Tools',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    // Hero
    'hero.title': 'Premium Cloud Hosting',
    'hero.titleHighlight': 'Built for Speed',
    'hero.subtitle': 'Experience lightning-fast hosting with 99.9% uptime guarantee. From Bangladesh to the World.',
    'hero.description': 'Experience the power of cloud hosting with 99.9% uptime guarantee, 24/7 support, and blazing fast servers worldwide.',
    'hero.searchDomain': 'Search for your perfect domain...',
    'hero.search': 'Search',
    'hero.getStarted': 'Get Started',
    'hero.viewPlans': 'View Pricing',
    'hero.learnMore': 'Learn More',
    'hero.trustedBy': 'Trusted by 50,000+ Customers Worldwide',
    'hero.readyToStart': 'Ready to Get Started?',
    'hero.joinThousands': 'Join thousands of satisfied customers and experience the difference.',
    // Features
    'features.title': 'Why Choose Us',
    'features.subtitle': 'Everything you need for success',
    'features.speed': 'Lightning Speed',
    'features.speedDesc': 'Blazing fast NVMe SSD storage with optimized servers',
    'features.security': 'Enterprise Security',
    'features.securityDesc': 'DDoS protection, SSL certificates, and daily backups',
    'features.support': '24/7 Expert Support',
    'features.supportDesc': 'Round-the-clock assistance from our expert team',
    'features.uptime': '99.9% Uptime',
    'features.uptimeDesc': 'Industry-leading reliability with guaranteed uptime',
    // Pricing
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.subtitle': 'Choose the perfect plan for your needs',
    'pricing.monthly': 'Monthly',
    'pricing.yearly': 'Yearly',
    'pricing.perMonth': '/month',
    'pricing.perYear': '/year',
    'pricing.getStarted': 'Get Started',
    'pricing.mostPopular': 'Most Popular',
    'pricing.features': 'Features',
    // Domains
    'domains.title': 'Find Your Perfect Domain',
    'domains.subtitle': 'Search from 500+ domain extensions',
    'domains.search': 'Search',
    'domains.searchPlaceholder': 'Search for your perfect domain name...',
    'domains.available': 'is available!',
    'domains.registered': 'is already registered',
    'domains.addToCart': 'Add to Cart',
    'domains.whoisInfo': 'View WHOIS Info',
    // Footer
    'footer.description': 'Premium cloud hosting solutions with 24/7 expert support and industry-leading uptime guarantee.',
    'footer.services': 'Services',
    'footer.tools': 'Tools',
    'footer.products': 'Products',
    'footer.company': 'Company',
    'footer.support': 'Support',
    'footer.legal': 'Legal',
    'footer.termsOfService': 'Terms of Service',
    'footer.privacyPolicy': 'Privacy Policy',
    'footer.refundPolicy': 'Refund Policy',
    'footer.copyright': '© 2024 Magnetic Clouds. All rights reserved.',
    'footer.newsletter': 'Subscribe to Newsletter',
    'footer.newsletterText': 'Get the latest updates and offers',
    'footer.subscribe': 'Subscribe',
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.language': 'Language',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.hosting': 'Hosting',
    'nav.servers': 'Servidores',
    'nav.domains': 'Dominios',
    'nav.pricing': 'Precios',
    'nav.support': 'Soporte',
    'nav.contact': 'Contacto',
    'nav.about': 'Nosotros',
    'nav.company': 'Empresa',
    'nav.securityTools': 'Seguridad y Herramientas',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.dashboard': 'Panel',
    'nav.logout': 'Cerrar Sesión',
    // Hero
    'hero.title': 'Hosting en la Nube Premium',
    'hero.titleHighlight': 'Construido para Velocidad',
    'hero.subtitle': 'Experimenta hosting ultrarrápido con 99.9% de tiempo activo garantizado. De Bangladesh al Mundo.',
    'hero.description': 'Experimenta el poder del hosting en la nube con 99.9% de tiempo activo garantizado, soporte 24/7 y servidores ultra rápidos.',
    'hero.searchDomain': 'Busca tu dominio perfecto...',
    'hero.search': 'Buscar',
    'hero.getStarted': 'Comenzar',
    'hero.viewPlans': 'Ver Precios',
    'hero.learnMore': 'Saber Más',
    'hero.trustedBy': 'Confiado por más de 50,000 Clientes en Todo el Mundo',
    'hero.readyToStart': '¿Listo para Comenzar?',
    'hero.joinThousands': 'Únete a miles de clientes satisfechos y experimenta la diferencia.',
    // Features
    'features.title': '¿Por Qué Elegirnos?',
    'features.subtitle': 'Todo lo que necesitas para el éxito',
    'features.speed': 'Velocidad Extrema',
    'features.speedDesc': 'Almacenamiento NVMe SSD ultrarrápido con servidores optimizados',
    'features.security': 'Seguridad Empresarial',
    'features.securityDesc': 'Protección DDoS, certificados SSL y copias de seguridad diarias',
    'features.support': 'Soporte 24/7',
    'features.supportDesc': 'Asistencia las 24 horas de nuestro equipo experto',
    'features.uptime': '99.9% Tiempo Activo',
    'features.uptimeDesc': 'Fiabilidad líder en la industria con tiempo activo garantizado',
    // Pricing
    'pricing.title': 'Precios Simples y Transparentes',
    'pricing.subtitle': 'Elige el plan perfecto para tus necesidades',
    'pricing.monthly': 'Mensual',
    'pricing.yearly': 'Anual',
    'pricing.perMonth': '/mes',
    'pricing.perYear': '/año',
    'pricing.getStarted': 'Comenzar',
    'pricing.mostPopular': 'Más Popular',
    'pricing.features': 'Características',
    // Domains
    'domains.title': 'Encuentra Tu Dominio Perfecto',
    'domains.subtitle': 'Busca entre más de 500 extensiones',
    'domains.search': 'Buscar',
    'domains.searchPlaceholder': 'Busca tu dominio perfecto...',
    'domains.available': '¡está disponible!',
    'domains.registered': 'ya está registrado',
    'domains.addToCart': 'Agregar al Carrito',
    'domains.whoisInfo': 'Ver Info WHOIS',
    // Footer
    'footer.description': 'Soluciones premium de hosting en la nube con soporte experto 24/7 y garantía de tiempo activo líder en la industria.',
    'footer.services': 'Servicios',
    'footer.tools': 'Herramientas',
    'footer.products': 'Productos',
    'footer.company': 'Empresa',
    'footer.support': 'Soporte',
    'footer.legal': 'Legal',
    'footer.termsOfService': 'Términos de Servicio',
    'footer.privacyPolicy': 'Política de Privacidad',
    'footer.refundPolicy': 'Política de Reembolso',
    'footer.copyright': '© 2024 Magnetic Clouds. Todos los derechos reservados.',
    'footer.newsletter': 'Suscríbete al Boletín',
    'footer.newsletterText': 'Recibe las últimas actualizaciones y ofertas',
    'footer.subscribe': 'Suscribirse',
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.close': 'Cerrar',
    'common.submit': 'Enviar',
    'common.search': 'Buscar',
    'common.language': 'Idioma',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.hosting': 'Hébergement',
    'nav.servers': 'Serveurs',
    'nav.domains': 'Domaines',
    'nav.pricing': 'Tarifs',
    'nav.support': 'Support',
    'nav.contact': 'Contact',
    'nav.about': 'À Propos',
    'nav.company': 'Entreprise',
    'nav.securityTools': 'Sécurité & Outils',
    'nav.login': 'Connexion',
    'nav.register': "S'inscrire",
    'nav.dashboard': 'Tableau de Bord',
    'nav.logout': 'Déconnexion',
    // Hero
    'hero.title': 'Hébergement Cloud Premium',
    'hero.titleHighlight': 'Conçu pour la Vitesse',
    'hero.subtitle': "Découvrez l'hébergement ultra-rapide avec 99.9% de disponibilité garantie. Du Bangladesh au Monde.",
    'hero.description': "Découvrez la puissance de l'hébergement cloud avec 99.9% de disponibilité garantie, support 24/7 et serveurs ultra-rapides.",
    'hero.searchDomain': 'Recherchez votre domaine parfait...',
    'hero.search': 'Rechercher',
    'hero.getStarted': 'Commencer',
    'hero.viewPlans': 'Voir les Tarifs',
    'hero.learnMore': 'En Savoir Plus',
    'hero.trustedBy': 'Approuvé par plus de 50,000 Clients dans le Monde',
    'hero.readyToStart': 'Prêt à Commencer?',
    'hero.joinThousands': 'Rejoignez des milliers de clients satisfaits et découvrez la différence.',
    // Features
    'features.title': 'Pourquoi Nous Choisir',
    'features.subtitle': 'Tout ce dont vous avez besoin pour réussir',
    'features.speed': 'Vitesse Éclair',
    'features.speedDesc': 'Stockage NVMe SSD ultra-rapide avec serveurs optimisés',
    'features.security': 'Sécurité Entreprise',
    'features.securityDesc': 'Protection DDoS, certificats SSL et sauvegardes quotidiennes',
    'features.support': 'Support 24/7',
    'features.supportDesc': 'Assistance 24h/24 de notre équipe experte',
    'features.uptime': '99.9% Disponibilité',
    'features.uptimeDesc': 'Fiabilité de premier plan avec disponibilité garantie',
    // Pricing
    'pricing.title': 'Tarification Simple et Transparente',
    'pricing.subtitle': 'Choisissez le plan parfait pour vos besoins',
    'pricing.monthly': 'Mensuel',
    'pricing.yearly': 'Annuel',
    'pricing.perMonth': '/mois',
    'pricing.perYear': '/an',
    'pricing.getStarted': 'Commencer',
    'pricing.mostPopular': 'Le Plus Populaire',
    'pricing.features': 'Fonctionnalités',
    // Domains
    'domains.title': 'Trouvez Votre Domaine Parfait',
    'domains.subtitle': 'Recherchez parmi plus de 500 extensions',
    'domains.search': 'Rechercher',
    'domains.searchPlaceholder': 'Recherchez votre domaine parfait...',
    'domains.available': 'est disponible!',
    'domains.registered': 'est déjà enregistré',
    'domains.addToCart': 'Ajouter au Panier',
    'domains.whoisInfo': 'Voir Info WHOIS',
    // Footer
    'footer.description': "Solutions d'hébergement cloud premium avec support expert 24/7 et garantie de disponibilité de premier plan.",
    'footer.services': 'Services',
    'footer.tools': 'Outils',
    'footer.products': 'Produits',
    'footer.company': 'Entreprise',
    'footer.support': 'Support',
    'footer.legal': 'Légal',
    'footer.termsOfService': "Conditions d'Utilisation",
    'footer.privacyPolicy': 'Politique de Confidentialité',
    'footer.refundPolicy': 'Politique de Remboursement',
    'footer.copyright': '© 2024 Magnetic Clouds. Tous droits réservés.',
    'footer.newsletter': 'Abonnez-vous à la Newsletter',
    'footer.newsletterText': 'Recevez les dernières mises à jour et offres',
    'footer.subscribe': "S'abonner",
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.close': 'Fermer',
    'common.submit': 'Soumettre',
    'common.search': 'Rechercher',
    'common.language': 'Langue',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.hosting': 'Hosting',
    'nav.servers': 'Server',
    'nav.domains': 'Domains',
    'nav.pricing': 'Preise',
    'nav.support': 'Support',
    'nav.contact': 'Kontakt',
    'nav.about': 'Über Uns',
    'nav.company': 'Unternehmen',
    'nav.securityTools': 'Sicherheit & Tools',
    'nav.login': 'Anmelden',
    'nav.register': 'Registrieren',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Abmelden',
    // Hero
    'hero.title': 'Premium Cloud-Hosting',
    'hero.titleHighlight': 'Für Geschwindigkeit Gebaut',
    'hero.subtitle': 'Erleben Sie blitzschnelles Hosting mit 99,9% Verfügbarkeitsgarantie. Von Bangladesch in die Welt.',
    'hero.description': 'Erleben Sie die Leistung von Cloud-Hosting mit 99,9% Verfügbarkeitsgarantie, 24/7 Support und blitzschnellen Servern weltweit.',
    'hero.searchDomain': 'Suchen Sie Ihre perfekte Domain...',
    'hero.search': 'Suchen',
    'hero.getStarted': 'Loslegen',
    'hero.viewPlans': 'Preise Ansehen',
    'hero.learnMore': 'Mehr Erfahren',
    'hero.trustedBy': 'Vertraut von über 50.000 Kunden Weltweit',
    'hero.readyToStart': 'Bereit Loszulegen?',
    'hero.joinThousands': 'Schließen Sie sich Tausenden zufriedener Kunden an und erleben Sie den Unterschied.',
    // Features
    'features.title': 'Warum Uns Wählen',
    'features.subtitle': 'Alles was Sie für den Erfolg brauchen',
    'features.speed': 'Blitzgeschwindigkeit',
    'features.speedDesc': 'Ultraschneller NVMe SSD-Speicher mit optimierten Servern',
    'features.security': 'Enterprise-Sicherheit',
    'features.securityDesc': 'DDoS-Schutz, SSL-Zertifikate und tägliche Backups',
    'features.support': '24/7 Experten-Support',
    'features.supportDesc': 'Rund-um-die-Uhr Unterstützung von unserem Expertenteam',
    'features.uptime': '99,9% Verfügbarkeit',
    'features.uptimeDesc': 'Branchenführende Zuverlässigkeit mit garantierter Verfügbarkeit',
    // Pricing
    'pricing.title': 'Einfache, Transparente Preise',
    'pricing.subtitle': 'Wählen Sie den perfekten Plan für Ihre Bedürfnisse',
    'pricing.monthly': 'Monatlich',
    'pricing.yearly': 'Jährlich',
    'pricing.perMonth': '/Monat',
    'pricing.perYear': '/Jahr',
    'pricing.getStarted': 'Loslegen',
    'pricing.mostPopular': 'Am Beliebtesten',
    'pricing.features': 'Funktionen',
    // Domains
    'domains.title': 'Finden Sie Ihre Perfekte Domain',
    'domains.subtitle': 'Suchen Sie aus über 500 Domain-Endungen',
    'domains.search': 'Suchen',
    'domains.searchPlaceholder': 'Suchen Sie Ihre perfekte Domain...',
    'domains.available': 'ist verfügbar!',
    'domains.registered': 'ist bereits registriert',
    'domains.addToCart': 'In den Warenkorb',
    'domains.whoisInfo': 'WHOIS-Info Anzeigen',
    // Footer
    'footer.description': 'Premium Cloud-Hosting-Lösungen mit 24/7 Experten-Support und branchenführender Verfügbarkeitsgarantie.',
    'footer.services': 'Dienste',
    'footer.tools': 'Werkzeuge',
    'footer.products': 'Produkte',
    'footer.company': 'Unternehmen',
    'footer.support': 'Support',
    'footer.legal': 'Rechtliches',
    'footer.termsOfService': 'Nutzungsbedingungen',
    'footer.privacyPolicy': 'Datenschutzrichtlinie',
    'footer.refundPolicy': 'Rückerstattungsrichtlinie',
    'footer.copyright': '© 2024 Magnetic Clouds. Alle Rechte vorbehalten.',
    'footer.newsletter': 'Newsletter Abonnieren',
    'footer.newsletterText': 'Erhalten Sie die neuesten Updates und Angebote',
    'footer.subscribe': 'Abonnieren',
    // Common
    'common.loading': 'Lädt...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.view': 'Ansehen',
    'common.close': 'Schließen',
    'common.submit': 'Absenden',
    'common.search': 'Suchen',
    'common.language': 'Sprache',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.hosting': 'الاستضافة',
    'nav.servers': 'الخوادم',
    'nav.domains': 'النطاقات',
    'nav.pricing': 'الأسعار',
    'nav.support': 'الدعم',
    'nav.contact': 'اتصل بنا',
    'nav.about': 'من نحن',
    'nav.company': 'الشركة',
    'nav.securityTools': 'الأمان والأدوات',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'التسجيل',
    'nav.dashboard': 'لوحة التحكم',
    'nav.logout': 'تسجيل الخروج',
    // Hero
    'hero.title': 'استضافة سحابية متميزة',
    'hero.titleHighlight': 'مصممة للسرعة',
    'hero.subtitle': 'استمتع باستضافة فائقة السرعة مع ضمان 99.9% وقت التشغيل. من بنغلاديش إلى العالم.',
    'hero.description': 'استمتع بقوة الاستضافة السحابية مع ضمان 99.9% وقت التشغيل ودعم على مدار الساعة وخوادم فائقة السرعة.',
    'hero.searchDomain': 'ابحث عن نطاقك المثالي...',
    'hero.search': 'بحث',
    'hero.getStarted': 'ابدأ الآن',
    'hero.viewPlans': 'عرض الأسعار',
    'hero.learnMore': 'اعرف المزيد',
    'hero.trustedBy': 'موثوق من قبل أكثر من 50,000 عميل حول العالم',
    'hero.readyToStart': 'مستعد للبدء؟',
    'hero.joinThousands': 'انضم إلى آلاف العملاء الراضين واختبر الفرق.',
    // Features
    'features.title': 'لماذا تختارنا',
    'features.subtitle': 'كل ما تحتاجه للنجاح',
    'features.speed': 'سرعة البرق',
    'features.speedDesc': 'تخزين NVMe SSD فائق السرعة مع خوادم محسّنة',
    'features.security': 'أمان المؤسسات',
    'features.securityDesc': 'حماية DDoS وشهادات SSL ونسخ احتياطي يومي',
    'features.support': 'دعم 24/7',
    'features.supportDesc': 'مساعدة على مدار الساعة من فريق الخبراء',
    'features.uptime': '99.9% وقت التشغيل',
    'features.uptimeDesc': 'موثوقية رائدة في الصناعة مع وقت تشغيل مضمون',
    // Pricing
    'pricing.title': 'أسعار بسيطة وشفافة',
    'pricing.subtitle': 'اختر الخطة المثالية لاحتياجاتك',
    'pricing.monthly': 'شهري',
    'pricing.yearly': 'سنوي',
    'pricing.perMonth': '/شهر',
    'pricing.perYear': '/سنة',
    'pricing.getStarted': 'ابدأ الآن',
    'pricing.mostPopular': 'الأكثر شعبية',
    'pricing.features': 'المميزات',
    // Domains
    'domains.title': 'ابحث عن نطاقك المثالي',
    'domains.subtitle': 'ابحث من بين أكثر من 500 امتداد',
    'domains.search': 'بحث',
    'domains.searchPlaceholder': 'ابحث عن نطاقك المثالي...',
    'domains.available': 'متاح!',
    'domains.registered': 'مسجل بالفعل',
    'domains.addToCart': 'أضف إلى السلة',
    'domains.whoisInfo': 'عرض معلومات WHOIS',
    // Footer
    'footer.description': 'حلول استضافة سحابية متميزة مع دعم خبراء على مدار الساعة وضمان وقت تشغيل رائد في الصناعة.',
    'footer.services': 'الخدمات',
    'footer.tools': 'الأدوات',
    'footer.products': 'المنتجات',
    'footer.company': 'الشركة',
    'footer.support': 'الدعم',
    'footer.legal': 'قانوني',
    'footer.termsOfService': 'شروط الخدمة',
    'footer.privacyPolicy': 'سياسة الخصوصية',
    'footer.refundPolicy': 'سياسة الاسترداد',
    'footer.copyright': '© 2024 Magnetic Clouds. جميع الحقوق محفوظة.',
    'footer.newsletter': 'اشترك في النشرة الإخبارية',
    'footer.newsletterText': 'احصل على آخر التحديثات والعروض',
    'footer.subscribe': 'اشترك',
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجاح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.close': 'إغلاق',
    'common.submit': 'إرسال',
    'common.search': 'بحث',
    'common.language': 'اللغة',
  }
}

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: 'en',
      languages: LANGUAGES,
      setLanguage: (lang) => {
        set({ language: lang })
        // Update document direction for RTL languages
        document.documentElement.dir = LANGUAGES[lang]?.dir || 'ltr'
        document.documentElement.lang = lang
        // Also update i18next if available
        if (window.i18next) {
          window.i18next.changeLanguage(lang)
        }
      },
      t: (key) => {
        // Try i18next first, then fall back to local translations
        if (window.i18next && window.i18next.t) {
          const translated = window.i18next.t(key)
          if (translated !== key) return translated
        }
        const state = get()
        return translations[state.language]?.[key] || translations.en[key] || key
      },
      getCurrentLanguage: () => {
        const state = get()
        return LANGUAGES[state.language] || LANGUAGES.en
      }
    }),
    {
      name: 'magnetic-language',
      onRehydrateStorage: () => (state) => {
        // Apply RTL on rehydration
        if (state?.language) {
          document.documentElement.dir = LANGUAGES[state.language]?.dir || 'ltr'
          document.documentElement.lang = state.language
        }
      }
    }
  )
)

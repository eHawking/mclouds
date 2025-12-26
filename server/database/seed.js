const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./connection');

async function seed() {
  try {
    console.log('🌱 Seeding database...\n');

    // Create admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
    await db.query(`
      INSERT IGNORE INTO users (uuid, email, password, first_name, last_name, role, status, email_verified)
      VALUES (?, ?, ?, ?, ?, 'admin', 'active', TRUE)
    `, [uuidv4(), process.env.ADMIN_EMAIL || 'admin@magneticclouds.com', adminPassword, 'Admin', 'User']);
    console.log('✅ Admin user created');

    // Product categories
    const categories = [
      { name: 'Web Hosting', slug: 'web-hosting', icon: 'Server', description: 'Reliable web hosting solutions' },
      { name: 'VPS Servers', slug: 'vps-servers', icon: 'HardDrive', description: 'Virtual Private Servers' },
      { name: 'Cloud Servers', slug: 'cloud-servers', icon: 'Cloud', description: 'Scalable cloud infrastructure' },
      { name: 'Dedicated Servers', slug: 'dedicated-servers', icon: 'Database', description: 'Full dedicated hardware' },
      { name: 'Domains', slug: 'domains', icon: 'Globe', description: 'Domain registration & transfer' },
      { name: 'SSL Certificates', slug: 'ssl-certificates', icon: 'Shield', description: 'Secure your website' },
      { name: 'Professional Email', slug: 'professional-email', icon: 'Mail', description: 'Business email solutions' },
      { name: 'Website Backup', slug: 'website-backup', icon: 'Archive', description: 'Automated backup solutions' }
    ];

    for (const cat of categories) {
      await db.query(`
        INSERT IGNORE INTO product_categories (name, slug, icon, description, is_active)
        VALUES (?, ?, ?, ?, TRUE)
      `, [cat.name, cat.slug, cat.icon, cat.description]);
    }
    console.log('✅ Product categories created');

    // Web Hosting Products
    const hostingProducts = [
      {
        name: 'Starter Hosting',
        slug: 'starter-hosting',
        description: 'Perfect for personal websites and blogs',
        features: JSON.stringify(['1 Website', '10 GB SSD Storage', 'Unmetered Bandwidth', 'Free SSL Certificate', 'cPanel Control Panel', '24/7 Support']),
        price_monthly: 2.99,
        price_annual: 29.99,
        is_featured: false
      },
      {
        name: 'Business Hosting',
        slug: 'business-hosting',
        description: 'Ideal for growing businesses',
        features: JSON.stringify(['Unlimited Websites', '50 GB SSD Storage', 'Unmetered Bandwidth', 'Free SSL Certificate', 'Free Domain (1 Year)', 'cPanel Control Panel', 'Daily Backups', 'Priority Support']),
        price_monthly: 5.99,
        price_annual: 59.99,
        is_featured: true
      },
      {
        name: 'Enterprise Hosting',
        slug: 'enterprise-hosting',
        description: 'Maximum performance for large websites',
        features: JSON.stringify(['Unlimited Websites', '100 GB NVMe Storage', 'Unmetered Bandwidth', 'Free SSL Certificate', 'Free Domain (1 Year)', 'cPanel Control Panel', 'Daily Backups', 'Dedicated IP', 'Premium Support', 'Staging Environment']),
        price_monthly: 9.99,
        price_annual: 99.99,
        is_featured: false
      }
    ];

    const hostingCatId = (await db.query("SELECT id FROM product_categories WHERE slug = 'web-hosting'"))[0]?.id;
    for (const product of hostingProducts) {
      await db.query(`
        INSERT IGNORE INTO products (uuid, category_id, name, slug, description, features, price_monthly, price_annual, is_featured, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [uuidv4(), hostingCatId, product.name, product.slug, product.description, product.features, product.price_monthly, product.price_annual, product.is_featured]);
    }
    console.log('✅ Hosting products created');

    // VPS Products
    const vpsProducts = [
      {
        name: 'VPS Basic',
        slug: 'vps-basic',
        description: 'Entry-level VPS for small projects',
        features: JSON.stringify(['1 vCPU Core', '2 GB RAM', '40 GB NVMe SSD', '1 TB Bandwidth', 'Full Root Access', 'Choice of OS']),
        price_monthly: 9.99,
        price_annual: 99.99
      },
      {
        name: 'VPS Standard',
        slug: 'vps-standard',
        description: 'Balanced performance for growing needs',
        features: JSON.stringify(['2 vCPU Cores', '4 GB RAM', '80 GB NVMe SSD', '2 TB Bandwidth', 'Full Root Access', 'Choice of OS', 'Free Snapshots']),
        price_monthly: 19.99,
        price_annual: 199.99
      },
      {
        name: 'VPS Pro',
        slug: 'vps-pro',
        description: 'High performance for demanding applications',
        features: JSON.stringify(['4 vCPU Cores', '8 GB RAM', '160 GB NVMe SSD', '4 TB Bandwidth', 'Full Root Access', 'Choice of OS', 'Free Snapshots', 'DDoS Protection']),
        price_monthly: 39.99,
        price_annual: 399.99
      },
      {
        name: 'VPS Enterprise',
        slug: 'vps-enterprise',
        description: 'Maximum power for enterprise workloads',
        features: JSON.stringify(['8 vCPU Cores', '16 GB RAM', '320 GB NVMe SSD', '8 TB Bandwidth', 'Full Root Access', 'Choice of OS', 'Free Snapshots', 'DDoS Protection', 'Dedicated IP']),
        price_monthly: 79.99,
        price_annual: 799.99
      }
    ];

    const vpsCatId = (await db.query("SELECT id FROM product_categories WHERE slug = 'vps-servers'"))[0]?.id;
    for (const product of vpsProducts) {
      await db.query(`
        INSERT IGNORE INTO products (uuid, category_id, name, slug, description, features, price_monthly, price_annual, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [uuidv4(), vpsCatId, product.name, product.slug, product.description, product.features, product.price_monthly, product.price_annual]);
    }
    console.log('✅ VPS products created');

    // Cloud Server Products
    const cloudProducts = [
      {
        name: 'Cloud Starter',
        slug: 'cloud-starter',
        features: JSON.stringify(['2 vCPU', '4 GB RAM', '50 GB SSD', '2 TB Transfer', 'Auto Scaling', '99.9% Uptime SLA']),
        price_monthly: 24.99,
        price_annual: 249.99
      },
      {
        name: 'Cloud Business',
        slug: 'cloud-business',
        features: JSON.stringify(['4 vCPU', '8 GB RAM', '100 GB SSD', '4 TB Transfer', 'Auto Scaling', 'Load Balancer', '99.95% Uptime SLA']),
        price_monthly: 49.99,
        price_annual: 499.99
      },
      {
        name: 'Cloud Enterprise',
        slug: 'cloud-enterprise',
        features: JSON.stringify(['8 vCPU', '32 GB RAM', '400 GB SSD', '10 TB Transfer', 'Auto Scaling', 'Load Balancer', 'Private Network', '99.99% Uptime SLA']),
        price_monthly: 149.99,
        price_annual: 1499.99
      }
    ];

    const cloudCatId = (await db.query("SELECT id FROM product_categories WHERE slug = 'cloud-servers'"))[0]?.id;
    for (const product of cloudProducts) {
      await db.query(`
        INSERT IGNORE INTO products (uuid, category_id, name, slug, description, features, price_monthly, price_annual, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [uuidv4(), cloudCatId, product.name, product.slug, 'Scalable cloud infrastructure', product.features, product.price_monthly, product.price_annual]);
    }
    console.log('✅ Cloud products created');

    // Dedicated Server Products
    const dedicatedProducts = [
      {
        name: 'Dedicated Entry',
        slug: 'dedicated-entry',
        features: JSON.stringify(['Intel Xeon E-2274G', '32 GB DDR4 RAM', '2x 1TB NVMe SSD', '10 TB Bandwidth', '1 Gbps Port', '5 IP Addresses']),
        price_monthly: 99.99,
        price_annual: 999.99
      },
      {
        name: 'Dedicated Pro',
        slug: 'dedicated-pro',
        features: JSON.stringify(['Intel Xeon E-2288G', '64 GB DDR4 RAM', '2x 2TB NVMe SSD', '20 TB Bandwidth', '1 Gbps Port', '10 IP Addresses', 'Hardware RAID']),
        price_monthly: 199.99,
        price_annual: 1999.99
      },
      {
        name: 'Dedicated Enterprise',
        slug: 'dedicated-enterprise',
        features: JSON.stringify(['Dual Intel Xeon Gold 6248', '256 GB DDR4 RAM', '4x 2TB NVMe SSD', 'Unmetered Bandwidth', '10 Gbps Port', '30 IP Addresses', 'Hardware RAID', '24/7 Monitoring']),
        price_monthly: 499.99,
        price_annual: 4999.99
      }
    ];

    const dedicatedCatId = (await db.query("SELECT id FROM product_categories WHERE slug = 'dedicated-servers'"))[0]?.id;
    for (const product of dedicatedProducts) {
      await db.query(`
        INSERT IGNORE INTO products (uuid, category_id, name, slug, description, features, price_monthly, price_annual, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [uuidv4(), dedicatedCatId, product.name, product.slug, 'Dedicated server hardware', product.features, product.price_monthly, product.price_annual]);
    }
    console.log('✅ Dedicated server products created');

    // SSL Products
    const sslProducts = [
      {
        name: 'Domain Validation SSL',
        slug: 'dv-ssl',
        description: 'Basic encryption for personal websites',
        features: JSON.stringify(['Domain Validation', '256-bit Encryption', 'Single Domain', '$10,000 Warranty', '99.9% Browser Support', 'Instant Issuance']),
        price_annual: 9.99
      },
      {
        name: 'Organization Validation SSL',
        slug: 'ov-ssl',
        description: 'Business-grade SSL with company verification',
        features: JSON.stringify(['Organization Validation', '256-bit Encryption', 'Single Domain', '$100,000 Warranty', '99.9% Browser Support', 'Company Name in Certificate']),
        price_annual: 49.99
      },
      {
        name: 'Wildcard SSL',
        slug: 'wildcard-ssl',
        description: 'Secure unlimited subdomains',
        features: JSON.stringify(['Domain Validation', '256-bit Encryption', 'Unlimited Subdomains', '$50,000 Warranty', '99.9% Browser Support', 'Instant Issuance']),
        price_annual: 79.99
      },
      {
        name: 'Extended Validation SSL',
        slug: 'ev-ssl',
        description: 'Highest level of trust and security',
        features: JSON.stringify(['Extended Validation', '256-bit Encryption', 'Single Domain', '$1,500,000 Warranty', 'Green Address Bar', 'Company Name Display', '99.9% Browser Support']),
        price_annual: 199.99
      }
    ];

    const sslCatId = (await db.query("SELECT id FROM product_categories WHERE slug = 'ssl-certificates'"))[0]?.id;
    for (const product of sslProducts) {
      await db.query(`
        INSERT IGNORE INTO products (uuid, category_id, name, slug, description, features, price_annual, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [uuidv4(), sslCatId, product.name, product.slug, product.description, product.features, product.price_annual]);
    }
    console.log('✅ SSL products created');

    // Domain TLDs
    const tlds = [
      { tld: '.com', price_register: 12.99, price_renew: 14.99, price_transfer: 12.99, is_popular: true },
      { tld: '.net', price_register: 13.99, price_renew: 15.99, price_transfer: 13.99, is_popular: true },
      { tld: '.org', price_register: 12.99, price_renew: 14.99, price_transfer: 12.99, is_popular: true },
      { tld: '.io', price_register: 39.99, price_renew: 44.99, price_transfer: 39.99, is_popular: true },
      { tld: '.co', price_register: 29.99, price_renew: 34.99, price_transfer: 29.99, is_popular: false },
      { tld: '.dev', price_register: 14.99, price_renew: 16.99, price_transfer: 14.99, is_popular: false },
      { tld: '.app', price_register: 14.99, price_renew: 16.99, price_transfer: 14.99, is_popular: false },
      { tld: '.xyz', price_register: 2.99, price_renew: 12.99, price_transfer: 9.99, is_popular: false },
      { tld: '.online', price_register: 4.99, price_renew: 29.99, price_transfer: 24.99, is_popular: false },
      { tld: '.tech', price_register: 9.99, price_renew: 39.99, price_transfer: 34.99, is_popular: false },
      { tld: '.store', price_register: 4.99, price_renew: 49.99, price_transfer: 44.99, is_popular: false },
      { tld: '.ai', price_register: 79.99, price_renew: 89.99, price_transfer: 79.99, is_popular: true },
      { tld: '.bd', price_register: 49.99, price_renew: 49.99, price_transfer: 49.99, is_popular: false },
      { tld: '.com.bd', price_register: 29.99, price_renew: 29.99, price_transfer: 29.99, is_popular: false }
    ];

    for (const tld of tlds) {
      await db.query(`
        INSERT IGNORE INTO domain_tlds (tld, price_register, price_renew, price_transfer, is_popular, is_active)
        VALUES (?, ?, ?, ?, ?, TRUE)
      `, [tld.tld, tld.price_register, tld.price_renew, tld.price_transfer, tld.is_popular]);
    }
    console.log('✅ Domain TLDs created');

    // Datacenters
    const datacenters = [
      { name: 'Dhaka DC1', location: 'Dhaka, Bangladesh', country: 'Bangladesh', country_code: 'BD', lat: 23.8103, lng: 90.4125, description: 'Our primary datacenter in Bangladesh' },
      { name: 'Singapore DC1', location: 'Singapore', country: 'Singapore', country_code: 'SG', lat: 1.3521, lng: 103.8198, description: 'Low latency for Southeast Asia' },
      { name: 'Frankfurt DC1', location: 'Frankfurt, Germany', country: 'Germany', country_code: 'DE', lat: 50.1109, lng: 8.6821, description: 'European datacenter hub' },
      { name: 'New York DC1', location: 'New York, USA', country: 'United States', country_code: 'US', lat: 40.7128, lng: -74.0060, description: 'East Coast Americas' },
      { name: 'Los Angeles DC1', location: 'Los Angeles, USA', country: 'United States', country_code: 'US', lat: 34.0522, lng: -118.2437, description: 'West Coast Americas' },
      { name: 'London DC1', location: 'London, UK', country: 'United Kingdom', country_code: 'GB', lat: 51.5074, lng: -0.1278, description: 'UK and Western Europe' },
      { name: 'Tokyo DC1', location: 'Tokyo, Japan', country: 'Japan', country_code: 'JP', lat: 35.6762, lng: 139.6503, description: 'East Asia datacenter' },
      { name: 'Sydney DC1', location: 'Sydney, Australia', country: 'Australia', country_code: 'AU', lat: -33.8688, lng: 151.2093, description: 'Oceania region' },
      { name: 'Mumbai DC1', location: 'Mumbai, India', country: 'India', country_code: 'IN', lat: 19.0760, lng: 72.8777, description: 'South Asia datacenter' },
      { name: 'Dubai DC1', location: 'Dubai, UAE', country: 'United Arab Emirates', country_code: 'AE', lat: 25.2048, lng: 55.2708, description: 'Middle East hub' }
    ];

    for (const dc of datacenters) {
      await db.query(`
        INSERT IGNORE INTO datacenters (name, location, country, country_code, latitude, longitude, description, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [dc.name, dc.location, dc.country, dc.country_code, dc.lat, dc.lng, dc.description]);
    }
    console.log('✅ Datacenters created');

    // Settings
    const settings = [
      { key: 'site_name', value: 'Magnetic Clouds', type: 'string', category: 'general', is_public: true },
      { key: 'site_tagline', value: 'Premium Web Hosting from Bangladesh', type: 'string', category: 'general', is_public: true },
      { key: 'site_description', value: 'Magnetic Clouds is a leading web hosting and domain provider from Bangladesh, offering reliable VPS, Cloud, and Dedicated servers with 24/7 support.', type: 'string', category: 'general', is_public: true },
      { key: 'contact_email', value: 'support@magneticclouds.com', type: 'string', category: 'contact', is_public: true },
      { key: 'contact_phone', value: '+880 1XXX-XXXXXX', type: 'string', category: 'contact', is_public: true },
      { key: 'contact_address', value: 'Dhaka, Bangladesh', type: 'string', category: 'contact', is_public: true },
      { key: 'theme_mode', value: 'gradient', type: 'string', category: 'appearance', is_public: true },
      { key: 'primary_color', value: '#6366f1', type: 'string', category: 'appearance', is_public: true },
      { key: 'secondary_color', value: '#8b5cf6', type: 'string', category: 'appearance', is_public: true },
      { key: 'default_currency', value: 'USD', type: 'string', category: 'billing', is_public: true },
      { key: 'available_currencies', value: '["USD", "EUR", "GBP", "BDT", "INR", "SGD", "AUD"]', type: 'json', category: 'billing', is_public: true },
      { key: 'default_language', value: 'en', type: 'string', category: 'localization', is_public: true },
      { key: 'available_languages', value: '["en", "bn", "hi", "ar"]', type: 'json', category: 'localization', is_public: true },
      { key: 'money_back_days', value: '45', type: 'number', category: 'billing', is_public: true },
      { key: 'tax_enabled', value: 'false', type: 'boolean', category: 'billing', is_public: false },
      { key: 'tax_rate', value: '0', type: 'number', category: 'billing', is_public: false },
      { key: 'social_facebook', value: 'https://facebook.com/magneticclouds', type: 'string', category: 'social', is_public: true },
      { key: 'social_twitter', value: 'https://twitter.com/magneticclouds', type: 'string', category: 'social', is_public: true },
      { key: 'social_linkedin', value: 'https://linkedin.com/company/magneticclouds', type: 'string', category: 'social', is_public: true },
      { key: 'social_instagram', value: 'https://instagram.com/magneticclouds', type: 'string', category: 'social', is_public: true }
    ];

    for (const setting of settings) {
      await db.query(`
        INSERT IGNORE INTO settings (setting_key, setting_value, setting_type, category, is_public)
        VALUES (?, ?, ?, ?, ?)
      `, [setting.key, setting.value, setting.type, setting.category, setting.is_public]);
    }
    console.log('✅ Settings created');

    // Pages
    const pages = [
      { slug: 'about-us', title: 'About Us', content: '<h1>About Magnetic Clouds</h1><p>Magnetic Clouds is a premier web hosting and domain provider based in Bangladesh. We are committed to delivering enterprise-grade hosting solutions with exceptional customer support.</p><h2>Our Mission</h2><p>To provide reliable, secure, and affordable web hosting services to businesses and individuals across the globe.</p><h2>Our Vision</h2><p>To become the leading web hosting provider in South Asia, known for innovation and customer satisfaction.</p>' },
      { slug: 'contact-us', title: 'Contact Us', content: '<h1>Contact Us</h1><p>We are here to help you 24/7. Reach out to us through any of the following channels.</p>' },
      { slug: 'terms-of-service', title: 'Terms of Service', content: '<h1>Terms of Service</h1><p>Last updated: 2024</p><p>Please read these terms carefully before using our services.</p>' },
      { slug: 'privacy-policy', title: 'Privacy Policy', content: '<h1>Privacy Policy</h1><p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>' },
      { slug: 'refund-policy', title: 'Refund Policy', content: '<h1>45-Day Money Back Guarantee</h1><p>We offer a 45-day money-back guarantee on all shared hosting plans. If you are not satisfied, we will refund your payment in full.</p>' },
      { slug: 'acceptable-use-policy', title: 'Acceptable Use Policy', content: '<h1>Acceptable Use Policy</h1><p>This policy outlines the acceptable use of our services and infrastructure.</p>' }
    ];

    for (const page of pages) {
      await db.query(`
        INSERT IGNORE INTO pages (slug, title, content, is_published)
        VALUES (?, ?, ?, TRUE)
      `, [page.slug, page.title, page.content]);
    }
    console.log('✅ Pages created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📧 Admin Login:');
    console.log(`   Email: ${process.env.ADMIN_EMAIL || 'admin@magneticclouds.com'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

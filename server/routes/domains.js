const express = require('express');
const dns = require('dns').promises;
const db = require('../database/connection');

const router = express.Router();

// Check if domain is registered using DNS lookup
async function checkDomainAvailability(fullDomain) {
  try {
    // Try to resolve NS records - if they exist, domain is registered
    await dns.resolveNs(fullDomain);
    return { available: false, registered: true };
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      // No NS records found - try SOA as backup
      try {
        await dns.resolveSoa(fullDomain);
        return { available: false, registered: true };
      } catch (soaErr) {
        if (soaErr.code === 'ENOTFOUND' || soaErr.code === 'ENODATA') {
          // Domain likely available
          return { available: true, registered: false };
        }
      }
    }
    // For other errors, assume available (can't confirm either way)
    return { available: true, registered: false, uncertain: true };
  }
}

// Search domain availability with real DNS checks
router.get('/search', async (req, res) => {
  try {
    const { domain } = req.query;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain name is required' });
    }

    // Extract domain name without TLD
    const domainParts = domain.toLowerCase().replace(/[^a-z0-9.-]/g, '').split('.');
    const domainName = domainParts[0];
    const searchedTld = domainParts.length > 1 ? '.' + domainParts.slice(1).join('.') : null;
    
    if (!domainName || domainName.length < 2) {
      return res.status(400).json({ error: 'Invalid domain name' });
    }

    // Get all TLDs
    const tlds = await db.query('SELECT * FROM domain_tlds WHERE is_active = TRUE ORDER BY is_popular DESC, price_register');

    // Check availability for each TLD using real DNS lookups
    const results = await Promise.all(tlds.map(async (tld) => {
      const fullDomain = `${domainName}${tld.tld}`;
      
      // Perform real DNS check
      const availability = await checkDomainAvailability(fullDomain);
      
      return {
        domain: fullDomain,
        tld: tld.tld,
        available: availability.available,
        registered: availability.registered,
        message: availability.available 
          ? `${fullDomain} is available!` 
          : `${fullDomain} is already registered`,
        price_register: parseFloat(tld.price_register),
        price_renew: parseFloat(tld.price_renew),
        price_transfer: parseFloat(tld.price_transfer),
        promo_price: tld.promo_price ? parseFloat(tld.promo_price) : null,
        is_popular: tld.is_popular,
        is_searched: searchedTld === tld.tld
      };
    }));

    // Sort: searched TLD first, then available, then popular, then by price
    results.sort((a, b) => {
      if (a.is_searched !== b.is_searched) return b.is_searched - a.is_searched;
      if (a.available !== b.available) return b.available - a.available;
      if (a.is_popular !== b.is_popular) return b.is_popular - a.is_popular;
      return a.price_register - b.price_register;
    });

    // Get the primary searched domain result
    const primaryDomain = searchedTld 
      ? results.find(r => r.tld === searchedTld) 
      : results.find(r => r.tld === '.com') || results[0];

    res.json({
      search_term: domainName,
      primary: primaryDomain,
      results
    });
  } catch (error) {
    console.error('Domain search error:', error);
    res.status(500).json({ error: 'Failed to search domains' });
  }
});

// Get TLD pricing
router.get('/tlds', async (req, res) => {
  try {
    const { popular_only } = req.query;
    
    let query = 'SELECT * FROM domain_tlds WHERE is_active = TRUE';
    if (popular_only === 'true') {
      query += ' AND is_popular = TRUE';
    }
    query += ' ORDER BY is_popular DESC, price_register';

    const tlds = await db.query(query);

    res.json({
      tlds: tlds.map(t => ({
        ...t,
        price_register: parseFloat(t.price_register),
        price_renew: parseFloat(t.price_renew),
        price_transfer: parseFloat(t.price_transfer),
        promo_price: t.promo_price ? parseFloat(t.promo_price) : null
      }))
    });
  } catch (error) {
    console.error('Get TLDs error:', error);
    res.status(500).json({ error: 'Failed to load TLDs' });
  }
});

// Check single domain availability with real DNS lookup
router.get('/check/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Perform real DNS check
    const availability = await checkDomainAvailability(domain);

    // Get TLD pricing
    const tld = '.' + domain.split('.').slice(1).join('.');
    const tlds = await db.query('SELECT * FROM domain_tlds WHERE tld = ?', [tld]);

    res.json({
      domain,
      available: availability.available,
      registered: availability.registered,
      message: availability.available 
        ? `${domain} is available!` 
        : `${domain} is already registered`,
      pricing: tlds.length ? {
        register: parseFloat(tlds[0].price_register),
        renew: parseFloat(tlds[0].price_renew),
        transfer: parseFloat(tlds[0].price_transfer)
      } : null
    });
  } catch (error) {
    console.error('Check domain error:', error);
    res.status(500).json({ error: 'Failed to check domain' });
  }
});

// Get WHOIS info using DNS lookups
router.get('/whois/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Check if domain is registered
    const availability = await checkDomainAvailability(domain);
    
    if (availability.available) {
      return res.json({
        domain,
        available: true,
        message: `${domain} is available for registration!`
      });
    }

    // Domain is registered - try to get DNS info
    let nameservers = [];
    let soa = null;
    let aRecords = [];
    let mxRecords = [];

    try {
      nameservers = await dns.resolveNs(domain);
    } catch (e) {}

    try {
      soa = await dns.resolveSoa(domain);
    } catch (e) {}

    try {
      aRecords = await dns.resolve4(domain);
    } catch (e) {}

    try {
      mxRecords = await dns.resolveMx(domain);
    } catch (e) {}

    // Extract registrar info from nameservers (common patterns)
    let registrar = 'Unknown Registrar';
    const nsString = nameservers.join(' ').toLowerCase();
    if (nsString.includes('cloudflare')) registrar = 'Cloudflare';
    else if (nsString.includes('godaddy')) registrar = 'GoDaddy';
    else if (nsString.includes('namecheap')) registrar = 'Namecheap';
    else if (nsString.includes('google')) registrar = 'Google Domains';
    else if (nsString.includes('aws') || nsString.includes('amazon')) registrar = 'Amazon Route 53';
    else if (nsString.includes('hostgator')) registrar = 'HostGator';
    else if (nsString.includes('bluehost')) registrar = 'Bluehost';
    else if (nsString.includes('dns')) registrar = 'DNS Provider';

    res.json({
      domain,
      available: false,
      registered: true,
      message: `${domain} is already registered`,
      registrar,
      nameservers: nameservers.slice(0, 4),
      soa: soa ? {
        primaryNs: soa.nsname,
        hostmaster: soa.hostmaster,
        serial: soa.serial,
        refresh: soa.refresh,
        retry: soa.retry,
        expire: soa.expire
      } : null,
      aRecords: aRecords.slice(0, 4),
      mxRecords: mxRecords.slice(0, 4).map(mx => ({ priority: mx.priority, exchange: mx.exchange })),
      status: 'active'
    });
  } catch (error) {
    console.error('WHOIS error:', error);
    res.status(500).json({ error: 'Failed to get WHOIS info' });
  }
});

module.exports = router;

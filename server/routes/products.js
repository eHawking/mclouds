const express = require('express');
const db = require('../database/connection');

const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT * FROM product_categories WHERE is_active = TRUE ORDER BY sort_order, name
    `);
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Get products by category
router.get('/category/:slug', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM product_categories WHERE slug = ? AND is_active = TRUE', [req.params.slug]);
    
    if (!categories.length) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const products = await db.query(`
      SELECT * FROM products WHERE category_id = ? AND is_active = TRUE ORDER BY sort_order, price_monthly
    `, [categories[0].id]);

    res.json({
      category: categories[0],
      products: products.map(p => ({
        ...p,
        features: p.features ? JSON.parse(p.features) : [],
        specifications: p.specifications ? JSON.parse(p.specifications) : {}
      }))
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      WHERE p.is_featured = TRUE AND p.is_active = TRUE
      ORDER BY p.sort_order LIMIT 6
    `);

    res.json({
      products: products.map(p => ({
        ...p,
        features: p.features ? JSON.parse(p.features) : [],
        specifications: p.specifications ? JSON.parse(p.specifications) : {}
      }))
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to load featured products' });
  }
});

// Get single product
router.get('/:slug', async (req, res) => {
  try {
    const products = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_active = TRUE
    `, [req.params.slug]);

    if (!products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    product.features = product.features ? JSON.parse(product.features) : [];
    product.specifications = product.specifications ? JSON.parse(product.specifications) : {};

    // Get related products
    const related = await db.query(`
      SELECT * FROM products 
      WHERE category_id = ? AND id != ? AND is_active = TRUE
      ORDER BY sort_order LIMIT 3
    `, [product.category_id, product.id]);

    res.json({
      product,
      related: related.map(p => ({
        ...p,
        features: p.features ? JSON.parse(p.features) : []
      }))
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.sort_order, p.name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const products = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM products p LEFT JOIN product_categories c ON p.category_id = c.id WHERE p.is_active = TRUE';
    const countParams = [];

    if (category) {
      countQuery += ' AND c.slug = ?';
      countParams.push(category);
    }
    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      products: products.map(p => ({
        ...p,
        features: p.features ? JSON.parse(p.features) : [],
        specifications: p.specifications ? JSON.parse(p.specifications) : {}
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

module.exports = router;

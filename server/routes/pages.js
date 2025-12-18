const express = require('express');
const db = require('../database/connection');

const router = express.Router();

// Get page by slug
router.get('/:slug', async (req, res) => {
  try {
    const pages = await db.query('SELECT * FROM pages WHERE slug = ? AND is_published = TRUE', [req.params.slug]);

    if (!pages.length) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ page: pages[0] });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({ error: 'Failed to load page' });
  }
});

// Get all published pages (for footer links, sitemap, etc.)
router.get('/', async (req, res) => {
  try {
    const pages = await db.query('SELECT slug, title, meta_title, meta_description FROM pages WHERE is_published = TRUE ORDER BY title');
    res.json({ pages });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ error: 'Failed to load pages' });
  }
});

// Knowledgebase categories
router.get('/kb/categories', async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT c.*, COUNT(a.id) as article_count
      FROM kb_categories c
      LEFT JOIN kb_articles a ON c.id = a.category_id AND a.is_published = TRUE
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY c.sort_order, c.name
    `);
    res.json({ categories });
  } catch (error) {
    console.error('Get KB categories error:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Knowledgebase articles by category
router.get('/kb/category/:slug', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM kb_categories WHERE slug = ? AND is_active = TRUE', [req.params.slug]);
    
    if (!categories.length) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const articles = await db.query(`
      SELECT id, title, slug, views, created_at
      FROM kb_articles
      WHERE category_id = ? AND is_published = TRUE
      ORDER BY title
    `, [categories[0].id]);

    res.json({
      category: categories[0],
      articles
    });
  } catch (error) {
    console.error('Get KB articles error:', error);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

// Knowledgebase article
router.get('/kb/article/:slug', async (req, res) => {
  try {
    const articles = await db.query(`
      SELECT a.*, c.name as category_name, c.slug as category_slug
      FROM kb_articles a
      LEFT JOIN kb_categories c ON a.category_id = c.id
      WHERE a.slug = ? AND a.is_published = TRUE
    `, [req.params.slug]);

    if (!articles.length) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views
    await db.query('UPDATE kb_articles SET views = views + 1 WHERE id = ?', [articles[0].id]);

    // Get related articles
    const related = await db.query(`
      SELECT id, title, slug
      FROM kb_articles
      WHERE category_id = ? AND id != ? AND is_published = TRUE
      ORDER BY views DESC LIMIT 5
    `, [articles[0].category_id, articles[0].id]);

    res.json({
      article: articles[0],
      related
    });
  } catch (error) {
    console.error('Get KB article error:', error);
    res.status(500).json({ error: 'Failed to load article' });
  }
});

// Rate article helpful
router.post('/kb/article/:slug/rate', async (req, res) => {
  try {
    const { helpful } = req.body;
    
    const field = helpful ? 'helpful_yes' : 'helpful_no';
    await db.query(`UPDATE kb_articles SET ${field} = ${field} + 1 WHERE slug = ?`, [req.params.slug]);

    res.json({ message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Rate article error:', error);
    res.status(500).json({ error: 'Failed to rate article' });
  }
});

// Search knowledgebase
router.get('/kb/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ articles: [] });
    }

    const articles = await db.query(`
      SELECT a.id, a.title, a.slug, a.content, c.name as category_name
      FROM kb_articles a
      LEFT JOIN kb_categories c ON a.category_id = c.id
      WHERE a.is_published = TRUE
      AND (a.title LIKE ? OR a.content LIKE ?)
      ORDER BY a.views DESC
      LIMIT 20
    `, [`%${q}%`, `%${q}%`]);

    res.json({ articles });
  } catch (error) {
    console.error('Search KB error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

module.exports = router;

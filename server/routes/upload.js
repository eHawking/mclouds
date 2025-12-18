const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Try to load sharp (optional - for WebP conversion)
let sharp = null;
try {
  sharp = require('sharp');
  console.log('Sharp loaded - WebP conversion enabled');
} catch (e) {
  console.log('Sharp not available - images will be saved without conversion');
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Ensure upload directory exists
async function ensureUploadDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Upload single image (converts to WebP if sharp is available)
router.post('/image', authenticate, requireRole('admin', 'support'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadDir = path.join(__dirname, '../../uploads', new Date().toISOString().slice(0, 7));
    await ensureUploadDir(uploadDir);

    const uuid = uuidv4();
    let filename, mimeType, filepath, relativePath;

    if (sharp) {
      // Convert to WebP
      filename = `${uuid}.webp`;
      mimeType = 'image/webp';
      filepath = path.join(uploadDir, filename);
      relativePath = `/uploads/${new Date().toISOString().slice(0, 7)}/${filename}`;
      await sharp(req.file.buffer).webp({ quality: 85 }).toFile(filepath);
    } else {
      // Save original file
      const ext = path.extname(req.file.originalname) || '.jpg';
      filename = `${uuid}${ext}`;
      mimeType = req.file.mimetype;
      filepath = path.join(uploadDir, filename);
      relativePath = `/uploads/${new Date().toISOString().slice(0, 7)}/${filename}`;
      await fs.writeFile(filepath, req.file.buffer);
    }

    const stats = await fs.stat(filepath);

    await db.query(`
      INSERT INTO media (uuid, filename, original_filename, mime_type, file_size, path, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [uuid, filename, req.file.originalname, mimeType, stats.size, relativePath, req.user.id]);

    res.json({
      message: 'File uploaded successfully',
      file: {
        uuid,
        filename,
        original_filename: req.file.originalname,
        mime_type: mimeType,
        file_size: stats.size,
        url: relativePath
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple images
router.post('/images', authenticate, requireRole('admin', 'support'), upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadDir = path.join(__dirname, '../../uploads', new Date().toISOString().slice(0, 7));
    await ensureUploadDir(uploadDir);

    const uploadedFiles = [];

    for (const file of req.files) {
      const uuid = uuidv4();
      let filename, mimeType, filepath, relativePath;

      if (sharp) {
        filename = `${uuid}.webp`;
        mimeType = 'image/webp';
        filepath = path.join(uploadDir, filename);
        relativePath = `/uploads/${new Date().toISOString().slice(0, 7)}/${filename}`;
        await sharp(file.buffer).webp({ quality: 85 }).toFile(filepath);
      } else {
        const ext = path.extname(file.originalname) || '.jpg';
        filename = `${uuid}${ext}`;
        mimeType = file.mimetype;
        filepath = path.join(uploadDir, filename);
        relativePath = `/uploads/${new Date().toISOString().slice(0, 7)}/${filename}`;
        await fs.writeFile(filepath, file.buffer);
      }

      const stats = await fs.stat(filepath);

      await db.query(`
        INSERT INTO media (uuid, filename, original_filename, mime_type, file_size, path, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [uuid, filename, file.originalname, mimeType, stats.size, relativePath, req.user.id]);

      uploadedFiles.push({
        uuid,
        filename,
        original_filename: file.originalname,
        mime_type: mimeType,
        file_size: stats.size,
        url: relativePath
      });
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Upload with resize options (requires sharp)
router.post('/image/resize', authenticate, requireRole('admin', 'support'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!sharp) {
      return res.status(501).json({ error: 'Image resize not available - sharp not installed' });
    }

    const { width, height, fit = 'cover' } = req.body;
    const uploadDir = path.join(__dirname, '../../uploads', new Date().toISOString().slice(0, 7));
    await ensureUploadDir(uploadDir);

    const uuid = uuidv4();
    const filename = `${uuid}.webp`;
    const filepath = path.join(uploadDir, filename);
    const relativePath = `/uploads/${new Date().toISOString().slice(0, 7)}/${filename}`;

    let sharpInstance = sharp(req.file.buffer);
    
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        fit: fit
      });
    }

    await sharpInstance.webp({ quality: 85 }).toFile(filepath);

    const stats = await fs.stat(filepath);

    await db.query(`
      INSERT INTO media (uuid, filename, original_filename, mime_type, file_size, path, uploaded_by)
      VALUES (?, ?, ?, 'image/webp', ?, ?, ?)
    `, [uuid, filename, req.file.originalname, stats.size, relativePath, req.user.id]);

    res.json({
      message: 'File uploaded and resized successfully',
      file: {
        uuid,
        filename,
        original_filename: req.file.originalname,
        mime_type: 'image/webp',
        file_size: stats.size,
        url: relativePath
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get media library
router.get('/', authenticate, requireRole('admin', 'support'), async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const offset = (page - 1) * limit;

    const media = await db.query(`
      SELECT m.*, u.first_name, u.last_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    const countResult = await db.query('SELECT COUNT(*) as total FROM media');

    res.json({
      media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: Number(countResult[0].total)
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to load media' });
  }
});

// Delete media
router.delete('/:uuid', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const media = await db.query('SELECT * FROM media WHERE uuid = ?', [req.params.uuid]);
    
    if (!media.length) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete file
    const filepath = path.join(__dirname, '../..', media[0].path);
    try {
      await fs.unlink(filepath);
    } catch (e) {
      console.error('Failed to delete file:', e);
    }

    // Delete from database
    await db.query('DELETE FROM media WHERE uuid = ?', [req.params.uuid]);

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

module.exports = router;

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,txt,jpg,jpeg,png,gif').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);

    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${fileExt} not allowed`));
    }
  },
});

// Upload file to clipboard
router.post('/:clipboardHandle', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { clipboardHandle } = req.params;

    if (!req.file) {
      throw new AppError('No file provided', 400);
    }

    // Get clipboard ID
    const clipboardResult = await query(
      'SELECT id FROM clipboards WHERE handle = $1',
      [clipboardHandle]
    );

    if (clipboardResult.rows.length === 0) {
      throw new AppError('Clipboard not found', 404);
    }

    const clipboardId = clipboardResult.rows[0].id;
    const fileId = uuidv4();

    // Save file metadata to database
    await query(
      `INSERT INTO files (id, clipboard_id, filename, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [fileId, clipboardId, req.file.originalname, req.file.path, req.file.size, req.file.mimetype]
    );

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: error instanceof AppError ? error.message : 'File upload failed',
    });
  }
});

// Get files in clipboard
router.get('/:clipboardHandle', async (req: Request, res: Response) => {
  try {
    const { clipboardHandle } = req.params;

    const result = await query(
      `SELECT f.id, f.filename, f.file_size, f.mime_type, f.created_at
       FROM files f
       JOIN clipboards c ON f.clipboard_id = c.id
       WHERE c.handle = $1
       ORDER BY f.created_at DESC`,
      [clipboardHandle]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files',
    });
  }
});

// Delete file
router.delete('/:fileId', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const result = await query(
      'DELETE FROM files WHERE id = $1 RETURNING file_path',
      [fileId]
    );

    if (result.rows.length === 0) {
      throw new AppError('File not found', 404);
    }

    // Delete file from disk
    const fs = require('fs').promises;
    await fs.unlink(result.rows[0].file_path).catch(() => {
      // File might not exist, ignore error
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
    });
  }
});

export default router;

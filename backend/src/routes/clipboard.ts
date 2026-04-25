import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import QRCode from 'qrcode';

const router = Router();

// Generate unique clipboard handle
function generateHandle(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create new clipboard
router.post('/', async (req: Request, res: Response) => {
  try {
    const { content, isPublic = true } = req.body;
    const handle = generateHandle();
    const clipboardId = uuidv4();

    await query(
      `INSERT INTO clipboards (id, handle, content, is_public, expires_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '24 hours')`,
      [clipboardId, handle, content, isPublic]
    );

    res.status(201).json({
      success: true,
      data: {
        id: clipboardId,
        handle,
        content,
        isPublic,
        expiresIn: '24 hours',
        link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${handle}`,
      },
    });
  } catch (error) {
    console.error('Error creating clipboard:', error);
    res.status(500).json({ success: false, error: 'Failed to create clipboard' });
  }
});

// Get clipboard content
router.get('/:handle', async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;

    const result = await query(
      `SELECT id, handle, content, is_public, created_at, expires_at
       FROM clipboards
       WHERE handle = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [handle]
    );

    if (result.rows.length === 0) {
      throw new AppError('Clipboard not found or expired', 404);
    }

    const clipboard = result.rows[0];

    res.json({
      success: true,
      data: clipboard,
    });
  } catch (error) {
    console.error('Error fetching clipboard:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clipboard' });
  }
});

// Update clipboard content
router.put('/:handle', async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const { content } = req.body;

    const result = await query(
      `UPDATE clipboards
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE handle = $2 AND expires_at > CURRENT_TIMESTAMP
       RETURNING *`,
      [content, handle]
    );

    if (result.rows.length === 0) {
      throw new AppError('Clipboard not found or expired', 404);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating clipboard:', error);
    res.status(500).json({ success: false, error: 'Failed to update clipboard' });
  }
});

// Delete clipboard
router.delete('/:handle', async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;

    const result = await query(
      'DELETE FROM clipboards WHERE handle = $1 RETURNING id',
      [handle]
    );

    if (result.rows.length === 0) {
      throw new AppError('Clipboard not found', 404);
    }

    res.json({
      success: true,
      message: 'Clipboard deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting clipboard:', error);
    res.status(500).json({ success: false, error: 'Failed to delete clipboard' });
  }
});

// Generate QR code
router.get('/:handle/qr', async (req: Request, res: Response) => {
  try {
    const { handle } = req.params;
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/${handle}`;

    const qrCode = await QRCode.toDataURL(url);

    res.json({
      success: true,
      data: {
        handle,
        qrCode,
        url,
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
});

export default router;

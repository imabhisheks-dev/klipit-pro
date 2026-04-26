import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// ==================== PRO FEATURES ====================

// Create Pro Clipboard (password protected, permanent storage)
router.post('/:handle/pro', async (req: AuthRequest, res: Response) => {
  try {
    const { handle } = req.params;
    const { content, password, readOnly = false, syntaxHighlight = 'plain' } = req.body;

    // Check if user has Pro subscription
    const proCheck = await query(
      'SELECT * FROM pro_subscriptions WHERE user_id = $1',
      [req.userId]
    );

    if (proCheck.rows.length === 0) {
      throw new AppError('Pro subscription required', 403);
    }

    const subscription = proCheck.rows[0];

    // Hash password if provided
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const clipboardId = uuidv4();

    await query(
      `INSERT INTO clipboards (
        id, handle, content, user_id, is_pro, password_protected,
        password_hash, read_only, syntax_highlight, data_retention_days, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        CURRENT_TIMESTAMP + INTERVAL '${subscription.data_retention_years} years')`,
      [
        clipboardId,
        handle,
        content,
        req.userId,
        true,
        !!password,
        passwordHash,
        readOnly,
        syntaxHighlight,
        subscription.data_retention_years * 365,
      ]
    );

    // Create initial version
    await query(
      `INSERT INTO clipboard_versions (clipboard_id, content, changed_by)
       VALUES ($1, $2, $3)`,
      [clipboardId, content, req.userId]
    );

    res.status(201).json({
      success: true,
      data: {
        id: clipboardId,
        handle,
        isPro: true,
        passwordProtected: !!password,
        readOnly,
        syntaxHighlight,
        retentionYears: subscription.data_retention_years,
      },
    });
  } catch (error) {
    console.error('Error creating Pro clipboard:', error);
    res.status(500).json({ success: false, error: 'Failed to create Pro clipboard' });
  }
});

// Get Pro Clipboard (with password verification)
router.post('/:handle/pro/access', async (req: AuthRequest, res: Response) => {
  try {
    const { handle } = req.params;
    const { password } = req.body;

    const result = await query(
      `SELECT id, content, password_hash, read_only, syntax_highlight, is_public, user_id
       FROM clipboards WHERE handle = $1 AND is_pro = true`,
      [handle]
    );

    if (result.rows.length === 0) {
      throw new AppError('Pro clipboard not found', 404);
    }

    const clipboard = result.rows[0];

    // Check password if protected
    if (clipboard.password_hash) {
      if (!password) {
        throw new AppError('Password required', 401);
      }
      const passwordMatch = await bcrypt.compare(password, clipboard.password_hash);
      if (!passwordMatch) {
        throw new AppError('Invalid password', 401);
      }
    }

    res.json({
      success: true,
      data: {
        id: clipboard.id,
        handle,
        content: clipboard.content,
        readOnly: clipboard.read_only,
        syntaxHighlight: clipboard.syntax_highlight,
        isPublic: clipboard.is_public,
        isPro: true,
      },
    });
  } catch (error) {
    console.error('Error accessing Pro clipboard:', error);
    res.status(500).json({ success: false, error: 'Failed to access clipboard' });
  }
});

// Get Clipboard Version History
router.get('/:handle/pro/versions', async (req: AuthRequest, res: Response) => {
  try {
    const { handle } = req.params;

    const result = await query(
      `SELECT cv.id, cv.content, cv.created_at, u.username
       FROM clipboard_versions cv
       JOIN clipboards c ON cv.clipboard_id = c.id
       LEFT JOIN users u ON cv.changed_by = u.id
       WHERE c.handle = $1
       ORDER BY cv.created_at DESC`,
      [handle]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch versions' });
  }
});

// Restore from Version
router.post('/:handle/pro/restore/:versionId', async (req: AuthRequest, res: Response) => {
  try {
    const { handle, versionId } = req.params;

    // Get version content
    const versionResult = await query(
      `SELECT content FROM clipboard_versions WHERE id = $1`,
      [versionId]
    );

    if (versionResult.rows.length === 0) {
      throw new AppError('Version not found', 404);
    }

    const { content } = versionResult.rows[0];

    // Update clipboard
    const clipboardResult = await query(
      `UPDATE clipboards SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE handle = $2 AND user_id = $3
       RETURNING *`,
      [content, handle, req.userId]
    );

    if (clipboardResult.rows.length === 0) {
      throw new AppError('Clipboard not found or unauthorized', 404);
    }

    // Create new version entry
    await query(
      `INSERT INTO clipboard_versions (clipboard_id, content, changed_by)
       VALUES ($1, $2, $3)`,
      [clipboardResult.rows[0].id, content, req.userId]
    );

    res.json({
      success: true,
      message: 'Clipboard restored from version',
      data: clipboardResult.rows[0],
    });
  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({ success: false, error: 'Failed to restore version' });
  }
});

// Get Pro Subscription Info
router.get('/subscription/info', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT * FROM pro_subscriptions WHERE user_id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null, isPro: false });
    }

    const subscription = result.rows[0];

    // Get usage stats
    const clipboardCount = await query(
      'SELECT COUNT(*) FROM clipboards WHERE user_id = $1',
      [req.userId]
    );

    const storageUsage = await query(
      `SELECT COALESCE(SUM(file_size), 0) as total_size
       FROM files f
       JOIN clipboards c ON f.clipboard_id = c.id
       WHERE c.user_id = $1`,
      [req.userId]
    );

    res.json({
      success: true,
      data: {
        tier: subscription.tier,
        clipboardsUsed: parseInt(clipboardCount.rows[0].count),
        maxClipboards: subscription.max_clipboards,
        storageUsed: parseInt(storageUsage.rows[0].total_size),
        maxStorage: subscription.max_storage,
        dataRetention: `${subscription.data_retention_years} years`,
        apiAccess: subscription.api_access_enabled,
        customDomain: subscription.custom_domain_enabled,
      },
      isPro: true,
    });
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscription' });
  }
});

// List all Pro Clipboards for user
router.get('/list/pro', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT id, handle, is_public, password_protected, read_only, 
              syntax_highlight, created_at, updated_at
       FROM clipboards
       WHERE user_id = $1 AND is_pro = true
       ORDER BY updated_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error listing Pro clipboards:', error);
    res.status(500).json({ success: false, error: 'Failed to list clipboards' });
  }
});

// Create Premium Subscription
router.post('/subscription/create', async (req: AuthRequest, res: Response) => {
  try {
    const { tier = 'pro' } = req.body;

    // Check if already subscribed
    const existing = await query(
      'SELECT * FROM pro_subscriptions WHERE user_id = $1',
      [req.userId]
    );

    if (existing.rows.length > 0) {
      throw new AppError('Already has Pro subscription', 409);
    }

    const subscriptionId = uuidv4();

    await query(
      `INSERT INTO pro_subscriptions (id, user_id, tier)
       VALUES ($1, $2, $3)`,
      [subscriptionId, req.userId, tier]
    );

    res.status(201).json({
      success: true,
      message: 'Pro subscription created',
      data: {
        subscriptionId,
        tier,
        maxClipboards: 100,
        maxFileSize: '1GB',
        maxStorage: '10GB',
        dataRetention: '5 years',
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to create subscription' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../services/sequelize';
import { S3Service } from '../services/s3';
import { verifyToken } from '../middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

async function resolveAvatarUrl(avatarUrl: string | null): Promise<string | null> {
  if (!avatarUrl) {
    return null;
  }

  try {
    const key = S3Service.extractS3KeyFromUrl(avatarUrl) || avatarUrl.replace(/^\//, '');
    return await S3Service.generatePresignedDownloadUrl(key);
  } catch (error) {
    console.error('Avatar signing error:', error);
    return avatarUrl;
  }
}

// GET / - Get user profile details
router.get('/', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await sequelize.query(
      `SELECT 
        id, uuid, email, phone, first_name, last_name, 
        avatar_url, date_of_birth, gender, preferred_language,
        created_at, updated_at
       FROM users WHERE id = :userId LIMIT 1`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = user[0];
    const signedAvatarUrl = await resolveAvatarUrl(profile.avatar_url);
    res.json({
      id: profile.id,
      uuid: profile.uuid,
      email: profile.email,
      phone: profile.phone,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: signedAvatarUrl,
      dateOfBirth: profile.date_of_birth,
      gender: profile.gender,
      preferredLanguage: profile.preferred_language,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT / - Update user profile details
router.put('/', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, dateOfBirth, gender, phone, preferredLanguage } = req.body;

    // Validate inputs
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if phone already exists for another user
    if (phone) {
      const existingPhone = await sequelize.query(
        `SELECT id FROM users WHERE phone = :phone AND id != :userId LIMIT 1`,
        {
          replacements: { phone, userId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (existingPhone.length) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
    }

    await sequelize.query(
      `UPDATE users SET 
        first_name = :firstName,
        last_name = :lastName,
        date_of_birth = :dateOfBirth,
        gender = :gender,
        phone = :phone,
        preferred_language = :preferredLanguage,
        updated_at = NOW()
       WHERE id = :userId`,
      {
        replacements: {
          firstName: firstName?.trim() || null,
          lastName: lastName?.trim() || null,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          phone: phone?.trim() || null,
          preferredLanguage: preferredLanguage || 'en',
          userId,
        },
        type: QueryTypes.UPDATE,
      }
    );

    // Fetch updated profile
    const updatedUser = await sequelize.query(
      `SELECT 
        id, uuid, email, phone, first_name, last_name, 
        avatar_url, date_of_birth, gender, preferred_language,
        created_at, updated_at
       FROM users WHERE id = :userId LIMIT 1`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    const profile = updatedUser[0];
    const signedAvatarUrl = await resolveAvatarUrl(profile.avatar_url);
    res.json({
      id: profile.id,
      uuid: profile.uuid,
      email: profile.email,
      phone: profile.phone,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: signedAvatarUrl,
      dateOfBirth: profile.date_of_birth,
      gender: profile.gender,
      preferredLanguage: profile.preferred_language,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /avatar-upload-url - Get presigned URL for avatar upload
router.post('/avatar-upload-url', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and WebP allowed' });
    }

    const uploadUrl = await S3Service.generatePresignedUploadUrl(
      String(userId),
      fileName,
      fileType
    );

    res.json({ uploadUrl, message: 'Upload URL generated successfully' });
  } catch (err) {
    console.error('Upload URL generation error:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// PUT /avatar - Update avatar URL
router.put('/avatar', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ error: 'avatarUrl is required' });
    }

    // Update avatar URL
    await sequelize.query(
      `UPDATE users SET avatar_url = :avatarUrl, updated_at = NOW() WHERE id = :userId`,
      {
        replacements: { avatarUrl, userId },
        type: QueryTypes.UPDATE,
      }
    );

    // Fetch updated profile
    const updatedUser = await sequelize.query(
      `SELECT 
        id, uuid, email, phone, first_name, last_name, 
        avatar_url, date_of_birth, gender, preferred_language,
        created_at, updated_at
       FROM users WHERE id = :userId LIMIT 1`,
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    const profile = updatedUser[0];
    const signedAvatarUrl = await resolveAvatarUrl(profile.avatar_url);
    res.json({
      id: profile.id,
      avatarUrl: signedAvatarUrl,
      message: 'Avatar updated successfully',
    });
  } catch (err) {
    console.error('Avatar update error:', err);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

export default router;

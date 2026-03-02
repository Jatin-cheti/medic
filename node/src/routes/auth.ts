import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import passport from 'passport';
import { sequelize } from '../services/sequelize';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

// Ensure secret typed as jwt.Secret
const JWT_SECRET = (process.env.JWT_SECRET || 'please_change_me') as unknown as jwt.Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me') as unknown as jwt.Secret;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

type RoleName = 'patient' | 'doctor' | 'admin';

function normalizeEmail(email?: string): string | null {
  if (!email) return null;
  const value = String(email).trim().toLowerCase();
  return value.length ? value : null;
}

function normalizePhone(phone?: string): string | null {
  if (!phone) return null;
  const value = String(phone).trim();
  return value.length ? value : null;
}

async function getRoleId(role: RoleName): Promise<number> {
  const rows = await sequelize.query(
    'SELECT id FROM roles WHERE name = :role LIMIT 1',
    {
      replacements: { role },
      type: QueryTypes.SELECT,
    }
  ) as Array<{ id: number }>;

  if (!rows.length) {
    throw new Error(`Role ${role} not found`);
  }

  return rows[0].id;
}

async function findUserByEmailOrPhone(email: string | null, phone: string | null) {
  if (!email && !phone) return null;

  const rows = await sequelize.query(
    `SELECT id, uuid, role_id, email, phone, password_hash, first_name, last_name, is_active, is_suspended
     FROM users
     WHERE (:email IS NOT NULL AND email = :email)
        OR (:phone IS NOT NULL AND phone = :phone)
     LIMIT 1`,
    {
      replacements: { email, phone },
      type: QueryTypes.SELECT,
    }
  ) as Array<any>;

  return rows[0] || null;
}

async function findUserByEmail(email: string | null) {
  if (!email) return null;

  const rows = await sequelize.query(
    `SELECT id, uuid, role_id, email, phone, password_hash, first_name, last_name, is_active, is_suspended
     FROM users WHERE email = :email LIMIT 1`,
    {
      replacements: { email },
      type: QueryTypes.SELECT,
    }
  ) as Array<any>;

  return rows[0] || null;
}

async function createUser(params: {
  role: RoleName;
  email: string | null;
  phone: string | null;
  password?: string;
  firstName: string;
  lastName: string;
  gender?: string | null;
  preferredLanguage?: string;
  googleId?: string;
}) {
  const roleId = await getRoleId(params.role);
  const passwordHash = params.password ? await bcrypt.hash(params.password, 10) : null;
  const now = new Date();

  const result = await sequelize.query(
    `INSERT INTO users (
      uuid, role_id, email, phone, password_hash, first_name, last_name,
      gender, preferred_language, google_id, is_verified, is_active, is_suspended,
      created_at, updated_at
    ) VALUES (
      :uuid, :roleId, :email, :phone, :passwordHash, :firstName, :lastName,
      :gender, :preferredLanguage, :googleId, :isVerified, 1, 0,
      :createdAt, :updatedAt
    )`,
    {
      replacements: {
        uuid: uuidv4(),
        roleId,
        email: params.email,
        phone: params.phone,
        passwordHash,
        firstName: params.firstName,
        lastName: params.lastName,
        gender: params.gender || null,
        preferredLanguage: params.preferredLanguage || 'en',
        googleId: params.googleId || null,
        isVerified: params.googleId ? 1 : (params.role === 'patient' ? 1 : 0),
        createdAt: now,
        updatedAt: now,
      },
      type: QueryTypes.INSERT,
    }
  ) as any;

  const insertedId = Array.isArray(result) ? result[0] : result;

  const users = await sequelize.query(
    `SELECT id, uuid, role_id, email, phone, first_name, last_name
     FROM users
     WHERE id = :id LIMIT 1`,
    {
      replacements: { id: insertedId },
      type: QueryTypes.SELECT,
    }
  ) as Array<any>;

  return users[0];
}

interface TokenPair {
  token: string;
  refreshToken: string;
}

function signToken(user: any, role: RoleName): TokenPair {
  const token = jwt.sign(
    {
      userId: user.id,
      uuid: user.uuid,
      email: user.email,
      phone: user.phone,
      role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      uuid: user.uuid,
      role,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  );

  return { token, refreshToken };
}

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    
    const user = await sequelize.query(
      `SELECT id, uuid, role_id, email, phone FROM users WHERE id = :userId LIMIT 1`,
      {
        replacements: { userId: decoded.userId },
        type: QueryTypes.SELECT,
      }
    ) as Array<any>;

    if (!user.length) {
      return res.status(401).json({ error: 'user not found' });
    }

    const roleRows = await sequelize.query(
      'SELECT name FROM roles WHERE id = :roleId LIMIT 1',
      {
        replacements: { roleId: user[0].role_id },
        type: QueryTypes.SELECT,
      }
    ) as Array<{ name: RoleName }>;

    const role = roleRows[0]?.name || 'patient';
    const tokens = signToken(user[0], role);
    
    return res.json({ token: tokens.token, refreshToken: tokens.refreshToken });
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(401).json({ error: 'invalid refresh token' });
  }
});

// Google OAuth GET endpoint - initiates OAuth flow
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

// Google OAuth callback - handles response from Google
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/auth/patient-login?error=auth_failed'
  }),
  async (req: Request, res: Response) => {
    try {
      const googleUser = req.user as any;
      
      if (!googleUser || !googleUser.googleId || !googleUser.email) {
        const redirectUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:4200'}/auth/patient-login?error=invalid_user_data`;
        return res.redirect(redirectUrl);
      }

      const { googleId, email, firstName, lastName } = googleUser;
      
      // Check if user exists with this google ID
      let user = await sequelize.query(
        `SELECT id, uuid, role_id, email, phone, first_name, last_name FROM users WHERE google_id = :googleId LIMIT 1`,
        {
          replacements: { googleId },
          type: QueryTypes.SELECT,
        }
      ) as Array<any>;

      // If not, check if email exists
      if (!user.length) {
        user = await sequelize.query(
          `SELECT id, uuid, role_id, email, phone, first_name, last_name FROM users WHERE email = :email LIMIT 1`,
          {
            replacements: { email: normalizeEmail(email) },
            type: QueryTypes.SELECT,
          }
        ) as Array<any>;

        // If email exists but no google ID, link the account
        if (user.length) {
          await sequelize.query(
            `UPDATE users SET google_id = :googleId, updated_at = :updatedAt WHERE id = :userId`,
            {
              replacements: {
                googleId,
                userId: user[0].id,
                updatedAt: new Date(),
              },
              type: QueryTypes.UPDATE,
            }
          );
          // Reload user data
          user = await sequelize.query(
            `SELECT id, uuid, role_id, email, phone, first_name, last_name FROM users WHERE id = :userId LIMIT 1`,
            {
              replacements: { userId: user[0].id },
              type: QueryTypes.SELECT,
            }
          ) as Array<any>;
        } else {
          // Create new patient account with Google
          const newUser = await createUser({
            role: 'patient',
            email: normalizeEmail(email),
            phone: null,
            firstName: firstName || 'User',
            lastName: lastName || '',
            googleId,
          });
          user = [newUser];
        }
      }

      if (!user.length) {
        const redirectUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:4200'}/auth/patient-login?error=user_creation_failed`;
        return res.redirect(redirectUrl);
      }

      const roleRows = await sequelize.query(
        'SELECT name FROM roles WHERE id = :roleId LIMIT 1',
        {
          replacements: { roleId: user[0].role_id },
          type: QueryTypes.SELECT,
        }
      ) as Array<{ name: RoleName }>;

      const role = roleRows[0]?.name || 'patient';
      const tokens = signToken(user[0], role);

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:4200'}/auth/google-success?token=${encodeURIComponent(tokens.token)}&refreshToken=${encodeURIComponent(tokens.refreshToken)}&role=${role}`;
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google callback error:', err);
      const redirectUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:4200'}/auth/patient-login?error=server_error`;
      res.redirect(redirectUrl);
    }
  }
);

// Google OAuth callback

router.post('/google-callback', async (req, res) => {
  const { googleId, email, firstName, lastName } = req.body;

  if (!googleId || !email) {
    return res.status(400).json({ error: 'googleId and email are required' });
  }

  try {
    // Check if user exists with this google ID
    let user = await sequelize.query(
      `SELECT id, uuid, role_id, email, phone FROM users WHERE google_id = :googleId LIMIT 1`,
      {
        replacements: { googleId },
        type: QueryTypes.SELECT,
      }
    ) as Array<any>;

    // If not, check if email exists
    if (!user.length) {
      user = await sequelize.query(
        `SELECT id, uuid, role_id, email, phone FROM users WHERE email = :email LIMIT 1`,
        {
          replacements: { email: normalizeEmail(email) },
          type: QueryTypes.SELECT,
        }
      ) as Array<any>;

      // If email exists but no google ID, link the account
      if (user.length) {
        await sequelize.query(
          `UPDATE users SET google_id = :googleId, updated_at = :updatedAt WHERE id = :userId`,
          {
            replacements: {
              googleId,
              userId: user[0].id,
              updatedAt: new Date(),
            },
            type: QueryTypes.UPDATE,
          }
        );
      } else {
        // Create new patient account with Google
        user = [await createUser({
          role: 'patient',
          email: normalizeEmail(email),
          phone: null,
          firstName: firstName || 'User',
          lastName: lastName || '',
          googleId,
        })];
      }
    }

    if (!user.length) {
      return res.status(500).json({ error: 'failed to process user' });
    }

    const roleRows = await sequelize.query(
      'SELECT name FROM roles WHERE id = :roleId LIMIT 1',
      {
        replacements: { roleId: user[0].role_id },
        type: QueryTypes.SELECT,
      }
    ) as Array<{ name: RoleName }>;

    const role = roleRows[0]?.name || 'patient';
    const tokens = signToken(user[0], role);

    return res.json({ user: user[0], token: tokens.token, refreshToken: tokens.refreshToken, role });
  } catch (err) {
    console.error('Google callback error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// Development: Test Google login endpoint (for testing without Google OAuth credentials)
router.post('/google-test', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    // Create a test Google ID
    const testGoogleId = `test-${Date.now()}`;
    
    // Use the same logic as google-callback
    let user = await sequelize.query(
      `SELECT id, uuid, role_id FROM users WHERE email = :email LIMIT 1`,
      {
        replacements: { email: normalizeEmail(email) },
        type: QueryTypes.SELECT,
      }
    ) as Array<any>;

    if (!user.length) {
      // Create new patient account with test Google ID
      user = [await createUser({
        role: 'patient',
        email: normalizeEmail(email),
        phone: null,
        firstName: firstName || 'Test User',
        lastName: lastName || '',
        googleId: testGoogleId,
      })];
    } else {
      // Link to existing account
      await sequelize.query(
        `UPDATE users SET google_id = :googleId, updated_at = :updatedAt WHERE id = :userId`,
        {
          replacements: {
            googleId: testGoogleId,
            userId: user[0].id,
            updatedAt: new Date(),
          },
          type: QueryTypes.UPDATE,
        }
      );
    }

    if (!user.length) {
      return res.status(500).json({ error: 'failed to process user' });
    }

    const roleRows = await sequelize.query(
      'SELECT name FROM roles WHERE id = :roleId LIMIT 1',
      {
        replacements: { roleId: user[0].role_id },
        type: QueryTypes.SELECT,
      }
    ) as Array<{ name: RoleName }>;

    const role = roleRows[0]?.name || 'patient';
    const tokens = signToken(user[0], role);

    return res.json({ user: user[0], token: tokens.token, refreshToken: tokens.refreshToken, role });
  } catch (err) {
    console.error('Test Google login error:', err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/patient/signup', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');
  const firstName = String(req.body?.firstName || '').trim();
  const lastName = String(req.body?.lastName || '').trim();
  const gender = req.body?.gender ? String(req.body.gender) : null;
  const preferredLanguage = req.body?.preferredLanguage ? String(req.body.preferredLanguage) : 'en';

  if (!email && !phone) {
    return res.status(400).json({ error: 'email or phone is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }
  if (!firstName) {
    return res.status(400).json({ error: 'firstName is required' });
  }

  try {
    const existing = await findUserByEmailOrPhone(email, phone);
    if (existing) {
      return res.status(409).json({ error: 'email or phone already registered' });
    }

    const user = await createUser({
      role: 'patient',
      email,
      phone,
      password,
      firstName,
      lastName,
      gender,
      preferredLanguage,
    });

    const tokens = signToken(user, 'patient');
    return res.status(201).json({ user, ...tokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/doctor/signup', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');
  const firstName = String(req.body?.firstName || '').trim();
  const lastName = String(req.body?.lastName || '').trim();
  const gender = req.body?.gender ? String(req.body.gender) : null;
  const preferredLanguage = req.body?.preferredLanguage ? String(req.body.preferredLanguage) : 'en';
  const registrationNumber = String(req.body?.registrationNumber || '').trim();
  const yearsOfExperience = Number(req.body?.yearsOfExperience || 0);
  const consultationFee = Number(req.body?.consultationFee || 0);
  const degreeFileName = String(req.body?.degreeFileName || '').trim();
  const degreeFileUrl = String(req.body?.degreeFileUrl || '').trim();
  const experienceFileName = String(req.body?.experienceFileName || '').trim();
  const experienceFileUrl = String(req.body?.experienceFileUrl || '').trim();

  if (!email && !phone) {
    return res.status(400).json({ error: 'email or phone is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }
  if (!firstName) {
    return res.status(400).json({ error: 'firstName is required' });
  }
  if (!registrationNumber) {
    return res.status(400).json({ error: 'registrationNumber is required' });
  }
  if (!degreeFileName || !degreeFileUrl || !experienceFileName || !experienceFileUrl) {
    return res.status(400).json({ error: 'degree and experience documents are required' });
  }

  try {
    const existing = await findUserByEmailOrPhone(email, phone);
    if (existing) {
      return res.status(409).json({ error: 'email or phone already registered' });
    }

    const existingReg = await sequelize.query(
      'SELECT id FROM doctor_profiles WHERE registration_number = :registrationNumber LIMIT 1',
      {
        replacements: { registrationNumber },
        type: QueryTypes.SELECT,
      }
    ) as Array<any>;

    if (existingReg.length) {
      return res.status(409).json({ error: 'registration number already exists' });
    }

    const user = await createUser({
      role: 'doctor',
      email,
      phone,
      password,
      firstName,
      lastName,
      gender,
      preferredLanguage,
    });

    const now = new Date();

    const doctorInsert = await sequelize.query(
      `INSERT INTO doctor_profiles (
        uuid, user_id, registration_number, years_of_experience,
        consultation_fee, is_verified, is_approved, is_suspended,
        rating, total_consultations, created_at, updated_at
      ) VALUES (
        :uuid, :userId, :registrationNumber, :yearsOfExperience,
        :consultationFee, 0, 0, 0,
        0, 0, :createdAt, :updatedAt
      )`,
      {
        replacements: {
          uuid: uuidv4(),
          userId: user.id,
          registrationNumber,
          yearsOfExperience: Number.isFinite(yearsOfExperience) ? yearsOfExperience : 0,
          consultationFee: Number.isFinite(consultationFee) ? consultationFee : 0,
          createdAt: now,
          updatedAt: now,
        },
        type: QueryTypes.INSERT,
      }
    ) as any;

    const doctorProfileId = Array.isArray(doctorInsert) ? doctorInsert[0] : doctorInsert;

    const documentTypes = await sequelize.query(
      `SELECT id, code FROM document_types WHERE code IN ('DEGREE', 'SPEC_CERT')`,
      { type: QueryTypes.SELECT }
    ) as Array<{ id: number; code: string }>;

    const degreeType = documentTypes.find((d) => d.code === 'DEGREE');
    const experienceType = documentTypes.find((d) => d.code === 'SPEC_CERT') || degreeType;

    if (!degreeType) {
      return res.status(500).json({ error: 'document type DEGREE not found' });
    }

    await sequelize.query(
      `INSERT INTO doctor_documents (
        uuid, doctor_id, document_type_id, file_url, file_name,
        status, created_at, updated_at
      ) VALUES
      (:degreeUuid, :doctorId, :degreeTypeId, :degreeFileUrl, :degreeFileName, 'pending', :createdAt, :updatedAt),
      (:experienceUuid, :doctorId, :experienceTypeId, :experienceFileUrl, :experienceFileName, 'pending', :createdAt, :updatedAt)
      `,
      {
        replacements: {
          degreeUuid: uuidv4(),
          experienceUuid: uuidv4(),
          doctorId: doctorProfileId,
          degreeTypeId: degreeType.id,
          experienceTypeId: experienceType?.id || degreeType.id,
          degreeFileUrl,
          degreeFileName,
          experienceFileUrl,
          experienceFileName,
          createdAt: now,
          updatedAt: now,
        },
        type: QueryTypes.INSERT,
      }
    );

    const token = signToken(user, 'doctor');
    return res.status(201).json({
      user,
      doctorProfile: {
        id: doctorProfileId,
        registrationNumber,
        yearsOfExperience,
        consultationFee,
      },
      ...token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/patient/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');

  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: 'email or phone and password required' });
  }

  try {
    const user = await findUserByEmailOrPhone(email, phone);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const patientRoleId = await getRoleId('patient');
    if (Number(user.role_id) !== Number(patientRoleId)) {
      return res.status(403).json({ error: 'not a patient account' });
    }

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const tokens = signToken(user, 'patient');
    return res.json({ user, ...tokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/doctor/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');

  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: 'email or phone and password required' });
  }

  try {
    const user = await findUserByEmailOrPhone(email, phone);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const doctorRoleId = await getRoleId('doctor');
    if (Number(user.role_id) !== Number(doctorRoleId)) {
      return res.status(403).json({ error: 'not a doctor account' });
    }

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const doctorProfiles = await sequelize.query(
      `SELECT id, registration_number, is_verified, is_approved
       FROM doctor_profiles
       WHERE user_id = :userId
       LIMIT 1`,
      {
        replacements: { userId: user.id },
        type: QueryTypes.SELECT,
      }
    ) as Array<any>;

    const tokens = signToken(user, 'doctor');
    return res.json({ user, doctorProfile: doctorProfiles[0] || null, ...tokens });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/register', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');
  const username = String(req.body?.username || '').trim();
  const [firstName, ...rest] = username ? username.split(' ') : [''];
  const lastName = rest.join(' ').trim();

  if (!email && !phone) return res.status(400).json({ error: 'email or phone is required' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });

  try {
    const existing = await findUserByEmailOrPhone(email, phone);
    if (existing) return res.status(409).json({ error: 'email or phone already registered' });

    const user = await createUser({
      role: 'patient',
      email,
      phone,
      password,
      firstName: firstName || 'User',
      lastName,
      preferredLanguage: 'en',
    });

    const tokens = signToken(user, 'patient');
    res.status(201).json({ user, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const phone = normalizePhone(req.body?.phone);
  const password = String(req.body?.password || '');

  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: 'email or phone and password required' });
  }

  try {
    const user = await findUserByEmailOrPhone(email, phone);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const roleRows = await sequelize.query(
      'SELECT name FROM roles WHERE id = :roleId LIMIT 1',
      {
        replacements: { roleId: user.role_id },
        type: QueryTypes.SELECT,
      }
    ) as Array<{ name: RoleName }>;

    const role = roleRows[0]?.name || 'patient';
    const tokens = signToken(user, role);
    return res.json({ user, ...tokens, role });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

export default router;
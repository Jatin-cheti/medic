import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, verifyRole } from '../middleware/auth';
import { sequelize } from '../services/sequelize';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const JWT_SECRET = (process.env.JWT_SECRET || 'please_change_me') as unknown as jwt.Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'refresh_secret_change_me') as unknown as jwt.Secret;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Ensures super_admin role exists in the roles table.
 * Alters the ENUM if needed and inserts the row.
 * Safe to run multiple times.
 */
export async function ensureAdminRoles(): Promise<void> {
  try {
    // Extend ENUM to include super_admin
    await sequelize.query(
      `ALTER TABLE roles MODIFY COLUMN name ENUM('patient','doctor','admin','super_admin') NOT NULL`
    );
    // Extend doctor_documents status ENUM to include changes_requested
    await sequelize.query(
      `ALTER TABLE doctor_documents MODIFY COLUMN status ENUM('pending','approved','rejected','changes_requested') NOT NULL DEFAULT 'pending'`
    );
    // Insert super_admin role if missing
    const existing = await sequelize.query(
      "SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1",
      { type: QueryTypes.SELECT }
    ) as Array<{ id: number }>;

    if (!existing.length) {
      await sequelize.query(
        `INSERT INTO roles (uuid, name, description, created_at, updated_at)
         VALUES (:uuid, 'super_admin', 'Super Administrator with full platform control', NOW(), NOW())`,
        { replacements: { uuid: uuidv4() }, type: QueryTypes.INSERT }
      );
      console.log('✅ super_admin role created');
    }
  } catch (err) {
    console.error('ensureAdminRoles error:', err);
  }
}

// ─────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const users = await sequelize.query(
      `SELECT u.id, u.uuid, u.email, u.password_hash, u.first_name, u.last_name,
              u.is_active, u.is_suspended, r.name as role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = :email AND r.name IN ('admin', 'super_admin')
       LIMIT 1`,
      { replacements: { email }, type: QueryTypes.SELECT }
    ) as Array<any>;

    const user = users[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    if (Number(user.is_active) !== 1 || Number(user.is_suspended) === 1) {
      return res.status(403).json({ error: 'account disabled' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, uuid: user.uuid, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, uuid: user.uuid, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    await sequelize.query(
      'UPDATE users SET last_login = NOW() WHERE id = :id',
      { replacements: { id: user.id }, type: QueryTypes.UPDATE }
    );

    return res.json({
      token,
      refreshToken,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────
router.get('/stats', verifyToken, verifyRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  const role = (req as any).user?.role;
  try {
    const [[doctorCount], [patientCount], [pendingDocs]] = await Promise.all([
      sequelize.query(
        `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'doctor'`,
        { type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
      sequelize.query(
        `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'patient'`,
        { type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
      sequelize.query(
        `SELECT COUNT(*) as total FROM doctor_documents WHERE status = 'pending'`,
        { type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
    ]);

    const stats: any = {
      doctors: Number((doctorCount as any).total),
      patients: Number((patientCount as any).total),
      pendingDocuments: Number((pendingDocs as any).total),
    };

    if (role === 'super_admin') {
      const [adminCount] = await sequelize.query(
        `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'admin'`,
        { type: QueryTypes.SELECT }
      ) as Array<{ total: number }>;
      stats.admins = Number((adminCount as any).total);
    }

    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─────────────────────────────────────────────
// GET /api/admin/doctors/:id  – doctor profile
// ─────────────────────────────────────────────
async function getDoctorById(req: Request, res: Response) {
  const doctorId = parseInt(req.params['id']);
  if (!doctorId || isNaN(doctorId)) return res.status(400).json({ error: 'invalid doctor id' });

  try {
    const [users] = await Promise.all([
      sequelize.query(
        `SELECT u.id, u.uuid, u.email, u.phone, u.first_name, u.last_name,
                u.is_active, u.is_verified, u.is_suspended, u.created_at, u.last_login,
                dp.id as doctor_profile_id, dp.registration_number, dp.bio,
                dp.is_verified as doc_verified, dp.is_approved,
                dp.years_of_experience, dp.consultation_fee
         FROM users u
         JOIN roles r ON r.id = u.role_id AND r.name = 'doctor'
         LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
         WHERE u.id = :doctorId
         LIMIT 1`,
        { replacements: { doctorId }, type: QueryTypes.SELECT }
      ),
    ]);
    const doctor = (users as any[])[0];
    if (!doctor) return res.status(404).json({ error: 'doctor not found' });

    const documents = await sequelize.query(
      `SELECT dd.id, dd.uuid, dd.file_url, dd.file_name, dd.status,
              dd.rejection_reason, dd.verified_at, dd.created_at,
              dt.name as document_type, dt.code as document_code
       FROM doctor_documents dd
       JOIN document_types dt ON dt.id = dd.document_type_id
       JOIN doctor_profiles dp ON dp.id = dd.doctor_id
       WHERE dp.user_id = :doctorId
       ORDER BY dd.created_at DESC`,
      { replacements: { doctorId }, type: QueryTypes.SELECT }
    );

    const specialties = await sequelize.query(
      `SELECT s.name FROM specialties s
       JOIN doctor_specialties ds ON ds.specialty_id = s.id
       JOIN doctor_profiles dp ON dp.id = ds.doctor_id
       WHERE dp.user_id = :doctorId`,
      { replacements: { doctorId }, type: QueryTypes.SELECT }
    ) as Array<{ name: string }>;

    return res.json({ doctor, documents, specialties });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}

// ─────────────────────────────────────────────
// Shared list helpers
// ─────────────────────────────────────────────
async function listDoctors(req: Request, res: Response) {
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const limit = Math.min(100, parseInt(req.query['limit'] as string) || 20);
  const offset = (page - 1) * limit;
  const search = String(req.query['search'] || '').trim();

  // Whitelist sort columns to prevent SQL injection
  const SORT_WHITELIST: Record<string, string> = {
    name: 'u.first_name',
    email: 'u.email',
    registration_number: 'dp.registration_number',
    created_at: 'u.created_at',
    status: 'u.is_active',
  };
  const rawSortBy = String(req.query['sortBy'] || 'created_at');
  const sortCol = SORT_WHITELIST[rawSortBy] || 'u.created_at';
  const sortDir = String(req.query['sortOrder'] || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const searchWhere = search
    ? `AND (u.email LIKE :search OR u.first_name LIKE :search OR u.last_name LIKE :search OR dp.registration_number LIKE :search)`
    : '';
  const replacements: any = { limit, offset, search: `%${search}%` };

  try {
    const [doctors, [countRow]] = await Promise.all([
      sequelize.query(
        `SELECT u.id, u.uuid, u.email, u.phone, u.first_name, u.last_name,
                u.is_active, u.is_verified, u.is_suspended, u.created_at,
                dp.id as doctor_profile_id, dp.registration_number,
                dp.is_verified as doc_verified, dp.is_approved,
                dp.years_of_experience, dp.consultation_fee
         FROM users u
         JOIN roles r ON r.id = u.role_id AND r.name = 'doctor'
         LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
         WHERE 1=1 ${searchWhere}
         ORDER BY ${sortCol} ${sortDir}
         LIMIT :limit OFFSET :offset`,
        { replacements, type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT COUNT(*) as total FROM users u
         JOIN roles r ON r.id = u.role_id AND r.name = 'doctor'
         LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
         WHERE 1=1 ${searchWhere}`,
        { replacements, type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
    ]);
    const total = Number((countRow as any).total);
    return res.json({ data: doctors, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}

async function listPatients(req: Request, res: Response) {
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const limit = Math.min(100, parseInt(req.query['limit'] as string) || 20);
  const offset = (page - 1) * limit;
  const search = String(req.query['search'] || '').trim();

  // Whitelist sort columns to prevent SQL injection
  const SORT_WHITELIST: Record<string, string> = {
    name: 'u.first_name',
    email: 'u.email',
    phone: 'u.phone',
    created_at: 'u.created_at',
    status: 'u.is_active',
  };
  const rawSortBy = String(req.query['sortBy'] || 'created_at');
  const sortCol = SORT_WHITELIST[rawSortBy] || 'u.created_at';
  const sortDir = String(req.query['sortOrder'] || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const searchWhere = search
    ? `AND (u.email LIKE :search OR u.first_name LIKE :search OR u.last_name LIKE :search)`
    : '';
  const replacements: any = { limit, offset, search: `%${search}%` };

  try {
    const [patients, [countRow]] = await Promise.all([
      sequelize.query(
        `SELECT u.id, u.uuid, u.email, u.phone, u.first_name, u.last_name,
                u.is_active, u.is_verified, u.is_suspended, u.created_at
         FROM users u
         JOIN roles r ON r.id = u.role_id AND r.name = 'patient'
         WHERE 1=1 ${searchWhere}
         ORDER BY ${sortCol} ${sortDir}
         LIMIT :limit OFFSET :offset`,
        { replacements, type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT COUNT(*) as total FROM users u
         JOIN roles r ON r.id = u.role_id AND r.name = 'patient'
         WHERE 1=1 ${searchWhere}`,
        { replacements, type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
    ]);
    const total = Number((countRow as any).total);
    return res.json({ data: patients, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}

async function listDocuments(req: Request, res: Response) {
  const status = String(req.query['status'] || 'pending').trim();
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const limit = Math.min(100, parseInt(req.query['limit'] as string) || 20);
  const offset = (page - 1) * limit;

  const statusWhere = status === 'all' ? '' : 'AND dd.status = :status';
  const replacements: any = { limit, offset, status };

  try {
    const [docs, [countRow]] = await Promise.all([
      sequelize.query(
        `SELECT dd.id, dd.uuid, dd.file_url, dd.file_name, dd.status,
                dd.rejection_reason, dd.verified_at, dd.created_at,
                dt.name as document_type, dt.code as document_code,
                dp.id as doctor_profile_id, dp.registration_number,
                u.id as user_id, u.first_name, u.last_name, u.email,
                rev.first_name as reviewer_first_name, rev.last_name as reviewer_last_name
         FROM doctor_documents dd
         JOIN document_types dt ON dt.id = dd.document_type_id
         JOIN doctor_profiles dp ON dp.id = dd.doctor_id
         JOIN users u ON u.id = dp.user_id
         LEFT JOIN users rev ON rev.id = dd.verified_by
         WHERE 1=1 ${statusWhere}
         ORDER BY dd.created_at DESC
         LIMIT :limit OFFSET :offset`,
        { replacements, type: QueryTypes.SELECT }
      ),
      sequelize.query(
        `SELECT COUNT(*) as total FROM doctor_documents dd WHERE 1=1 ${statusWhere}`,
        { replacements, type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
    ]);
    const total = Number((countRow as any).total);
    return res.json({ data: docs, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}

// ─────────────────────────────────────────────
// GET /api/admin/dashboard-stats  (alias with renamed fields)
// ─────────────────────────────────────────────
router.get('/dashboard-stats', verifyToken, verifyRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  const role = (req as any).user?.role;
  try {
    const [[doctorCount], [patientCount], [pendingDocs]] = await Promise.all([
      sequelize.query(
        `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'doctor'`,
        { type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
      sequelize.query(
        `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'patient'`,
        { type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
      sequelize.query(
        `SELECT COUNT(*) as total FROM doctor_documents WHERE status = 'pending'`,
        { type: QueryTypes.SELECT }
      ) as Promise<Array<{ total: number }>>,
    ]);

    const stats: any = {
      totalDoctors: Number((doctorCount as any).total),
      totalPatients: Number((patientCount as any).total),
      pendingDocuments: Number((pendingDocs as any).total),
    };

    if (role === 'super_admin') {
      const [adminCount] = await sequelize.query(
        `SELECT COUNT(*) as total FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'admin'`,
        { type: QueryTypes.SELECT }
      ) as Array<{ total: number }>;
      stats.totalAdmins = Number((adminCount as any).total);
    }

    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─────────────────────────────────────────────
// Admin routes (admin + super_admin)
// ─────────────────────────────────────────────
router.get('/doctors', verifyToken, verifyRole(['admin', 'super_admin']), listDoctors);
router.get('/doctors/:id', verifyToken, verifyRole(['admin', 'super_admin']), getDoctorById);
router.get('/patients', verifyToken, verifyRole(['admin', 'super_admin']), listPatients);
router.get('/doctor-documents', verifyToken, verifyRole(['admin', 'super_admin']), listDocuments);

router.post('/documents/:id/approve', verifyToken, verifyRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  const docId = parseInt(req.params['id']);
  const reviewerId = (req as any).user?.userId;

  if (!docId || isNaN(docId)) return res.status(400).json({ error: 'invalid document id' });

  try {
    await sequelize.query(
      `UPDATE doctor_documents
       SET status = 'approved', verified_by = :reviewerId, verified_at = NOW(),
           rejection_reason = NULL, updated_at = NOW()
       WHERE id = :docId`,
      { replacements: { docId, reviewerId }, type: QueryTypes.UPDATE }
    );

    // Auto-verify doctor profile when all their documents are approved
    await sequelize.query(
      `UPDATE doctor_profiles dp
       SET is_verified = 1, is_approved = 1, updated_at = NOW()
       WHERE dp.id = (SELECT doctor_id FROM doctor_documents WHERE id = :docId)
         AND NOT EXISTS (
           SELECT 1 FROM doctor_documents
           WHERE doctor_id = dp.id AND status != 'approved'
         )`,
      { replacements: { docId }, type: QueryTypes.UPDATE }
    );

    return res.json({ message: 'document approved' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/documents/:id/request-changes', verifyToken, verifyRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  const docId = parseInt(req.params['id']);
  const notes = String(req.body?.notes || '').trim();
  const reviewerId = (req as any).user?.userId;

  if (!docId || isNaN(docId)) return res.status(400).json({ error: 'invalid document id' });
  if (!notes) return res.status(400).json({ error: 'change request notes are required' });

  try {
    await sequelize.query(
      `UPDATE doctor_documents
       SET status = 'changes_requested', verified_by = :reviewerId, verified_at = NOW(),
           rejection_reason = :notes, updated_at = NOW()
       WHERE id = :docId`,
      { replacements: { docId, reviewerId, notes }, type: QueryTypes.UPDATE }
    );
    return res.json({ message: 'changes requested' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.post('/documents/:id/reject', verifyToken, verifyRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  const docId = parseInt(req.params['id']);
  const reason = String(req.body?.reason || '').trim();
  const reviewerId = (req as any).user?.userId;

  if (!docId || isNaN(docId)) return res.status(400).json({ error: 'invalid document id' });
  if (!reason) return res.status(400).json({ error: 'rejection reason is required' });

  try {
    await sequelize.query(
      `UPDATE doctor_documents
       SET status = 'rejected', verified_by = :reviewerId, verified_at = NOW(),
           rejection_reason = :reason, updated_at = NOW()
       WHERE id = :docId`,
      { replacements: { docId, reviewerId, reason }, type: QueryTypes.UPDATE }
    );
    return res.json({ message: 'document rejected' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─────────────────────────────────────────────
// POST /api/admin/dev/seed-test-documents
// Seeds fake pending documents for all doctors that have no documents.
// Useful in dev/staging to test the document verification flow.
// ─────────────────────────────────────────────
router.post('/dev/seed-test-documents', verifyToken, verifyRole(['admin', 'super_admin']), async (req: Request, res: Response) => {
  try {
    // Ensure document types exist
    const DEGREE_CODE = 'DEGREE';
    const CERT_CODE = 'SPEC_CERT';
    for (const [code, name] of [[DEGREE_CODE, 'Degree Certificate'], [CERT_CODE, 'Specialization Certificate']] as [string, string][]) {
      const existing = await sequelize.query(
        'SELECT id FROM document_types WHERE code = :code LIMIT 1',
        { replacements: { code }, type: QueryTypes.SELECT }
      ) as Array<{ id: number }>;
      if (!existing.length) {
        await sequelize.query(
          `INSERT INTO document_types (uuid, name, code, description, is_required, created_at, updated_at)
           VALUES (:uuid, :name, :code, :description, 1, NOW(), NOW())`,
          { replacements: { uuid: uuidv4(), name, code, description: name }, type: QueryTypes.INSERT }
        );
      }
    }

    // Get all doctor profiles that have no documents
    const doctorProfiles = await sequelize.query(
      `SELECT dp.id FROM doctor_profiles dp
       WHERE NOT EXISTS (SELECT 1 FROM doctor_documents dd WHERE dd.doctor_id = dp.id)`,
      { type: QueryTypes.SELECT }
    ) as Array<{ id: number }>;

    if (!doctorProfiles.length) {
      return res.json({ message: 'No doctors without documents found', seeded: 0 });
    }

    const [degreeType] = await sequelize.query(
      'SELECT id FROM document_types WHERE code = :code LIMIT 1',
      { replacements: { code: DEGREE_CODE }, type: QueryTypes.SELECT }
    ) as Array<{ id: number }>;
    const [certType] = await sequelize.query(
      'SELECT id FROM document_types WHERE code = :code LIMIT 1',
      { replacements: { code: CERT_CODE }, type: QueryTypes.SELECT }
    ) as Array<{ id: number }>;

    let seededCount = 0;
    for (const dp of doctorProfiles) {
      for (const [typeId, fname] of [[degreeType.id, 'degree.pdf'], [certType.id, 'cert.pdf']] as [number, string][]) {
        await sequelize.query(
          `INSERT INTO doctor_documents (uuid, doctor_id, document_type_id, file_name, file_url, status, created_at, updated_at)
           VALUES (:uuid, :doctorId, :typeId, :fname, :furl, 'pending', NOW(), NOW())`,
          {
            replacements: {
              uuid: uuidv4(),
              doctorId: dp.id,
              typeId,
              fname,
              furl: `https://medic-docs-placeholder.s3.amazonaws.com/test/${dp.id}/${fname}`,
            },
            type: QueryTypes.INSERT,
          }
        );
        seededCount++;
      }
    }

    return res.json({ message: `Seeded ${seededCount} test documents for ${doctorProfiles.length} doctor(s)`, seeded: seededCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─────────────────────────────────────────────
// Super Admin only routes (POST /api/admin/super/*)
// ─────────────────────────────────────────────
router.post('/super/create-admin', verifyToken, verifyRole(['super_admin']), async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const firstName = String(req.body?.firstName || '').trim();
  const lastName = String(req.body?.lastName || '').trim();

  if (!email || !password || !firstName) {
    return res.status(400).json({ error: 'email, password and firstName are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  try {
    const existingUser = await sequelize.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email }, type: QueryTypes.SELECT }
    ) as Array<any>;
    if (existingUser.length) return res.status(409).json({ error: 'email already registered' });

    const adminRole = await sequelize.query(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1",
      { type: QueryTypes.SELECT }
    ) as Array<{ id: number }>;
    if (!adminRole.length) return res.status(500).json({ error: 'admin role not found' });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await sequelize.query(
      `INSERT INTO users (uuid, role_id, email, phone, password_hash, first_name, last_name,
                          is_verified, is_active, is_suspended, created_at, updated_at)
       VALUES (:uuid, :roleId, :email, NULL, :passwordHash, :firstName, :lastName,
               1, 1, 0, NOW(), NOW())`,
      {
        replacements: {
          uuid: uuidv4(),
          roleId: adminRole[0].id,
          email,
          passwordHash,
          firstName,
          lastName: lastName || '',
        },
        type: QueryTypes.INSERT,
      }
    ) as any;

    const insertedId = Array.isArray(result) ? result[0] : result;
    return res.status(201).json({
      message: 'admin created successfully',
      admin: { id: insertedId, email, firstName, lastName, role: 'admin' },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// Super admin listing routes (same handlers, stricter guard)
router.get('/super/doctors', verifyToken, verifyRole(['super_admin']), listDoctors);
router.get('/super/patients', verifyToken, verifyRole(['super_admin']), listPatients);
router.get('/super/doctor-documents', verifyToken, verifyRole(['super_admin']), listDocuments);
router.get('/super/doctors/:id', verifyToken, verifyRole(['super_admin']), getDoctorById);

export default router;

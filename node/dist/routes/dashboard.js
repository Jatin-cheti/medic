"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sequelize_1 = require("sequelize");
const sequelize_2 = require("../services/sequelize");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Dashboard data for patients
router.get('/dashboard', auth_1.verifyToken, (0, auth_1.verifyRole)(['patient']), async (req, res) => {
    try {
        console.log('Dashboard route handler called');
        const user = req.user;
        const userId = user?.userId;
        console.log('User in dashboard:', { userId, email: user?.email });
        // Get upcoming appointments
        const appointments = await sequelize_2.sequelize.query(`SELECT 
        a.id, a.uuid, a.scheduled_at as appointment_date, a.status,
        u.id as doctor_id, u.first_name as doctor_first_name, 
        u.last_name as doctor_last_name, dp.consultation_fee,
        GROUP_CONCAT(s.name) as specialty
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN users u ON dp.user_id = u.id
      LEFT JOIN doctor_specialties ds ON dp.id = ds.doctor_id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      WHERE a.patient_id = :userId AND a.scheduled_at > NOW()
      GROUP BY a.id
      ORDER BY a.scheduled_at ASC
      LIMIT 5`, {
            replacements: { userId },
            type: sequelize_1.QueryTypes.SELECT,
        });
        // Get verified doctors
        const doctors = await sequelize_2.sequelize.query(`SELECT 
        u.id, u.uuid, u.first_name, u.last_name, u.email,
        dp.id as profile_id, dp.consultation_fee, 
        COALESCE(ROUND(AVG(r.rating), 1), 0) as rating,
        COUNT(a.id) as total_consultations,
        GROUP_CONCAT(s.name) as specialties
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      LEFT JOIN doctor_specialties ds ON dp.id = ds.doctor_id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      LEFT JOIN reviews r ON dp.id = r.doctor_id
      LEFT JOIN appointments a ON dp.id = a.doctor_id AND a.status = 'completed'
      WHERE dp.is_verified = 1
      GROUP BY dp.id
      ORDER BY rating DESC, total_consultations DESC
      LIMIT 6`, {
            type: sequelize_1.QueryTypes.SELECT,
        });
        // Get recent conversations (simplified)
        const conversations = [];
        // TODO: Implement conversations query based on actual table structure
        // Get patient info
        const patientInfo = await sequelize_2.sequelize.query(`SELECT id, first_name, last_name, email, phone, gender, preferred_language
       FROM users WHERE id = :userId`, {
            replacements: { userId },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return res.json({
            patient: patientInfo[0] || null,
            appointments,
            doctors,
            conversations,
            stats: {
                totalAppointments: appointments.length,
                totalDoctors: doctors.length,
                recentChats: conversations.length,
            }
        });
    }
    catch (err) {
        console.error('Dashboard fetch error:', err);
        return res.status(500).json({ error: 'server error' });
    }
});
// Search doctors
router.get('/doctors/search', auth_1.verifyToken, (0, auth_1.verifyRole)(['patient']), async (req, res) => {
    try {
        const { specialty, search, limit = 10, offset = 0 } = req.query;
        let query = `
      SELECT 
        u.id, u.uuid, u.first_name, u.last_name, u.email,
        dp.id as profile_id, dp.consultation_fee, dp.rating, dp.total_consultations,
        GROUP_CONCAT(sp.name) as specialties
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      LEFT JOIN doctor_specialties ds ON dp.id = ds.doctor_id
      LEFT JOIN specialties sp ON ds.specialty_id = sp.id
      WHERE dp.is_verified = 1 AND dp.is_approved = 1 AND dp.is_suspended = 0
    `;
        const replacements = {};
        if (specialty) {
            query += ` AND sp.name LIKE :specialty`;
            replacements.specialty = `%${specialty}%`;
        }
        if (search) {
            query += ` AND (u.first_name LIKE :search OR u.last_name LIKE :search OR u.email LIKE :search)`;
            replacements.search = `%${search}%`;
        }
        query += ` GROUP BY dp.id ORDER BY dp.rating DESC LIMIT :limit OFFSET :offset`;
        replacements.limit = parseInt(limit);
        replacements.offset = parseInt(offset);
        const doctors = await sequelize_2.sequelize.query(query, {
            replacements,
            type: sequelize_1.QueryTypes.SELECT,
            raw: true,
        });
        return res.json({ doctors });
    }
    catch (err) {
        console.error('Doctor search error:', err);
        return res.status(500).json({ error: 'server error' });
    }
});
// Get doctor profile
router.get('/doctors/:doctorId', auth_1.verifyToken, (0, auth_1.verifyRole)(['patient']), async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await sequelize_2.sequelize.query(`SELECT 
        u.id, u.uuid, u.first_name, u.last_name, u.email, u.phone, u.gender,
        dp.id as profile_id, dp.registration_number, dp.years_of_experience,
        dp.consultation_fee, dp.rating, dp.total_consultations, dp.is_verified, dp.is_approved,
        GROUP_CONCAT(sp.name) as specialties
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      LEFT JOIN doctor_specialties ds ON dp.id = ds.doctor_id
      LEFT JOIN specialties sp ON ds.specialty_id = sp.id
      WHERE u.id = :doctorId AND dp.is_verified = 1
      GROUP BY dp.id`, {
            replacements: { doctorId },
            type: sequelize_1.QueryTypes.SELECT,
        });
        if (!doctor.length) {
            return res.status(404).json({ error: 'doctor not found' });
        }
        return res.json({ doctor: doctor[0] });
    }
    catch (err) {
        console.error('Doctor profile fetch error:', err);
        return res.status(500).json({ error: 'server error' });
    }
});
// Get appointments history
router.get('/appointments/history', auth_1.verifyToken, (0, auth_1.verifyRole)(['patient']), async (req, res) => {
    try {
        const user = req.user;
        const userId = user?.userId;
        const { limit = 20, offset = 0 } = req.query;
        const appointments = await sequelize_2.sequelize.query(`SELECT 
        a.id, a.uuid, a.scheduled_at, a.status, a.notes,
        u.first_name as doctor_first_name, u.last_name as doctor_last_name,
        dp.consultation_fee, GROUP_CONCAT(s.name) as specialty
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN users u ON dp.user_id = u.id
      LEFT JOIN doctor_specialties ds ON dp.id = ds.doctor_id
      LEFT JOIN specialties s ON ds.specialty_id = s.id
      WHERE a.patient_id = :userId
      GROUP BY a.id
      ORDER BY a.scheduled_at DESC
      LIMIT :limit OFFSET :offset`, {
            replacements: { userId, limit: parseInt(limit), offset: parseInt(offset) },
            type: sequelize_1.QueryTypes.SELECT,
        });
        return res.json({ appointments });
    }
    catch (err) {
        console.error('Appointments fetch error:', err);
        return res.status(500).json({ error: 'server error' });
    }
});
exports.default = router;

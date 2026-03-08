"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const doctor_routes_1 = __importDefault(require("./routes/doctor.routes"));
const profile_1 = __importDefault(require("./routes/profile"));
const appointment_routes_1 = require("./routes/appointment.routes");
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
const symptomChecker_routes_1 = __importDefault(require("./routes/symptomChecker.routes"));
const superadmin_routes_1 = __importDefault(require("./routes/superadmin.routes"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const error_middleware_1 = require("./middlewares/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS middleware
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://medic-cf1u6bwpy-jatin-chetis-projects.vercel.app',
        'http://localhost:4200',
        'http://localhost:3000',
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Healthcheck — required for Railway deployment probe
app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'Medic API', version: '1.0.0' });
});
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/doctors', doctor_routes_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/appointments', appointment_routes_1.appointmentRouter);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/prescriptions', prescription_routes_1.default);
app.use('/api/symptom-checker', symptomChecker_routes_1.default);
app.use('/api/superadmin', superadmin_routes_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/documents', documentRoutes_1.default);
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;

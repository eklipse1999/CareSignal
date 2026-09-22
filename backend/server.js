require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const predictionController = require('./controllers/predictionController');

if (!process.env.JWT_SECRET || !process.env.ML_SERVICE_URL) {
  throw new Error('JWT_SECRET and ML_SERVICE_URL must be configured');
}
if (!/^[a-f0-9]{64}$/i.test(process.env.ENCRYPTION_KEY || '')) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hexadecimal AES-256 key');
}

const app = express();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' }
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100kb' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/predictions', predictionRoutes);
app.get('/api/symptoms', predictionController.listSymptoms);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && error.body) return res.status(400).json({ error: 'Invalid JSON body' });
  return next(error);
});

const port = Number(process.env.PORT || 8000);
app.listen(port, () => console.log(`Backend listening on port ${port}`));

module.exports = app;
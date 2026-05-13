require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ─── Module 1: Auth ───────────────────────────────────────────
const userRoutes = require('./modules/Module1_Auth/routes/userRoutes');
const adminRoutes = require('./modules/Module1_Auth/routes/adminRoutes');

// ─── Module 2: Upload ─────────────────────────────────────────
const uploadRoutes = require('./modules/Module2_Upload/routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// ─── Routes ───────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scans', uploadRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'Mind Modeler API is operational',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Connect & Listen ─────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀  Mind Modeler API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

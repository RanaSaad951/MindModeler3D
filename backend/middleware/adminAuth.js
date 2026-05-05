const admin = require('firebase-admin');

// ─── Initialize Firebase Admin SDK (singleton) ────────────────
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅  Firebase Admin SDK initialized');
  } catch (err) {
    console.error('⚠️   Firebase Admin SDK init failed:', err.message);
    console.error('     Ensure GOOGLE_APPLICATION_CREDENTIALS points to a valid serviceAccountKey.json');
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mindmodeler.com';

/**
 * adminAuth middleware
 * - Expects:  Authorization: Bearer <firebase-id-token>
 * - Verifies token with Firebase Admin SDK
 * - Enforces email === ADMIN_EMAIL
 * - Returns 401 if token missing/invalid, 403 if not admin
 */
const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No authentication token provided.',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Administrator access only.',
      });
    }

    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Token is invalid or has expired.',
    });
  }
};

module.exports = adminAuth;

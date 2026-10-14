const admin = require('firebase-admin');

// ─── Initialize Firebase Admin SDK (singleton) ────────────────
// verifyIdToken() only needs the project ID — it validates JWTs
// against Google's public certificates, no service-account key required.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'mind-modeler-3d',
  });
  console.log('✅  Firebase Admin SDK initialized (projectId: mind-modeler-3d)');
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

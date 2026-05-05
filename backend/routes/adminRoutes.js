const express = require('express');
const router = express.Router();
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');

// All admin routes are protected by adminAuth middleware
// Frontend must send: Authorization: Bearer <firebase-id-token>

// ─── GET /api/admin/pending-doctors ───────────────────────────
// Returns all doctors awaiting approval
router.get('/pending-doctors', adminAuth, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'Doctor', isApproved: false })
      .select('firebaseUid name email pmdcNumber createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, doctors });
  } catch (err) {
    console.error('Pending doctors error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/admin/approve/:firebaseUid ──────────────────────
// Approves a doctor account
router.put('/approve/:firebaseUid', adminAuth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.params.firebaseUid, role: 'Doctor' },
      { isApproved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or already approved.',
      });
    }

    res.json({
      success: true,
      message: `Dr. ${user.name}'s account has been approved.`,
      user,
    });
  } catch (err) {
    console.error('Approve doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

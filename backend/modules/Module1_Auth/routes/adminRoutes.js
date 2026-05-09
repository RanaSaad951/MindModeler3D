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
    const doctors = await User.find({ role: 'Doctor', isApprovedByAdmin: false })
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
      { isApprovedByAdmin: true },
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

// ─── PUT /api/admin/reject/:firebaseUid ───────────────────────
// Rejects (deletes) a doctor account
router.put('/reject/:firebaseUid', adminAuth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      firebaseUid: req.params.firebaseUid,
      role: 'Doctor',
      isApprovedByAdmin: false,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or already processed.',
      });
    }

    res.json({
      success: true,
      message: `Dr. ${user.name}'s application has been rejected.`,
    });
  } catch (err) {
    console.error('Reject doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/admin/stats ─────────────────────────────────────
// Returns dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalDoctors, pendingDoctors, approvedDoctors, totalPatients] =
      await Promise.all([
        User.countDocuments({ role: 'Doctor' }),
        User.countDocuments({ role: 'Doctor', isApprovedByAdmin: false }),
        User.countDocuments({ role: 'Doctor', isApprovedByAdmin: true }),
        User.countDocuments({ role: 'Patient' }),
      ]);

    res.json({
      success: true,
      stats: { totalDoctors, pendingDoctors, approvedDoctors, totalPatients },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────
// Returns all approved users (Patients and Approved Doctors)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { role: 'Patient' },
        { role: 'Doctor', isApprovedByAdmin: true }
      ]
    }).select('firebaseUid name email role isApprovedByAdmin createdAt').sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    console.error('Fetch all users error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/admin/users/:firebaseUid ─────────────────────
// Deletes any user
router.delete('/users/:firebaseUid', adminAuth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: `${user.name} has been deleted.` });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

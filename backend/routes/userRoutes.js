const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ─── POST /api/users/register ─────────────────────────────────
// Called by frontend AFTER Firebase signup succeeds
router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, name, email, role, pmdcNumber } = req.body;

    // Basic field presence check
    if (!firebaseUid || !name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firebaseUid, name, email, role.',
      });
    }

    // Idempotency guard — don't duplicate on double-submit
    const existing = await User.findOne({ firebaseUid });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A profile for this account already exists.',
      });
    }

    const newUser = new User({
      firebaseUid,
      name,
      email,
      role,
      pmdcNumber: role === 'Doctor' ? pmdcNumber : null,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: `${role} profile created successfully.`,
      user: newUser,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── GET /api/users/:firebaseUid ──────────────────────────────
// Fetches MongoDB profile to check role + approval status
router.get('/:firebaseUid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;

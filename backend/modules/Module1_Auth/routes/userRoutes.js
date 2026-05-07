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

    // ── PMDC uniqueness check for Doctors ─────────────────
    if (role === 'Doctor' && pmdcNumber) {
      const pmdcExists = await User.findOne({ pmdcNumber: pmdcNumber.trim() });
      if (pmdcExists) {
        return res.status(400).json({
          success: false,
          message: 'This PMDC number is already registered.',
        });
      }
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

// ─── PUT /api/users/complete-patient-profile ──────────────────
// Completes a Patient's profile with CNIC, age, gender, etc.
// Generates a unique sequential Patient ID (e.g. MM-P-0001)
router.put('/complete-patient-profile', async (req, res) => {
  try {
    const { firebaseUid, cnic, age, gender, contactNumber, city, profilePicURL } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'Firebase UID is required.' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    if (user.role !== 'Patient') {
      return res.status(400).json({ success: false, message: 'Only Patient accounts can complete this profile.' });
    }
    if (user.isProfileComplete) {
      return res.status(409).json({ success: false, message: 'Profile has already been completed.' });
    }

    // Validate required fields
    if (!cnic || !age || !gender || !contactNumber || !city) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: cnic, age, gender, contactNumber, city.',
      });
    }

    // Generate unique sequential Patient ID (MM-P-0001, MM-P-0002…)
    const patientCount = await User.countDocuments({
      role: 'Patient',
      uniquePatientId: { $exists: true, $ne: null },
    });
    const uniquePatientId = `MM-P-${String(patientCount + 1).padStart(4, '0')}`;

    // Update profile
    user.cnic = cnic;
    user.age = age;
    user.gender = gender;
    user.contactNumber = contactNumber;
    user.city = city;
    user.profilePicURL = profilePicURL || '';
    user.uniquePatientId = uniquePatientId;
    user.isProfileComplete = true;

    await user.save();

    return res.json({
      success: true,
      message: 'Patient profile completed successfully.',
      user,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }
    console.error('Complete patient profile error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── PUT /api/users/update-patient-profile ────────────────────
// Allows patients to modify ONLY: profilePicURL, age, contactNumber, city
// CNIC and name are permanently locked after initial registration.
router.put('/update-patient-profile', async (req, res) => {
  try {
    const { firebaseUid, profilePicURL, age, contactNumber, city, cnic, name } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'Firebase UID is required.' });
    }

    // ── Strict field lock — reject attempts to modify locked fields ──
    if (cnic !== undefined || name !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'CNIC and Name cannot be modified after registration.',
      });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    if (user.role !== 'Patient') {
      return res.status(400).json({ success: false, message: 'Only Patient accounts can use this endpoint.' });
    }
    if (!user.isProfileComplete) {
      return res.status(400).json({ success: false, message: 'Please complete your profile first.' });
    }

    // Validate age if provided
    if (age !== undefined) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
        return res.status(400).json({ success: false, message: 'Age must be a number between 1 and 150.' });
      }
      user.age = ageNum;
    }
    if (contactNumber !== undefined) user.contactNumber = contactNumber.trim();
    if (city !== undefined)          user.city = city.trim();
    if (profilePicURL !== undefined) user.profilePicURL = profilePicURL;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }
    console.error('Update patient profile error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── PUT /api/users/complete-doctor-profile ───────────────────
// Completes a Doctor's profile: specialization, medicalLicense, contact, city
// Generates uniqueDoctorId (MM-D-0001) and sets isProfileComplete = true
router.put('/complete-doctor-profile', async (req, res) => {
  try {
    const { firebaseUid, specialization, contactNumber, city, medicalLicenseUrl, profilePicURL } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'Firebase UID is required.' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ success: false, message: 'User profile not found.' });
    if (user.role !== 'Doctor') {
      return res.status(400).json({ success: false, message: 'Only Doctor accounts can use this endpoint.' });
    }
    if (user.isProfileComplete) {
      return res.status(409).json({ success: false, message: 'Profile has already been completed.' });
    }
    if (!specialization || !contactNumber || !city) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: specialization, contactNumber, city.',
      });
    }

    // Generate unique sequential Doctor ID (MM-D-0001, MM-D-0002…)
    const doctorCount = await User.countDocuments({
      role: 'Doctor',
      uniqueDoctorId: { $exists: true, $ne: null },
    });
    const uniqueDoctorId = `MM-D-${String(doctorCount + 1).padStart(4, '0')}`;

    user.specialization    = specialization;
    user.contactNumber     = contactNumber.trim();
    user.city              = city.trim();
    user.medicalLicenseUrl = medicalLicenseUrl || '';
    user.profilePicURL     = profilePicURL     || '';
    user.uniqueDoctorId    = uniqueDoctorId;
    user.isProfileComplete = true;

    await user.save();

    return res.json({ success: true, message: 'Doctor profile completed successfully.', user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }
    console.error('Complete doctor profile error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─── PUT /api/users/update-doctor-profile ─────────────────────
// Allows doctors to modify ONLY: profilePicURL, contactNumber, city
// Name, PMDC number, and Specialization are permanently locked.
router.put('/update-doctor-profile', async (req, res) => {
  try {
    const { firebaseUid, profilePicURL, contactNumber, city, name, pmdcNumber, specialization } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ success: false, message: 'Firebase UID is required.' });
    }
    if (name !== undefined || pmdcNumber !== undefined || specialization !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, PMDC Number, and Specialization cannot be modified after registration.',
      });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ success: false, message: 'User profile not found.' });
    if (user.role !== 'Doctor') {
      return res.status(400).json({ success: false, message: 'Only Doctor accounts can use this endpoint.' });
    }
    if (!user.isProfileComplete) {
      return res.status(400).json({ success: false, message: 'Please complete your profile first.' });
    }

    if (profilePicURL !== undefined) user.profilePicURL = profilePicURL;
    if (contactNumber !== undefined) user.contactNumber = contactNumber.trim();
    if (city !== undefined)          user.city = city.trim();

    await user.save();
    return res.json({ success: true, message: 'Doctor profile updated successfully.', user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' | ') });
    }
    console.error('Update doctor profile error:', err);
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

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: { values: ['Doctor', 'Patient'], message: 'Role must be Doctor or Patient' },
      required: [true, 'Role is required'],
    },
    pmdcNumber: {
      type: String,
      trim: true,
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ─── Business Logic Validators ────────────────────────────────
userSchema.pre('validate', function (next) {
  // Doctors must supply PMDC number
  if (this.role === 'Doctor' && (!this.pmdcNumber || this.pmdcNumber.trim() === '')) {
    this.invalidate('pmdcNumber', 'PMDC Registration Number is required for Doctors');
  }
  // Patients are auto-approved; PMDC is irrelevant
  if (this.role === 'Patient') {
    this.isApproved = true;
    this.pmdcNumber = null;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

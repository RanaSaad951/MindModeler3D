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

    // ─── Shared Profile Fields ─────────────────────────────────
    profilePicURL: {
      type: String,
      default: '',
    },
    profilePic: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },

    // ─── Doctor-Specific Fields ────────────────────────────────
    pmdcNumber: {
      type: String,
      trim: true,
      default: null,
    },
    specialization: {
      type: String,
      enum: {
        values: ['Neurologist', 'Radiologist', 'Oncologist', 'Other', ''],
        message: 'Specialization must be one of: Neurologist, Radiologist, Oncologist, Other',
      },
      default: '',
    },
    medicalLicenseUrl: {
      type: String,
      default: '',
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: false,
    },
    uniqueDoctorId: {
      type: String,
      unique: true,
      sparse: true,     // allows null/undefined without violating unique constraint
      default: undefined,
    },

    // ─── Patient-Specific Fields ───────────────────────────────
    cnic: {
      type: String,
      trim: true,
      default: '',
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      enum: { values: ['Male', 'Female', 'Transgender', ''], message: 'Gender must be Male, Female, or Transgender' },
      default: '',
    },
    uniquePatientId: {
      type: String,
      unique: true,
      sparse: true,     // allows null/undefined without violating unique constraint
      default: undefined,
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
    this.isApprovedByAdmin = true;
    this.pmdcNumber = null;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

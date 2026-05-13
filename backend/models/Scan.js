const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  files: [{
    fileName: String,      // unique name on server
    originalName: String,  // name from user
    modality: String,      // T1, T2, etc.
    path: String,          // full path
    encryptionIV: { type: String, required: true },
    fileType: {            // DICOM or NIfTI
      type: String,
      enum: ['DICOM', 'NIfTI']
    }
  }],
  status: {
    type: String,
    default: 'Uploaded',
  },
  patientId: String,
  patientName: String,
  studyDate: String,
  bodyPart: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Scan', scanSchema);

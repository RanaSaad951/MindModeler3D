const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['DICOM', 'NIfTI'],
    required: true,
  },
  status: {
    type: String,
    default: 'Uploaded',
  },
  patientId: String,
  patientName: String,
  studyDate: String,
  modality: String,
  bodyPart: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Scan', scanSchema);

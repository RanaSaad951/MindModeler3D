const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dicomParser = require('dicom-parser');
const Scan = require('../../../models/Scan');
const User = require('../../Module1_Auth/models/User');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Retain original extension
    const ext = file.originalname.endsWith('.nii.gz') 
      ? '.nii.gz' 
      : path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('scanFile'), async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    if (!firebaseUid) {
      // Clean up the file if no doctor info
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Doctor ID (firebaseUid) is required.' });
    }

    const doctor = await User.findOne({ firebaseUid });
    if (!doctor) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    let fileType = 'NIfTI';
    let metadata = {
      patientId: null,
      patientName: null,
      studyDate: null,
      modality: null,
      bodyPart: null
    };

    if (req.file.originalname.toLowerCase().endsWith('.dcm')) {
      fileType = 'DICOM';
      try {
        const buffer = fs.readFileSync(req.file.path);
        const dataSet = dicomParser.parseDicom(buffer);

        // Smart Guard: Body Part Validation
        const bodyPart = dataSet.string('x00180015');
        if (bodyPart) {
          const bpUpper = bodyPart.toUpperCase().trim();
          if (bpUpper !== 'BRAIN' && bpUpper !== 'HEAD') {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
              success: false, 
              message: `Upload Rejected: Mind Modeler 3D only accepts Brain MRIs. Detected: ${bodyPart}` 
            });
          }
        }

        // Metadata Extraction
        metadata.patientId = dataSet.string('x00100020');
        metadata.patientName = dataSet.string('x00100010');
        metadata.studyDate = dataSet.string('x00080020');
        metadata.modality = dataSet.string('x00080060');
        metadata.bodyPart = bodyPart;

      } catch (err) {
        console.error('DICOM parsing error:', err);
        // If it's a DICOM but parsing fails, we could potentially reject it,
        // but following instructions to assume valid if tag missing or just bypass for NIfTI.
        // For DICOM parsing failure, we'll log it and continue with empty metadata.
      }
    }

    const newScan = new Scan({
      doctorId: doctor._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: fileType,
      status: 'Uploaded',
      ...metadata
    });

    await newScan.save();

    res.status(201).json({
      success: true,
      message: 'File saved to server and database!',
      scan: newScan
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) {
       fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Server error during upload.' });
  }
});

router.get('/doctor/:firebaseUid', async (req, res) => {
  try {
    const doctor = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    
    const scans = await Scan.find({ doctorId: doctor._id }).sort({ uploadDate: -1 });
    res.json({ success: true, scans });
  } catch (error) {
    console.error('Fetch scans error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching scans.' });
  }
});

module.exports = router;

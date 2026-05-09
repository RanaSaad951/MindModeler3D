const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
    if (req.file.originalname.toLowerCase().endsWith('.dcm')) {
      fileType = 'DICOM';
    }

    const newScan = new Scan({
      doctorId: doctor._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: fileType,
      status: 'Uploaded',
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

module.exports = router;

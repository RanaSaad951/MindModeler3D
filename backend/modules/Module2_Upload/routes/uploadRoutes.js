const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dicomParser = require('dicom-parser');
const Scan = require('../../../models/Scan');
const User = require('../../Module1_Auth/models/User');
const { encryptFile, decryptFileToBuffer } = require('../../../utils/cryptoUtil');

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

router.post('/upload', upload.array('scans', 10), async (req, res) => {
  try {
    const { firebaseUid } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded.' });
    }

    if (!firebaseUid) {
      // Clean up files if no doctor info
      req.files.forEach(f => fs.unlinkSync(f.path));
      return res.status(400).json({ success: false, message: 'Doctor ID (firebaseUid) is required.' });
    }

    const doctor = await User.findOne({ firebaseUid });
    if (!doctor) {
      req.files.forEach(f => fs.unlinkSync(f.path));
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    let processedFiles = [];
    let rootMetadata = {
      patientId: null,
      patientName: null,
      studyDate: null,
      bodyPart: null
    };

    for (const file of req.files) {
      const originalNameLower = file.originalname.toLowerCase();
      let fileType = originalNameLower.endsWith('.dcm') ? 'DICOM' : 'NIfTI';
      let modality = 'Unknown';

      if (fileType === 'DICOM') {
        try {
          const buffer = fs.readFileSync(file.path);
          const dataSet = dicomParser.parseDicom(buffer);

          // Body Part Validation (Smart Guard)
          const bodyPart = dataSet.string('x00180015');
          if (bodyPart) {
            const bpUpper = bodyPart.toUpperCase().trim();
            if (bpUpper !== 'BRAIN' && bpUpper !== 'HEAD') {
              // If any file in batch is not brain, we reject the whole batch for safety or just this file?
              // Standard instruction says "immediately delete the saved file and return 400".
              // For batch, if one is wrong, we should probably reject the whole batch to be safe.
              req.files.forEach(f => { if(fs.existsSync(f.path)) fs.unlinkSync(f.path); });
              return res.status(400).json({ 
                success: false, 
                message: `Upload Rejected: Mind Modeler 3D only accepts Brain MRIs. Detected: ${bodyPart} in file ${file.originalname}` 
              });
            }
          }

          // Extract metadata for root (take from first valid DICOM)
          if (!rootMetadata.patientName) {
            rootMetadata.patientId = dataSet.string('x00100020');
            rootMetadata.patientName = dataSet.string('x00100010');
            rootMetadata.studyDate = dataSet.string('x00080020');
            rootMetadata.bodyPart = bodyPart;
          }

          // Detect Modality for this file
          // SeriesDescription (0008,103e) or Modality (0008,0060)
          modality = dataSet.string('x0008103e') || dataSet.string('x00080060') || 'DICOM Scan';

        } catch (err) {
          console.error(`Error parsing DICOM ${file.originalname}:`, err);
        }
      } else {
        // NIfTI Modality Detection from filename
        if (originalNameLower.includes('t1ce')) modality = 'T1ce';
        else if (originalNameLower.includes('t1')) modality = 'T1';
        else if (originalNameLower.includes('t2')) modality = 'T2';
        else if (originalNameLower.includes('flair')) modality = 'FLAIR';
        else if (originalNameLower.includes('seg')) modality = 'Segmentation Mask';
        else modality = 'Unknown NIfTI';
      }

      // Apply AES-256 Encryption
      let encryptionIV;
      try {
        encryptionIV = encryptFile(file.path);
      } catch (err) {
        console.error(`Encryption error for ${file.originalname}:`, err);
        // Clean up and fail if encryption fails (Security Compliance)
        req.files.forEach(f => { if(fs.existsSync(f.path)) fs.unlinkSync(f.path); });
        return res.status(500).json({ success: false, message: 'Security layer failure: Encryption failed.' });
      }

      processedFiles.push({
        fileName: file.filename,
        originalName: file.originalname,
        modality: modality,
        path: file.path,
        fileType: fileType,
        encryptionIV: encryptionIV
      });
    }

    const newScan = new Scan({
      doctorId: doctor._id,
      files: processedFiles,
      status: 'Uploaded',
      ...rootMetadata
    });

    await newScan.save();

    res.status(201).json({
      success: true,
      message: 'Batch uploaded and grouped successfully!',
      scan: newScan
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    if (req.files) {
      req.files.forEach(f => { if(fs.existsSync(f.path)) fs.unlinkSync(f.path); });
    }
    res.status(500).json({ success: false, message: 'Server error during batch upload.' });
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

// GET /api/scans/preview/:batchId - Decrypts and streams a NIfTI file for preview
router.get('/preview/:batchId', async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.batchId);
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan batch not found.' });
    }

    // Prioritize T1 or T1ce for preview, skip Segmentation Masks
    let targetFile = scan.files.find(f => 
      f.fileType === 'NIfTI' && 
      (f.modality === 'T1' || f.modality === 'T1ce')
    );

    // If no T1 found, pick the first NIfTI that isn't a Segmentation Mask
    if (!targetFile) {
      targetFile = scan.files.find(f => 
        f.fileType === 'NIfTI' && 
        f.modality !== 'Segmentation Mask'
      );
    }

    if (!targetFile) {
      return res.status(404).json({ success: false, message: 'No suitable NIfTI preview file found in this batch.' });
    }

    // Decrypt in-memory and stream
    const decryptedBuffer = decryptFileToBuffer(targetFile.path, targetFile.encryptionIV);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="preview_${targetFile.modality}.nii.gz"`);
    res.send(decryptedBuffer);

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ success: false, message: 'Error generating preview stream.' });
  }
});

module.exports = router;

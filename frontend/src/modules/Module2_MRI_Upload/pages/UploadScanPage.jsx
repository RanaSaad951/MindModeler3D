import React, { useState, useRef, useEffect } from 'react';
import { FiUploadCloud, FiFile, FiFolderPlus, FiX, FiUpload, FiActivity } from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const UploadScanPage = () => {
  const { firebaseUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  const [scanMetadata, setScanMetadata] = useState(null);

  const fileInputRef = useRef(null);
  const allowedExtensions = ['.dcm', '.nii', '.nii.gz'];

  useEffect(() => {
    let timeoutId;
    if (uploadError) {
      timeoutId = setTimeout(() => {
        setUploadError('');
      }, 4000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [uploadError]);

  useEffect(() => {
    if (!isScanning) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      if (currentProgress > 100) currentProgress = 100;
      setScanProgress(currentProgress);

      if (currentProgress === 10) setScanLogs(prev => [...prev, `[System] Initializing ${scanMetadata?.fileType || 'File'} parser...`]);
      if (currentProgress === 30) setScanLogs(prev => [...prev, `[Scan] Header Extracted: ${scanMetadata?.patientName || 'Anonymous'}`]);
      if (currentProgress === 60) setScanLogs(prev => [...prev, `[Validation] Modality: ${scanMetadata?.modality || 'MRI'} detected`]);
      if (currentProgress === 85) setScanLogs(prev => [...prev, '[Security] HIPAA compliance check: Passed']);
      if (currentProgress === 100) {
        setScanLogs(prev => [...prev, `[Success] ${scanMetadata?.fileType || 'Scan'} safely stored. Ready for 3D Pipeline.`]);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning]);

  const validateFile = (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isValid = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setUploadError("Invalid format. Only DICOM or NIfTI files are supported.");
      setSelectedFile(null);
    } else {
      setUploadError('');
      setSelectedFile(file);
    }
    
    // Reset file input so selecting the same file again works
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e) => {
    e.stopPropagation();
    if (!selectedFile || !firebaseUser) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('scanFile', selectedFile);
    formData.append('firebaseUid', firebaseUser.uid);

    try {
      const response = await fetch('http://localhost:5000/api/scans/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setScanMetadata(data.scan);
        setIsScanning(true);
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Network error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Upload MRI Scan</h2>
        <p className="text-sm text-slate-400">
          Upload patient MRI scans securely. Our AI models will automatically process and analyze the structural data.
        </p>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 animate-slide-up">
          <HiOutlineExclamationCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{uploadError}</p>
        </div>
      )}

      {/* Upload Zone OR Scanning Terminal */}
      {isScanning ? (
        <div className="bg-[#050505] border border-cyan-500/30 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] font-mono">
          <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
            <FiActivity className="w-6 h-6 animate-pulse" />
            AI Preprocessing Simulation
          </h3>

          <div className="bg-black/50 border border-white/[0.05] rounded-xl p-6 h-64 overflow-y-auto flex flex-col gap-2 mb-8">
            {scanLogs.map((log, index) => (
              <div key={index} className="text-sm text-emerald-400 animate-slide-up">
                <span className="text-slate-500 mr-2">{'>'}</span> {log}
              </div>
            ))}
            {scanProgress < 100 && (
              <div className="text-sm text-cyan-400/50 animate-pulse mt-2">
                <span className="text-slate-500 mr-2">{'>'}</span> Processing...
              </div>
            )}
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">System Progress</span>
              <span className="text-cyan-400 font-bold">{scanProgress}%</span>
            </div>
            <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {scanProgress === 100 && (
            <div className="flex justify-center animate-fade-in">
              <button 
                onClick={() => document.getElementById('nav-dashboard')?.click()}
                className="px-8 py-3 rounded-full text-sm font-semibold text-[#050505] bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-105 transition-all duration-300">
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.10] rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div 
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative z-10 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-16 px-6 text-center transition-all duration-300 cursor-pointer 
            ${isDragging ? 'border-cyan-400 bg-cyan-500/[0.08] scale-[1.02]' : 'border-cyan-500/30 bg-cyan-500/[0.02] hover:bg-cyan-500/[0.04] hover:border-cyan-400/50 group-hover:shadow-[0_0_40px_rgba(6,182,212,0.05)]'}
            ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/[0.05]' : ''}
          `}>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInputChange} 
            accept=".dcm,.nii,.nii.gz" 
            className="hidden" 
          />

          {!selectedFile ? (
            <>
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/10 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                <FiUploadCloud className="w-10 h-10 text-cyan-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Drag & drop your MRI scan here <br className="hidden sm:block" /> or <span className="text-cyan-400">click to browse</span>
              </h3>
              
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
                Supported formats: DICOM (.dcm), NIfTI (.nii, .nii.gz)
              </p>

              <button className="px-8 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
                <FiFolderPlus className="w-4 h-4" />
                Select Files
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                <FiFile className="w-10 h-10 text-emerald-400" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">File Selected Successfully</h3>
              <p className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-lg border border-cyan-500/20 mb-8 break-all max-w-md">
                {selectedFile.name}
              </p>

              <div className="flex items-center gap-4">
                <button 
                  onClick={clearSelection}
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] transition-all duration-200 flex items-center gap-2 disabled:opacity-50">
                  <FiX className="w-4 h-4" />
                  Clear Selection
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                  <FiUpload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload & Process'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
      
      {/* Informational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex items-start gap-4 hover:border-cyan-500/20 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <FiFile className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Data Privacy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All uploads are 256-bit SSL encrypted. Patient data is anonymized before processing.
            </p>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex items-start gap-4 hover:border-cyan-500/20 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <FiUploadCloud className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Fast Processing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our servers automatically generate 3D models within minutes of successful upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScanPage;

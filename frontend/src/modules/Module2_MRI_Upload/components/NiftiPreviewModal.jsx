import React, { useEffect, useRef, useState } from 'react';
import { Niivue } from '@niivue/niivue';
import { FiX, FiActivity, FiBox } from 'react-icons/fi';

const NiftiPreviewModal = ({ batchId, onClose }) => {
  const canvasRef = useRef(null);
  const nvRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initNiiVue = async () => {
      try {
        const nv = new Niivue({
          backColor: [0, 0, 0, 1],
          show3Dcrosshair: true,
          isSliceDark: true
        });
        nvRef.current = nv;
        nv.attachToCanvas(canvasRef.current);

        // Fetch and load the volume from our secure decryption API
        // We append ?file=preview.nii.gz to satisfy NiiVue's internal extension parser
        await nv.loadVolumes([{
          url: `http://localhost:5000/api/scans/preview/${batchId}?file=preview.nii.gz`,
          name: "preview.nii.gz"
        }]);

        setIsLoading(false);
      } catch (error) {
        console.error('NiiVue initialization error:', error);
        setIsLoading(false);
      }
    };

    if (batchId) {
      initNiiVue();
    }

    // Cleanup on unmount
    return () => {
      if (nvRef.current) {
        // nvRef.current.destroy(); // Optional: depend on niivue version
      }
    };
  }, [batchId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/[0.08] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center">
              <FiBox className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Quick 2D Preview</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Decrypted In-Memory Stream</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center p-2">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-4">
              <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <div className="flex flex-col items-center">
                <p className="text-sm font-mono text-cyan-400 animate-pulse flex items-center gap-2">
                  <FiActivity className="w-4 h-4" />
                  Decrypting & Rendering Scan...
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">SEC-2 compliant pipeline</p>
              </div>
            </div>
          )}
          
          <canvas 
            ref={canvasRef} 
            className="w-full h-full rounded-xl"
          />
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-white/[0.01] border-t border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SECURE STREAM ACTIVE
             </span>
             <span className="text-[10px] text-slate-500 font-mono">ID: {batchId.slice(-8).toUpperCase()}</span>
          </div>
          <p className="text-[10px] text-slate-600">Left-click: Rotate · Right-click: Pan · Scroll: Zoom</p>
        </div>
      </div>
    </div>
  );
};

export default NiftiPreviewModal;

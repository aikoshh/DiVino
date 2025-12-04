import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ScannerProps {
  onScan: (file: File, mode: 'bottle' | 'menu' | 'wall') => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onScan(e.target.files[0], 'bottle'); // Default to bottle if generic scan
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center p-4">
      <button 
        onClick={onCancel}
        className="absolute top-6 right-6 p-2 bg-stone-800 rounded-full text-white hover:bg-stone-700"
      >
        <X />
      </button>

      <div className="w-full max-w-md aspect-[3/4] border-2 border-amber-500/50 rounded-2xl relative overflow-hidden bg-stone-900/50 backdrop-blur">
        <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-stone-500 font-serif text-center px-8">
                Inquadra l'etichetta, il menu o la parete di vini.
            </p>
        </div>
        
        {/* Scanning Line Animation */}
        <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
      </div>

      <div className="mt-8 flex gap-6">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 px-8 py-4 bg-red-900 rounded-full text-white font-bold tracking-wide hover:bg-red-800 transition shadow-lg shadow-red-900/20"
        >
          <Camera className="w-5 h-5" />
          SCATTA / CARICA
        </button>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFile}
      />
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
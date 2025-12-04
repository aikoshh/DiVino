import React, { useState, useRef } from 'react';
import { Camera, Search, FileText, Image as ImageIcon } from 'lucide-react';

interface HeroProps {
  onScan: (file: File, mode: 'bottle' | 'menu' | 'wall') => void;
  onSearch: (text: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onScan, onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanMode, setScanMode] = useState<'bottle' | 'menu' | 'wall'>('bottle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onScan(e.target.files[0], scanMode);
    }
  };

  const triggerScan = (mode: 'bottle' | 'menu' | 'wall') => {
    setScanMode(mode);
    fileInputRef.current?.click();
  };

  // Custom Logo Component mimicking the user's image
  const DiVinoLogo = () => (
    <div className="relative w-32 h-32 md:w-40 md:h-40 group flex-shrink-0">
      {/* Halo */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-5 border-4 border-amber-400 rounded-[50%] shadow-[0_0_15px_rgba(251,191,36,0.6)] z-20"></div>
      
      {/* Phone Body Container */}
      <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-stone-800 relative shadow-2xl transform rotate-[-5deg] group-hover:rotate-0 transition-transform duration-500">
         {/* Background Quadrants */}
         <div className="absolute inset-0 flex flex-wrap">
            <div className="w-1/2 h-1/2 bg-[#ef4444]"></div> {/* Red */}
            <div className="w-1/2 h-1/2 bg-[#f59e0b]"></div> {/* Orange */}
            <div className="w-1/2 h-1/2 bg-[#0ea5e9]"></div> {/* Teal/Blue */}
            <div className="w-1/2 h-1/2 bg-[#10b981]"></div> {/* Green */}
         </div>
         
         {/* Inner Bezel/Notch hint */}
         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-3 bg-stone-900 rounded-b-lg z-10"></div>

         {/* Wine Glass Icon Overlay */}
         <div className="absolute inset-0 flex items-center justify-center z-10 pt-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-20 h-20 drop-shadow-lg" stroke="currentColor" strokeWidth="1.5">
               <path d="M8 22h8" stroke="#1c1917" strokeWidth="2" strokeLinecap="round"/>
               <path d="M12 15v7" stroke="#1c1917" strokeWidth="2" strokeLinecap="round"/>
               <path d="M6.5 10c0-3.5 1.5-6 5.5-6s5.5 2.5 5.5 6a5.5 5.5 0 0 1-5.5 5.5A5.5 5.5 0 0 1 6.5 10Z" fill="#fef3c7" stroke="#1c1917" strokeWidth="2"/>
               {/* Wine Liquid */}
               <path d="M6.5 10c0 2 1.5 4 4 5s4.5-2 4.5-4a2 2 0 0 0-2-2H8a2 2 0 0 0-1.5 1Z" fill="#b91c1c" fillOpacity="0.9" stroke="none" transform="translate(1.5, 0.5) scale(0.9)"/>
               {/* Sparkle */}
               <path d="M9 6l1 1-1 1-1-1z" fill="white" className="animate-pulse"/>
            </svg>
         </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 pt-12 pb-32">
        
        {/* Logos Section */}
        <div className="flex flex-row items-center justify-center gap-8 mb-8 md:mb-10 w-full">
          <DiVinoLogo />
          
          {/* Realistic Bottle Image */}
          <div className="relative w-32 h-48 md:w-40 md:h-60 flex-shrink-0 hidden sm:block">
              <img 
                  src="https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=800&auto=format&fit=crop" 
                  alt="Premium Wine Collection" 
                  className="w-full h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] opacity-90 hover:opacity-100 transition-opacity"
              />
              {/* Text overlay similar to user image */}
              <div className="absolute -top-4 -right-10 transform rotate-[-15deg]">
                  <span className="font-serif text-amber-500 text-2xl" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>Best <br/> Collection!</span>
              </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-10 relative z-10">
          <h1 className="font-serif text-6xl md:text-8xl text-stone-100 tracking-tight leading-none drop-shadow-xl">
            DiVino
          </h1>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-700 to-transparent w-full my-4"></div>
          <p className="font-serif text-amber-500 italic tracking-[0.2em] text-lg md:text-xl">
            In vino veritas!
          </p>
        </div>

        {/* Description */}
        <div className="max-w-xl text-center text-stone-400 text-sm md:text-base leading-relaxed mb-12 font-light">
          Identifica qualsiasi vino all'istante. Scansiona un <span className="text-stone-200 font-normal">menu</span>, una <span className="text-stone-200 font-normal">bottiglia</span> o un'intera <span className="text-stone-200 font-normal">parete</span> per ottenere valutazioni, prezzi e abbinamenti da vero sommelier.
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-md mb-12 relative group z-10">
          <input 
            type="text" 
            placeholder="Cerca un vino..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchText)}
            className="w-full bg-[#2a2725] border border-stone-700 text-stone-200 px-6 py-4 rounded-full focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-900 transition-all font-serif placeholder-stone-600 shadow-lg"
          />
          <button 
            onClick={() => onSearch(searchText)}
            className="absolute right-2 top-2 bg-stone-800 p-2 rounded-full hover:bg-amber-900 transition-colors"
          >
            <Search className="w-5 h-5 text-amber-500" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-lg z-10">
          <button 
            onClick={() => triggerScan('bottle')}
            className="flex flex-col items-center justify-center gap-3 p-6 border border-stone-700 rounded-xl hover:border-amber-700 hover:bg-[#2a2725] transition-all group"
          >
            <div className="p-3 bg-stone-800 rounded-full group-hover:bg-amber-900/50 transition-colors">
              <Camera className="w-6 h-6 text-stone-300 group-hover:text-amber-400" />
            </div>
            <span className="text-xs uppercase tracking-widest text-stone-400 text-center">Bottiglia</span>
          </button>

          <button 
            onClick={() => triggerScan('menu')}
            className="flex flex-col items-center justify-center gap-3 p-6 border border-stone-700 rounded-xl hover:border-amber-700 hover:bg-[#2a2725] transition-all group"
          >
            <div className="p-3 bg-stone-800 rounded-full group-hover:bg-amber-900/50 transition-colors">
              <FileText className="w-6 h-6 text-stone-300 group-hover:text-amber-400" />
            </div>
            <span className="text-xs uppercase tracking-widest text-stone-400 text-center">Menu</span>
          </button>

          <button 
            onClick={() => triggerScan('wall')}
            className="flex flex-col items-center justify-center gap-3 p-6 border border-stone-700 rounded-xl hover:border-amber-700 hover:bg-[#2a2725] transition-all group"
          >
            <div className="p-3 bg-stone-800 rounded-full group-hover:bg-amber-900/50 transition-colors">
              <ImageIcon className="w-6 h-6 text-stone-300 group-hover:text-amber-400" />
            </div>
            <span className="text-xs uppercase tracking-widest text-stone-400 text-center">Parete</span>
          </button>
        </div>

        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />

        {/* Decorative Footer Elements */}
        <div className="mt-16 w-full flex justify-between items-end opacity-50 z-0 pb-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border border-stone-500 rounded-full mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-800 rounded-full"></div>
              </div>
              <span className="text-[10px] uppercase tracking-widest">Spagna</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border border-stone-500 rounded-full mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-800 rounded-full"></div>
              </div>
              <span className="text-[10px] uppercase tracking-widest">Francia</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border border-stone-500 rounded-full mb-2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-800 rounded-full"></div>
              </div>
              <span className="text-[10px] uppercase tracking-widest">Italia</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
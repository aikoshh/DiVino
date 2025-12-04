import React from 'react';
import { ViewState } from '../types';
import { Home, Search, User } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  return (
    <div className="bg-[#151312] border-t border-stone-800 px-6 py-4 flex justify-around items-center z-30">
       <button 
         onClick={() => setView('HOME')}
         className={`flex flex-col items-center gap-1 ${currentView === 'HOME' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
       >
          <Home size={24} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-wider">Home</span>
       </button>
       
       <button 
          onClick={() => setView('CELLAR')}
          className={`flex flex-col items-center gap-1 ${currentView === 'CELLAR' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
       >
          <User size={24} strokeWidth={1.5} />
          <span className="text-[10px] uppercase tracking-wider">Cantina</span>
       </button>
    </div>
  );
};

export default Navbar;
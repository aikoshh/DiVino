import React from 'react';
import { Wine, WineType } from '../types';
import { ChevronRight, Star, Archive } from 'lucide-react';

interface CellarProps {
  cellar: Wine[];
  onSelect: (wine: Wine) => void;
}

const Cellar: React.FC<CellarProps> = ({ cellar, onSelect }) => {

  if (cellar.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#1c1917]">
        <div className="w-20 h-20 bg-stone-800 rounded-full flex items-center justify-center mb-6">
          <Archive size={32} className="text-stone-500" />
        </div>
        <h2 className="font-serif text-2xl text-stone-100 mb-2">La tua Cantina è vuota</h2>
        <p className="text-stone-500 max-w-xs">
          Scansiona vini o cerca bottiglie e aggiungile ai preferiti cliccando sul cuore.
        </p>
      </div>
    );
  }

  // Reverse array to show newest additions first
  const displayWines = [...cellar].reverse();

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full p-4 pt-8 bg-[#1c1917]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl text-stone-100">La mia Cantina</h2>
        <span className="text-amber-500 font-bold bg-amber-900/20 px-3 py-1 rounded-full border border-amber-900/50 text-xs">
            {cellar.length} {cellar.length === 1 ? 'Bottiglia' : 'Bottiglie'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar space-y-4">
        {displayWines.map((wine) => (
          <div 
            key={wine.id}
            onClick={() => onSelect(wine)}
            className="group relative bg-[#2a2725] border border-stone-800 rounded-xl p-4 flex gap-4 transition-all cursor-pointer shadow-lg hover:border-amber-900 hover:bg-[#322f2d]"
          >
            {/* Left side visual indicator */}
            <div className={`w-1.5 self-stretch rounded-full ${
              wine.type === WineType.RED ? 'bg-red-900' : 
              wine.type === WineType.WHITE ? 'bg-yellow-100' : 
              wine.type === WineType.ROSE ? 'bg-pink-400' : 'bg-amber-500'
            }`}></div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-xl text-stone-100 group-hover:text-amber-500 transition-colors">
                    {wine.name}
                  </h3>
                  <p className="text-stone-400 text-sm mt-1">{wine.winery} • {wine.region}</p>
                </div>
                <div className="flex flex-col items-end min-w-[60px]">
                  <div className="bg-stone-800 px-2 py-1 rounded-md border border-stone-700 flex items-center gap-1">
                    <span className="font-bold text-lg">{wine.averageRating.toFixed(1)}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                   <span className="text-xs border border-stone-700 px-2 py-0.5 rounded text-stone-400 uppercase tracking-wider">{wine.country}</span>
                   {wine.year && <span className="text-xs border border-stone-700 px-2 py-0.5 rounded text-stone-400">{wine.year}</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center pl-2">
              <ChevronRight className="text-stone-600 group-hover:text-stone-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cellar;
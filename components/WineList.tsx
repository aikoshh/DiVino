import React, { useState, useMemo } from 'react';
import { Wine, WineType } from '../types';
import { ChevronLeft, Star, ChevronRight, TrendingUp, List, Sparkles, Award, Home } from 'lucide-react';

interface WineListProps {
  wines: Wine[];
  cellar: Wine[]; // Pass cellar to check for duplicates
  onSelect: (wine: Wine) => void;
  onBack: () => void;
}

type SortMode = 'value' | 'rating' | 'original';

const WineList: React.FC<WineListProps> = ({ wines, cellar, onSelect, onBack }) => {
  const [sortMode, setSortMode] = useState<SortMode>('value');

  // Helper to extract a numeric price for sorting
  const getNumericPrice = (wine: Wine): number => {
    // 1. Priority: Price found on the menu
    if (wine.menuPrice) return wine.menuPrice;

    // 2. Fallback: Estimated market price (average of range)
    if (wine.priceEstimate) {
      const numbers = wine.priceEstimate.match(/\d+/g)?.map(Number);
      if (numbers && numbers.length > 0) {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
      }
    }
    
    // 3. No price data: Return Infinity to push to bottom
    return Infinity;
  };

  // Memoized sorted list
  const sortedWines = useMemo(() => {
    if (sortMode === 'original') return wines;

    return [...wines].sort((a, b) => {
      const priceA = getNumericPrice(a);
      const priceB = getNumericPrice(b);
      const ratingA = a.averageRating || 0;
      const ratingB = b.averageRating || 0;

      // Handle missing data logic based on sort mode
      if (sortMode === 'rating') {
        // Simple rating sort
        if (ratingA === 0 && ratingB === 0) return 0;
        if (ratingA === 0) return 1;
        if (ratingB === 0) return -1;
        return ratingB - ratingA; // Descending
      }

      // Value sort logic
      if (priceA === Infinity && priceB === Infinity) return 0;
      if (priceA === Infinity) return 1;
      if (priceB === Infinity) return -1;
      if (ratingA === 0) return 1; 
      if (ratingB === 0) return -1;

      // Calculate Value Score: Higher Rating / Lower Price = Better Value
      const scoreA = ratingA / priceA;
      const scoreB = ratingB / priceB;

      return scoreB - scoreA; // Descending order (Highest score first)
    });
  }, [wines, sortMode]);

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full p-4 pt-8 bg-[#1c1917]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-stone-800 rounded-full transition">
            <ChevronLeft className="text-stone-400" />
            </button>
            <h2 className="ml-2 font-serif text-3xl text-stone-100">Risultati</h2>
        </div>
        <span className="text-stone-500 text-sm">{wines.length} vini trovati</span>
      </div>

      {/* Sort Toggles - 3 Options */}
      <div className="flex bg-[#2a2725] p-1 rounded-xl mb-6 border border-stone-800 overflow-x-auto no-scrollbar">
        <button 
            onClick={() => setSortMode('value')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                sortMode === 'value' 
                ? 'bg-amber-700 text-white shadow-lg' 
                : 'text-stone-500 hover:text-stone-300'
            }`}
        >
            <TrendingUp size={14} />
            Miglior Valore
        </button>
        <button 
            onClick={() => setSortMode('rating')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                sortMode === 'rating' 
                ? 'bg-amber-700 text-white shadow-lg' 
                : 'text-stone-500 hover:text-stone-300'
            }`}
        >
            <Star size={14} />
            Miglior Punteggio
        </button>
        <button 
            onClick={() => setSortMode('original')}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                sortMode === 'original' 
                ? 'bg-stone-700 text-white shadow-lg' 
                : 'text-stone-500 hover:text-stone-300'
            }`}
        >
            <List size={14} />
            Originale
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar space-y-4">
        {sortedWines.map((wine, index) => {
            // Determine badge type based on sort mode
            const isTopItem = index === 0 && sortMode !== 'original';
            const badgeLabel = sortMode === 'value' ? 'MIGLIOR AFFARE' : 'MIGLIOR VOTO';
            const BadgeIcon = sortMode === 'value' ? Sparkles : Award;
            
            // Check if in cellar
            const isInCellar = cellar.some(w => 
                w.name.toLowerCase() === wine.name.toLowerCase() && 
                w.winery.toLowerCase() === wine.winery.toLowerCase()
            );
            
            // Ensure we don't badge if data is missing (e.g. top of list but price is infinity)
            const showBadge = isTopItem && (sortMode === 'rating' ? wine.averageRating > 0 : getNumericPrice(wine) !== Infinity);

            return (
                <div 
                    key={wine.id}
                    onClick={() => onSelect(wine)}
                    className={`group relative bg-[#2a2725] border rounded-xl p-4 flex gap-4 transition-all cursor-pointer shadow-lg
                        ${showBadge 
                            ? 'border-amber-500/50 bg-gradient-to-br from-[#2a2725] to-[#3a2e25]' 
                            : 'border-stone-800 hover:border-amber-900 hover:bg-[#322f2d]'
                        }
                    `}
                >
                    {/* Top Badge */}
                    {showBadge && (
                        <div className="absolute -top-3 -right-2 bg-amber-500 text-stone-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-amber-900/40 z-10">
                            <BadgeIcon size={10} fill="currentColor" />
                            {badgeLabel}
                        </div>
                    )}

                    {/* Left side visual indicator */}
                    <div className={`w-1.5 self-stretch rounded-full ${
                    wine.type === WineType.RED ? 'bg-red-900' : 
                    wine.type === WineType.WHITE ? 'bg-yellow-100' : 
                    wine.type === WineType.ROSE ? 'bg-pink-400' : 'bg-amber-500'
                    }`}></div>

                    <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`font-serif text-xl transition-colors ${showBadge ? 'text-amber-100' : 'text-stone-100 group-hover:text-amber-500'}`}>
                                    {wine.name}
                                </h3>
                                {isInCellar && (
                                    <div className="bg-green-900/40 p-1 rounded-full border border-green-800" title="Presente in Cantina">
                                        <Home size={10} className="text-green-400" />
                                    </div>
                                )}
                            </div>
                            <p className="text-stone-400 text-sm mt-1">{wine.winery} • {wine.region}</p>
                        </div>
                        {wine.averageRating && (
                        <div className="flex flex-col items-end min-w-[60px]">
                            <div className="bg-stone-800 px-2 py-1 rounded-md border border-stone-700 flex items-center gap-1">
                            <span className="font-bold text-lg">{wine.averageRating.toFixed(1)}</span>
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            </div>
                        </div>
                        )}
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                            <span className="text-xs border border-stone-700 px-2 py-0.5 rounded text-stone-400 uppercase tracking-wider">{wine.country}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            {wine.menuPrice ? (
                                <span className={`font-serif font-bold text-lg ${showBadge && sortMode === 'value' ? 'text-amber-400' : 'text-stone-200'}`}>
                                    €{wine.menuPrice}
                                </span>
                            ) : (
                                <span className="font-serif text-amber-700/80 text-sm">
                                    Stima: {wine.priceEstimate}
                                </span>
                            )}
                        </div>
                    </div>
                    </div>
                    
                    <div className="flex items-center pl-2">
                        <ChevronRight className="text-stone-600 group-hover:text-stone-300" />
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default WineList;
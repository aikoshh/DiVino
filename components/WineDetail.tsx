import React from 'react';
import { Wine, WineType } from '../types';
import { ChevronLeft, Star, Droplets, Utensils, Award, Wind, ShoppingCart, ExternalLink, TrendingUp, TrendingDown, Info, Heart, CheckCircle2 } from 'lucide-react';

interface WineDetailProps {
  wine: Wine;
  cellar: Wine[];
  onToggleCellar: (wine: Wine) => void;
  onBack: () => void;
}

const WineDetail: React.FC<WineDetailProps> = ({ wine, cellar, onToggleCellar, onBack }) => {
  
  // Check if wine is in cellar (matching by name and winery)
  const isInCellar = cellar.some(w => 
    w.name.toLowerCase() === wine.name.toLowerCase() && 
    w.winery.toLowerCase() === wine.winery.toLowerCase()
  );

  // Helper for Taste Profile Bars
  const TasteBar = ({ label, value, leftLabel, rightLabel }: { label: string, value: number, leftLabel: string, rightLabel: string }) => (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-stone-400 mb-1 uppercase tracking-wider">
        <span>{leftLabel}</span>
        <span className="font-bold text-stone-200">{label}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="h-2 bg-stone-800 rounded-full relative overflow-hidden">
        <div 
          className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-700 to-red-800 rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, left: '0' }}
        ></div>
        {/* Indicator Dot */}
        <div 
            className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-stone-200 border-2 border-stone-900 rounded-full shadow-lg"
            style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
        ></div>
      </div>
    </div>
  );

  const handleBuy = () => {
    const query = encodeURIComponent(`acquistare ${wine.name} ${wine.winery} ${wine.year || ''} miglior prezzo`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  // Price Calculation Logic
  const getAveragePrice = (priceStr: string): number => {
    const numbers = priceStr.match(/\d+/g)?.map(Number);
    if (!numbers || numbers.length === 0) return 0;
    // Calculate average if it's a range (e.g., "20-30")
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  };

  const marketPrice = getAveragePrice(wine.priceEstimate);
  const menuPrice = wine.menuPrice;
  
  let priceDiffPercent = 0;
  let isMarkup = true;

  if (menuPrice && marketPrice > 0) {
      const diff = menuPrice - marketPrice;
      priceDiffPercent = Math.round((diff / marketPrice) * 100);
      isMarkup = diff > 0;
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#1c1917] overflow-y-auto no-scrollbar">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-[#1c1917]/90 backdrop-blur-md p-4 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-stone-800 rounded-full transition">
            <ChevronLeft className="text-stone-300" />
            </button>
            <span className="ml-2 font-serif text-stone-400 italic">Dettagli Vino</span>
        </div>
        <button 
            onClick={() => onToggleCellar(wine)}
            className={`p-2 rounded-full transition-all ${
                isInCellar 
                ? 'bg-red-900/30 text-red-500 hover:bg-red-900/50' 
                : 'bg-stone-800 text-stone-400 hover:text-red-400 hover:bg-stone-700'
            }`}
        >
            <Heart className={`w-6 h-6 ${isInCellar ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
            {/* "Bottle" Visual - Simulated or Real */}
            <div className="w-full md:w-1/3 aspect-[3/4] bg-stone-900 rounded-t-[100px] rounded-b-2xl border border-stone-800 flex items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-x-8 top-1/4 bottom-8 bg-[#151312] border border-stone-700/50 flex flex-col items-center p-6 text-center shadow-inner">
                    <h2 className="font-serif text-2xl text-stone-100 leading-tight mb-2">{wine.name}</h2>
                    <div className="h-px w-12 bg-amber-600 my-4"></div>
                    <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{wine.winery}</p>
                    <p className="font-serif text-amber-700 text-lg">{wine.year || 'N.V.'}</p>
                </div>
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-white/5 pointer-events-none"></div>
                
                {/* In Cellar Overlay Badge on Bottle */}
                {isInCellar && (
                     <div className="absolute bottom-6 bg-green-900/90 backdrop-blur border border-green-700 text-green-100 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <CheckCircle2 size={12} />
                        Presente in Cantina
                     </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1">
                {/* Cellar Notification Banner */}
                {isInCellar && (
                    <div className="mb-6 bg-green-900/20 border border-green-800 rounded-lg p-3 flex items-center gap-3">
                        <CheckCircle2 className="text-green-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-green-200 text-sm font-bold">Hai questo vino!</p>
                            <p className="text-green-400/80 text-xs">È presente nella tua Cantina personale.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="font-serif text-4xl md:text-5xl text-stone-100 leading-none mb-2">{wine.name}</h1>
                        <p className="text-xl text-stone-400 font-light mb-4">{wine.region}, {wine.country}</p>
                        <div className="flex items-center gap-2 mb-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                wine.type === WineType.RED ? 'bg-red-900/40 text-red-200 border border-red-900' : 'bg-yellow-900/40 text-yellow-200 border border-yellow-900'
                            }`}>
                                {wine.type}
                            </span>
                            {wine.alcoholContent && <span className="text-sm text-stone-500">{wine.alcoholContent} ABV</span>}
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="text-3xl font-serif text-amber-500 font-bold mb-1">{wine.averageRating}<span className="text-lg text-stone-600">/5</span></div>
                         <div className="flex justify-end gap-0.5 mb-1">
                             {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={14} className={i < Math.round(wine.averageRating) ? "fill-amber-500 text-amber-500" : "fill-stone-800 text-stone-800"} />
                             ))}
                         </div>
                         <div className="text-xs text-stone-500 underline decoration-stone-700">{wine.reviewCount} Recensioni</div>
                    </div>
                </div>

                <div className="bg-[#262321] p-6 rounded-xl border border-stone-800 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={80} /></div>
                    <h3 className="font-serif text-lg text-amber-600 mb-2">Nota del Sommelier</h3>
                    <p className="text-stone-300 italic leading-relaxed">"{wine.description}"</p>
                </div>

                {/* Price & Value Analysis Section */}
                <div className="flex flex-col gap-4 mb-8 bg-[#2a2725] p-5 rounded-xl border border-stone-800">
                    
                    {/* If Menu Price is available, show Comparison */}
                    {menuPrice && marketPrice > 0 ? (
                        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-stone-700 pb-4 mb-2">
                             <div>
                                <span className="text-xs text-stone-400 uppercase tracking-widest block mb-1">Prezzo Menu</span>
                                <span className="text-4xl font-serif text-white">€{menuPrice}</span>
                            </div>
                            
                            <div className="flex flex-col justify-center">
                                <span className="text-xs text-stone-500 uppercase tracking-widest block mb-1">Prezzo Enoteca (Stimato)</span>
                                <span className="text-xl font-serif text-stone-400 line-through decoration-amber-700 decoration-2">€{marketPrice.toFixed(0)}</span>
                            </div>

                            <div className={`flex flex-col items-end justify-center px-4 rounded-lg ${isMarkup ? 'bg-stone-800' : 'bg-green-900/30 border border-green-800'}`}>
                                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">
                                    {isMarkup ? 'Ricarico' : 'Risparmio'}
                                </span>
                                <div className={`flex items-center text-xl font-bold ${isMarkup ? 'text-amber-500' : 'text-green-400'}`}>
                                    {isMarkup ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
                                    {Math.abs(priceDiffPercent)}%
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Standard Price view if no menu price
                         <div className="mb-2">
                             <span className="text-xs text-stone-500 uppercase tracking-widest block mb-1">Valore di Mercato Stimato</span>
                             <span className="text-3xl font-serif text-stone-100">{wine.priceEstimate}</span>
                        </div>
                    )}

                    <button 
                        onClick={handleBuy}
                        className="flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-amber-900/40 group w-full"
                    >
                        <ShoppingCart size={18} />
                        <span className="font-bold tracking-wide">Cerca Miglior Prezzo Online</span>
                        <ExternalLink size={14} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {menuPrice && (
                        <div className="flex items-start gap-2 mt-2">
                            <Info size={14} className="text-stone-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-stone-500 leading-tight">
                                La percentuale indica la differenza rispetto al prezzo medio di vendita al dettaglio. I ristoranti applicano normalmente ricarichi per il servizio.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Taste Profile */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
                <h3 className="font-serif text-2xl text-stone-200 mb-6 flex items-center gap-2">
                    <Droplets className="text-red-700" size={24}/> Profilo Gustativo
                </h3>
                {wine.tasteProfile && (
                    <div className="bg-[#262321] p-6 rounded-xl border border-stone-800">
                        <TasteBar label="Corpo" value={wine.tasteProfile.bold} leftLabel="Leggero" rightLabel="Corposo" />
                        <TasteBar label="Tannini" value={wine.tasteProfile.tannic} leftLabel="Morbido" rightLabel="Tannico" />
                        <TasteBar label="Dolcezza" value={wine.tasteProfile.sweet} leftLabel="Secco" rightLabel="Dolce" />
                        <TasteBar label="Acidità" value={wine.tasteProfile.acidic} leftLabel="Morbido" rightLabel="Acido" />
                    </div>
                )}
            </div>

            <div>
                 <h3 className="font-serif text-2xl text-stone-200 mb-6 flex items-center gap-2">
                    <Utensils className="text-amber-600" size={24}/> Abbinamenti
                </h3>
                <div className="bg-[#262321] p-6 rounded-xl border border-stone-800 h-full">
                    <ul className="space-y-4">
                        {wine.foodPairing.map((food, idx) => (
                            <li key={idx} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-amber-900 transition-colors">
                                    <span className="font-serif text-lg italic text-amber-500">{idx + 1}</span>
                                </div>
                                <span className="text-stone-300 text-lg">{food}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        
        {/* Grapes */}
        <div className="mb-12">
             <h3 className="font-serif text-2xl text-stone-200 mb-6 flex items-center gap-2">
                <Wind className="text-green-700" size={24}/> Uvaggio
            </h3>
            <div className="flex flex-wrap gap-3">
                {wine.grapes.map((grape, i) => (
                    <span key={i} className="px-6 py-2 rounded-full border border-stone-600 text-stone-300 hover:border-amber-600 hover:text-amber-500 transition-colors cursor-default">
                        {grape}
                    </span>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default WineDetail;
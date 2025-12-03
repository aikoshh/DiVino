import React, { useState, useEffect, useCallback } from 'react';
import { Wine, ViewState } from './types';
import { searchWines, getSimilarWines, askSommelier, generateWineImage } from './services/geminiService';
import { Search, Camera, Wine as WineIcon, Heart, ArrowLeft, Send, Sparkles, MessageCircle, ChevronRight, X, TrendingDown, TrendingUp, Image as ImageIcon, ScanLine, Star, Droplets, Grape, Award, Box, Flower, Sprout, ShoppingBag, Clock, RefreshCw } from 'lucide-react';

// --- Visual Components ---

const BrandLogo = ({ variant = 'dark' }: { variant?: 'light' | 'dark' }) => (
  <div className="flex flex-col items-center justify-center animate-fade-in-down">
    <div className="relative w-28 h-28 mb-4 transition-transform hover:scale-105 duration-300">
       <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
         {/* Halo Ring - Yellow with dark outline */}
         <ellipse cx="100" cy="35" rx="65" ry="12" fill="none" stroke="#F59E0B" strokeWidth="8" />
         <ellipse cx="100" cy="35" rx="65" ry="12" fill="none" stroke="#1E293B" strokeWidth="2" /> {/* Thin outline */}
         <ellipse cx="100" cy="35" rx="72" ry="16" fill="none" stroke="#1E293B" strokeWidth="4" />

         {/* Main Square Icon */}
         <rect x="30" y="65" width="140" height="140" rx="35" fill={variant === 'light' ? '#FFFFFF' : '#1E293B'} stroke="#1E293B" strokeWidth="6" />
         
         {/* Colored Quadrants */}
         <path d="M36 71 H98 V133 H36 V95 A 24 24 0 0 1 60 71 H36 Z" fill="#EF4444" /> 
         <rect x="36" y="71" width="62" height="62" rx="0" fill="#EF4444" clipPath="inset(0 0 0 0 round 24 0 0 0)" />
         <path d="M102 71 H164 A 24 24 0 0 1 164 95 V133 H102 Z" fill="#F59E0B" />
         <path d="M36 137 H98 V199 H60 A 24 24 0 0 1 36 175 Z" fill="#14B8A6" />
         <path d="M102 137 H164 V175 A 24 24 0 0 1 140 199 H102 Z" fill="#10B981" />

         {/* Wine Glass */}
         <g transform="translate(100, 135)">
            <path d="M0 55 L0 30" stroke="#FEF3C7" strokeWidth="8" strokeLinecap="round" />
            <path d="M-18 55 L18 55" stroke="#FEF3C7" strokeWidth="6" strokeLinecap="round" />
            <path d="M0 55 L0 30" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            <path d="M-18 55 L18 55" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

            {/* Glass Bowl */}
            <path d="M-28 -30 Q-28 35 0 35 Q28 35 28 -30 Z" fill="#FEF3C7" stroke="#1E293B" strokeWidth="3" />
            
            {/* Liquid */}
            <path d="M-24 -10 Q-24 30 0 30 Q24 30 24 -10 Z" fill="#DC2626" />
            
            {/* Sparkle */}
            <path d="M-14 -20 L-12 -26 L-10 -20 L-4 -18 L-10 -16 L-12 -10 L-14 -16 L-20 -18 Z" fill="white" />
         </g>
       </svg>
    </div>
    <div className="text-center">
        <h1 className={`text-5xl font-bold tracking-tight font-serif text-[#EF4444] mb-1`}>DiVino</h1>
        <p className={`text-lg font-serif text-[#1F2937] tracking-wide`}>In vino veritas!</p>
    </div>
  </div>
);

const Loading = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-6">
    <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-brand-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-brand-800 rounded-full border-t-transparent animate-spin"></div>
        <WineIcon className="absolute inset-0 m-auto text-brand-800 w-6 h-6 animate-pulse" />
    </div>
    <p className="text-slate-500 text-lg font-serif animate-pulse">{message}</p>
  </div>
);

const RatingBadge = ({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) => {
    let color = 'bg-brand-800';
    if(score >= 95) color = 'bg-brand-900';
    else if(score >= 90) color = 'bg-brand-700';
    else if(score >= 85) color = 'bg-emerald-600';
    else if(score >= 80) color = 'bg-emerald-500';
    else color = 'bg-yellow-500';

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl'
    };

    return (
        <div className={`${sizeClasses[size]} ${color} rounded-lg rounded-br-2xl shadow-md flex items-center justify-center text-white font-bold`}>
            {score}<span className="text-[0.6em] align-top opacity-80">%</span>
        </div>
    );
};

const TasteSlider = ({ labelLeft, labelRight, value }: { labelLeft: string, labelRight: string, value: number }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm mb-2 font-medium">
      <span className="text-gray-600">{labelLeft}</span>
      <span className="text-gray-900">{labelRight}</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden relative">
      <div 
        className="h-full bg-brand-700 rounded-full absolute top-0 left-0 transition-all duration-1000 ease-out" 
        style={{ width: `${Math.max(5, value)}%` }}
      ></div>
    </div>
  </div>
);

const FlavorRow = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex items-start gap-4 p-3 border-b border-gray-100 last:border-0">
     <div className="w-10 h-10 rounded-full bg-[#8D6E63] flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-1">
        <Icon className="w-5 h-5" />
     </div>
     <div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
     </div>
     <div className="ml-auto flex items-center justify-center">
        <ChevronRight className="w-4 h-4 text-gray-300" />
     </div>
  </div>
);

const HighlightsSection = ({ quality, style }: { quality: number, style: string }) => {
    // Determine dynamic values based on quality
    const percentage = Math.max(1, Math.min(50, 100 - quality));
    
    return (
        <div className="space-y-6 mb-8 border-b border-gray-100 pb-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-yellow-100">
                    <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                    <p className="text-gray-900 font-medium leading-tight">Tra i <span className="font-bold text-yellow-600">{percentage}% vini migliori</span> di tutto il mondo</p>
                    <p className="text-xs text-gray-400 mt-1">Basato sul punteggio di qualità globale</p>
                </div>
            </div>
            
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-100">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                     <p className="text-gray-900 font-medium leading-tight">Popolare tra gli utenti DiVino. Più di 5000 voti.</p>
                     <p className="text-xs text-gray-400 mt-1">Un best-seller nella sua categoria</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100">
                    <Grape className="w-6 h-6" />
                </div>
                 <div>
                     <p className="text-gray-900 font-medium leading-tight">Non hai ancora provato questo stile.</p>
                     <p className="text-xs text-gray-400 mt-1">Prova qualcosa di nuovo: <strong>{style}</strong></p>
                </div>
            </div>
        </div>
    );
};

const WineImage = ({ wine, onImageGenerated, className = "", mode = 'cover' }: { wine: Wine, onImageGenerated: (id: string, url: string) => void, className?: string, mode?: 'cover' | 'contain' }) => {
  const [loading, setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!wine.generatedImage && !loading) {
      setLoading(true);
      generateWineImage(wine).then(url => {
        if (mounted && url) {
          onImageGenerated(wine.id, url);
        }
        if (mounted) setLoading(false);
      });
    }
    return () => { mounted = false; };
  }, [wine.id, wine.generatedImage]);

  const handleImageLoad = () => setShowImage(true);

  if (wine.generatedImage) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img 
          src={wine.generatedImage} 
          alt={wine.name} 
          className={`w-full h-full ${mode === 'contain' ? 'object-contain p-6' : 'object-cover'} transition-all duration-700 ease-in-out ${showImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          onLoad={handleImageLoad}
          loading="lazy" 
          decoding="async"
        />
        {!showImage && (
           <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 flex items-center justify-center relative overflow-hidden ${className}`}>
      <WineIcon className={`w-1/3 h-1/3 text-gray-300 ${loading ? 'animate-pulse' : ''}`} />
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" style={{ backgroundSize: '200% 100%' }}></div>
      )}
    </div>
  );
};

// Helper to determine placeholder color based on wine style
const getAveragePrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  // Handle formats like "€ 10-12", "10 €", "€10,50"
  const normalized = priceStr.replace(',', '.');
  const numbers = normalized.match(/\d+(\.\d+)?/g);
  
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + parseFloat(curr), 0);
  return sum / numbers.length;
};

// --- Main App ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [query, setQuery] = useState('');
  const [wines, setWines] = useState<Wine[]>([]);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Wine[]>(() => {
    const saved = localStorage.getItem('divino_favorites_v2'); 
    return saved ? JSON.parse(saved) : [];
  });
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
      const saved = localStorage.getItem('divino_recents');
      return saved ? JSON.parse(saved) : [];
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('divino_favorites_v2', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('divino_recents', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const toggleFavorite = (wine: Wine, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const exists = prev.some(f => f.id === wine.id);
      if (exists) {
        return prev.filter(f => f.id !== wine.id);
      }
      return [...prev, wine];
    });
  };

  const isFavorite = (wineId: string) => favorites.some(f => f.id === wineId);

  const handleUpdateWineImage = useCallback((id: string, url: string) => {
    const updater = (prev: Wine[]) => prev.map(w => w.id === id ? { ...w, generatedImage: url } : w);
    setWines(updater);
    setFavorites(updater);
    setSelectedWine(prev => prev && prev.id === id ? { ...prev, generatedImage: url } : prev);
  }, []);

  const addToRecents = (term: string) => {
      if(!term) return;
      setRecentSearches(prev => {
          const filtered = prev.filter(t => t.toLowerCase() !== term.toLowerCase());
          return [term, ...filtered].slice(0, 5);
      });
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSelectedWine(null);
    setView('RESULTS');
    addToRecents(query);
    try {
      const results = await searchWines(query);
      setWines(results);
    } catch (err) {
      // In case of error (even after mock fallback), stay on results but empty
      setWines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowPhotoMenu(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      setLoading(true);
      setSelectedWine(null);
      setView('RESULTS');
      try {
        const results = await searchWines("", base64Data);
        setWines(results);
      } catch (err) {
        setWines([]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectWine = (wine: Wine) => {
    setSelectedWine(wine);
    setChatHistory([]);
    setChatOpen(false);
  };

  const handleSimilarWines = async () => {
    if (!selectedWine) return;
    const currentWine = selectedWine;
    setSelectedWine(null);
    setLoading(true);
    
    try {
      const similar = await getSimilarWines(currentWine);
      setWines(similar);
      setView('RESULTS');
    } catch (err) {
      // Fallback
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (!selectedWine) return;
    const url = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(selectedWine.name + ' prezzo')}`;
    window.open(url, '_blank');
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedWine) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await askSommelier(selectedWine, userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Errore di connessione." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- Views ---

  const renderHome = () => (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Logo Section */}
      <div className="mb-8 transform scale-105">
        <BrandLogo variant="dark" />
      </div>

      <p className="text-gray-500 font-serif text-lg mb-8 text-center animate-fade-in-down delay-100">Sommelier AI. Cerca, scansiona e scopri.</p>

      {/* Search Row */}
      <div className="w-full max-w-md flex gap-2 mb-8 items-center animate-fade-in-down delay-200">
         <div className="flex-1 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center px-4 py-3 focus-within:ring-2 focus-within:ring-brand-100 transition-shadow">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
                type="text"
                className="w-full bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                placeholder="prosecco"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
         </div>
         
         {/* Camera Button */}
         <div className="relative">
            <button 
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3.5 rounded-2xl transition-colors shadow-sm"
            >
                <Camera className="w-6 h-6" />
            </button>
             {/* Photo Menu */}
             {showPhotoMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowPhotoMenu(false)}></div>
                <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 animate-fade-in-down origin-top-right w-48">
                    <label className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
                        <div className="bg-brand-50 p-2 rounded-full text-brand-700">
                           <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-gray-900 font-bold text-sm">Fotocamera</span>
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <label className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="bg-brand-50 p-2 rounded-full text-brand-700">
                           <ImageIcon className="w-4 h-4" />
                        </div>
                         <span className="text-gray-900 font-bold text-sm">Galleria</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>
              </>
            )}
         </div>

         {/* Search Button */}
         <button 
            onClick={handleSearch}
            className="bg-[#B91C1C] hover:bg-[#991B1B] text-white px-6 py-3.5 rounded-2xl font-bold shadow-md transition-colors"
         >
            Cerca
         </button>
      </div>

      {/* Recents */}
      <div className="w-full max-w-md animate-fade-in-down delay-300">
         <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> Recenti
            </span>
            {recentSearches.length > 0 && (
                <button onClick={() => setRecentSearches([])} className="text-[10px] text-gray-400 hover:text-red-500 uppercase font-bold transition-colors">Cancella</button>
            )}
         </div>
         <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, idx) => (
                <button 
                    key={idx}
                    onClick={() => { setQuery(term); handleSearch(); }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-brand-50 hover:text-brand-800 hover:border-brand-200 transition-all shadow-sm"
                >
                    {term}
                </button>
            ))}
            {recentSearches.length === 0 && (
                <div className="flex flex-wrap gap-2 opacity-50">
                    <span className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-400">Barolo 2018</span>
                    <span className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm text-gray-400">Chianti Classico</span>
                </div>
            )}
         </div>
      </div>
      
      {/* Favorites Showcase on Home */}
       {favorites.length > 0 && (
           <div className="w-full max-w-md mt-8 animate-fade-in-down delay-300">
               <div className="flex justify-between items-center mb-3 px-1">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-gray-400" /> Preferiti
                 </span>
               </div>
               <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4">
                  {favorites.map((fav) => (
                      <div 
                        key={fav.id} 
                        onClick={() => handleSelectWine(fav)}
                        className="flex-shrink-0 w-32 bg-white rounded-xl shadow-sm border border-gray-100 p-2 cursor-pointer hover:shadow-md transition-all"
                      >
                         <div className="h-24 bg-gray-50 rounded-lg mb-2 overflow-hidden relative">
                             <WineImage wine={fav} onImageGenerated={handleUpdateWineImage} className="w-full h-full" />
                         </div>
                         <p className="text-xs font-bold text-gray-800 line-clamp-1">{fav.name}</p>
                         <p className="text-[10px] text-gray-500 line-clamp-1">{fav.producer}</p>
                         <div className="mt-1 flex items-center gap-1">
                             <div className="bg-brand-50 text-brand-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {fav.qualityRating}
                             </div>
                         </div>
                      </div>
                  ))}
               </div>
           </div>
       )}
    </div>
  );

  const renderResults = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <button onClick={() => setView('HOME')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-serif font-bold text-lg text-gray-800">
            {wines.length} Risultati
        </span>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-5 max-w-lg mx-auto mt-2">
        {loading ? (
          <Loading message="Analisi in corso..." />
        ) : wines.length === 0 ? (
          <div className="text-center text-gray-400 mt-20 flex flex-col items-center">
             <WineIcon className="w-12 h-12 mb-4 opacity-20" />
             <p>Nessun vino trovato.</p>
             <p className="text-xs mt-2 text-gray-300">Se il servizio è in sovraccarico, riprova più tardi.</p>
          </div>
        ) : (
          wines.map((wine) => {
            const marketPrice = getAveragePrice(wine.approxPriceEUR);
            const savings = wine.detectedPrice ? marketPrice - wine.detectedPrice : 0;
            const isCheaper = savings > 0;
            
            return (
              <div 
                key={wine.id} 
                onClick={() => handleSelectWine(wine)}
                className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex h-48 relative group"
              >
                {/* Left Image Section */}
                <div className="w-32 bg-gray-50 relative flex-shrink-0">
                   <WineImage wine={wine} onImageGenerated={handleUpdateWineImage} className="w-full h-full" />
                   {isFavorite(wine.id) && (
                       <div className="absolute top-2 left-2 text-brand-600">
                           <Heart className="fill-brand-600 w-5 h-5" />
                       </div>
                   )}
                </div>
                
                {/* Right Content Section */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                       <div className="pr-10">
                          <h3 className="font-serif font-bold text-lg leading-tight text-gray-900 line-clamp-2">{wine.name}</h3>
                          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mt-1">{wine.producer}</p>
                       </div>
                       <div className="absolute top-4 right-4">
                          <RatingBadge score={wine.qualityRating} size="md" />
                       </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                       <span className="w-4 h-4 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 text-[10px]">📍</span>
                       {wine.region}, {wine.country}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 flex items-end justify-between">
                     <div>
                        {wine.detectedPrice ? (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-brand-700 font-bold uppercase mb-0.5">PREZZO MENU</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-xl text-brand-800">€ {wine.detectedPrice.toFixed(2)}</span>
                                    <span className="text-xs text-gray-400 line-through decoration-gray-300">
                                        {marketPrice > 0 ? `€ ${marketPrice.toFixed(2)}` : wine.approxPriceEUR}
                                    </span>
                                </div>
                                {isCheaper && (
                                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-0.5 mt-0.5">
                                        <TrendingDown className="w-3 h-3" /> Risparmi €{savings.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Prezzo Medio</span>
                                <span className="font-semibold text-lg text-gray-700">{wine.approxPriceEUR}</span>
                            </div>
                        )}
                     </div>
                     <div className="flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-md h-fit">
                        Q/P: {wine.priceQualityScore}
                     </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedWine) return null;
    
    const isFav = isFavorite(selectedWine.id);
    const averageMarketPrice = getAveragePrice(selectedWine.approxPriceEUR);
    const savings = selectedWine.detectedPrice ? averageMarketPrice - selectedWine.detectedPrice : 0;
    const isCheaper = savings > 0;

    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-slide-up flex flex-col">
        {/* Full Image Header */}
        <div className="relative h-[45vh] w-full bg-gray-100">
             <WineImage wine={selectedWine} onImageGenerated={handleUpdateWineImage} className="w-full h-full" mode="contain" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
             
             {/* Nav Buttons */}
             <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 safe-area-top pt-6">
                 <button onClick={() => setSelectedWine(null)} className="bg-black/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/30 transition-colors">
                     <X className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={(e) => toggleFavorite(selectedWine, e)}
                   className={`p-2 rounded-full backdrop-blur-md transition-colors ${isFav ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/50' : 'bg-black/20 text-white hover:bg-black/30'}`}
                 >
                   <Heart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
                 </button>
             </div>

             {/* Title Overlay */}
             <div className="absolute bottom-8 left-6 right-6 text-white">
                 <div className="inline-block px-2 py-1 rounded border border-white/30 bg-black/20 backdrop-blur-sm text-xs font-medium mb-2 uppercase tracking-wide">
                     {selectedWine.style}
                 </div>
                 <h1 className="text-3xl font-serif font-bold leading-tight mb-1 text-shadow-sm">{selectedWine.name}</h1>
                 <p className="text-gray-200 font-medium">{selectedWine.producer} • {selectedWine.region}</p>
             </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-white relative z-10 -mt-6 rounded-t-[30px] p-6 space-y-8 pb-48">
            
            {/* Main Stats Row */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                 <div className="flex items-center gap-3">
                     <RatingBadge score={selectedWine.qualityRating} size="lg" />
                     <div>
                         <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Punteggio DiVino</div>
                         <div className="text-xs text-gray-400">Basato su analisi AI</div>
                     </div>
                 </div>
                 <div className="text-right flex flex-col items-end">
                     {selectedWine.detectedPrice ? (
                         <>
                             <div className="text-xs text-brand-700 font-bold uppercase mb-1">PREZZO MENU</div>
                             <div className="text-3xl font-bold text-gray-900">€{selectedWine.detectedPrice.toFixed(2)}</div>
                             <div className="flex flex-col items-end mt-1">
                                <div className="text-xs text-gray-400">vs Mercato: {averageMarketPrice > 0 ? `€${averageMarketPrice.toFixed(2)}` : selectedWine.approxPriceEUR}</div>
                                {isCheaper && (
                                    <div className="text-xs text-green-600 font-bold flex items-center gap-1">
                                        <TrendingDown className="w-3 h-3" /> Risparmi €{savings.toFixed(2)}
                                    </div>
                                )}
                             </div>
                         </>
                     ) : (
                         <>
                            <div className="text-2xl font-bold text-gray-800">{selectedWine.approxPriceEUR}</div>
                            <div className="text-xs text-gray-400 mt-1">Prezzo medio mercato</div>
                         </>
                     )}
                 </div>
            </div>

            {/* NEW: Highlights Section */}
            <HighlightsSection quality={selectedWine.qualityRating} style={selectedWine.style} />

            {/* Taste Profile Section */}
            <div>
                <div className="flex justify-between items-baseline mb-4">
                   <h3 className="font-bold text-gray-900 font-serif text-xl">Caratteristiche di gusto</h3>
                   <span className="text-xs text-brand-700 font-bold cursor-pointer flex items-center gap-1">
                      Modifica <ChevronRight className="w-3 h-3" />
                   </span>
                </div>
                <div className="text-xs text-gray-400 mb-6 -mt-2">Basato sull'analisi AI del sommelier</div>

                <div className="space-y-4 mb-10">
                    <TasteSlider 
                       labelLeft="Leggero" labelRight="Strutturato" 
                       value={selectedWine.tasteProfile?.structure || 50} 
                    />
                    <TasteSlider 
                       labelLeft="Morbido" labelRight="Tannico" 
                       value={selectedWine.tasteProfile?.tannins || 50} 
                    />
                    <TasteSlider 
                       labelLeft="Secco" labelRight="Dolce" 
                       value={selectedWine.tasteProfile?.sweetness || 10} 
                    />
                    <TasteSlider 
                       labelLeft="Piatto" labelRight="Acidulo" 
                       value={selectedWine.tasteProfile?.acidity || 60} 
                    />
                </div>
            </div>

            {/* Flavors Highlights (Argomenti in evidenza) */}
            <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Argomenti in evidenza</h3>
                 <div className="space-y-0">
                     {selectedWine.flavors?.wood && (
                         <FlavorRow 
                            icon={Box} 
                            title={selectedWine.flavors.wood} 
                            desc={`Note di affinamento caratteristiche di questo stile.`} 
                         />
                     )}
                     {selectedWine.flavors?.fruit && (
                         <FlavorRow 
                            icon={Grape} 
                            title={selectedWine.flavors.fruit} 
                            desc={`Sentori fruttati predominanti al naso.`} 
                         />
                     )}
                     {selectedWine.flavors?.earth && (
                         <FlavorRow 
                            icon={Sprout} 
                            title={selectedWine.flavors.earth} 
                            desc={`Note terrose, vegetali o minerali.`} 
                         />
                     )}
                     {!selectedWine.flavors?.wood && !selectedWine.flavors?.fruit && !selectedWine.flavors?.earth && (
                         <p className="text-sm text-gray-400 italic">Nessun aroma specifico evidenziato.</p>
                     )}
                 </div>
            </div>

            {/* Expert Opinion */}
            <div className="bg-gray-50 p-6 rounded-2xl">
                 <h3 className="font-bold text-gray-900 mb-3 font-serif text-xl flex items-center gap-2">
                     <Award className="w-5 h-5 text-brand-700" /> Il Sommelier Dice
                 </h3>
                 <p className="text-gray-700 leading-relaxed italic text-lg">
                    "{selectedWine.expertOpinion}"
                 </p>
                 <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                        <Grape className="w-4 h-4" /> Altre note
                    </h4>
                    <p className="text-sm text-gray-600">{selectedWine.tastingNotes}</p>
                 </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Uve</span>
                    <span className="font-medium text-gray-800">{selectedWine.grapes.join(', ')}</span>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl">
                    <span className="block text-gray-400 text-xs uppercase font-bold mb-1">Abbinamenti</span>
                    <span className="font-medium text-gray-800 text-sm">{selectedWine.foodPairing.slice(0, 2).join(', ')}</span>
                 </div>
            </div>

        </div>

        {/* Floating Action Bar - 3 BUTTONS ROW */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
             <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
                <button 
                    onClick={handleSimilarWines}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors text-[10px] sm:text-sm"
                >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Simili
                </button>
                <button 
                    onClick={handleBuy}
                    className="bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors shadow-lg text-[10px] sm:text-sm"
                >
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                    Acquista
                </button>
                <button 
                    onClick={() => setChatOpen(true)}
                    className="bg-brand-800 hover:bg-brand-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm"
                >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    Sommelier AI
                </button>
             </div>
        </div>

        {/* Chat Overlay */}
        {chatOpen && (
            <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in-down">
                <div className="bg-gray-50 w-full max-w-lg h-[85vh] sm:h-[600px] sm:rounded-2xl rounded-t-2xl flex flex-col shadow-2xl animate-slide-up overflow-hidden">
                    <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-800 rounded-full flex items-center justify-center text-white">
                                <WineIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 font-serif">Sommelier DiVino</h3>
                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                             <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-1">
                                 <WineIcon className="w-4 h-4 text-brand-700" />
                             </div>
                             <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700 border border-gray-100">
                                 Sto analizzando <strong>{selectedWine.name}</strong>. Come posso aiutarti?
                             </div>
                        </div>
                        {chatHistory.map((msg, idx) => (
                             <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-brand-100'}`}>
                                     {msg.role === 'user' ? <span className="text-xs font-bold text-gray-600">TU</span> : <WineIcon className="w-4 h-4 text-brand-700" />}
                                 </div>
                                 <div className={`p-3.5 rounded-2xl shadow-sm text-sm max-w-[80%] ${
                                     msg.role === 'user' 
                                     ? 'bg-brand-800 text-white rounded-tr-none' 
                                     : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                 }`}>
                                     {msg.text}
                                 </div>
                             </div>
                        ))}
                        {chatLoading && (
                             <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                                    <WineIcon className="w-4 h-4 text-brand-700" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm text-gray-400 italic flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                             </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200 safe-area-bottom">
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                placeholder="Scrivi una domanda..."
                                className="flex-1 bg-gray-100 rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-800 transition-all"
                            />
                            <button 
                                onClick={handleSendChat}
                                disabled={!chatInput.trim() || chatLoading}
                                className="bg-brand-800 hover:bg-brand-900 disabled:opacity-50 text-white p-3.5 rounded-full transition-colors shadow-lg"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen mx-auto max-w-lg shadow-2xl overflow-hidden relative">
      {view === 'HOME' && renderHome()}
      {view === 'RESULTS' && (
        <>
            {renderResults()}
            {selectedWine && renderDetailModal()}
        </>
      )}
    </div>
  );
};

export default App;
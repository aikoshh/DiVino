import React, { useState, useEffect } from 'react';
import { ViewState, Wine } from './types';
import Hero from './components/Hero';
import Scanner from './components/Scanner';
import WineList from './components/WineList';
import WineDetail from './components/WineDetail';
import Cellar from './components/Cellar';
import Navbar from './components/Navbar';
import { scanWineImage, searchWineByText } from './services/geminiService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [wines, setWines] = useState<Wine[]>([]);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [cellar, setCellar] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load Cellar from LocalStorage on mount
  useEffect(() => {
    const savedCellar = localStorage.getItem('divino_cellar');
    if (savedCellar) {
      try {
        setCellar(JSON.parse(savedCellar));
      } catch (e) {
        console.error("Error parsing cellar data", e);
      }
    }
  }, []);

  // Save Cellar to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('divino_cellar', JSON.stringify(cellar));
  }, [cellar]);

  // Cycling loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 2000); // Change text every 2 seconds
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Analisi dell'immagine in corso...",
    "Identificazione delle etichette e delle annate...",
    "Consultazione del database dei sommelier...",
    "Creazione delle note di degustazione..."
  ];

  const handleScan = async (file: File, mode: 'bottle' | 'menu' | 'wall') => {
    setLoading(true);
    setError(null);

    // Helper to read file as promise
    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    // Split to get only base64 data
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                } else {
                    reject(new Error("Errore nella lettura del file"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    try {
      const base64String = await readFileAsBase64(file);
      
      let context = "";
      if (mode === 'menu') context = "Questo è un menu di vini. Elenca tutti i vini trovati.";
      else if (mode === 'wall') context = "Questa è una parete di vini. Elenca le bottiglie più evidenti/leggibili (fino a 10).";
      else context = "Questa è una singola bottiglia di vino. Identificala con precisione.";

      const results = await scanWineImage(base64String, context);
      
      setWines(results);
      if (results.length === 1) {
          setSelectedWine(results[0]);
          setView('DETAIL');
      } else {
          setView('RESULTS');
      }
    } catch (err) {
      console.error(err);
      setError("Impossibile analizzare l'immagine. Assicurati che sia chiara e riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSearch = async (text: string) => {
      setLoading(true);
      setError(null);
      try {
          const results = await searchWineByText(text);
          setWines(results);
          if (results.length > 0) {
            if(results.length === 1) {
                setSelectedWine(results[0]);
                setView('DETAIL');
            } else {
                setView('RESULTS');
            }
          } else {
              setError("Nessun vino trovato con questo nome.");
          }
      } catch (err) {
          setError("Ricerca fallita.");
      } finally {
          setLoading(false);
      }
  }

  const handleSelectWine = (wine: Wine) => {
    setSelectedWine(wine);
    setView('DETAIL');
  };

  // Toggle wine in cellar logic
  const toggleCellar = (wine: Wine) => {
    const exists = cellar.some(w => 
      w.name.toLowerCase() === wine.name.toLowerCase() && 
      w.winery.toLowerCase() === wine.winery.toLowerCase()
    );

    if (exists) {
      setCellar(prev => prev.filter(w => 
        !(w.name.toLowerCase() === wine.name.toLowerCase() && w.winery.toLowerCase() === wine.winery.toLowerCase())
      ));
    } else {
      setCellar(prev => [...prev, wine]);
    }
  };

  const goBack = () => {
    if (view === 'DETAIL') {
      // If we came from results, go back to results. 
      // If we clicked a wine in Cellar, go back to Cellar.
      // If we have current search results, go to results, otherwise home or cellar.
      if (wines.length > 0) {
        setView('RESULTS');
      } else {
        // If viewing details from cellar, go back to cellar
        // We need to know previous state technically, but simple logic:
        // If wines is empty, we likely came from Cellar
        setView('CELLAR'); 
      }
    } else {
      setView('HOME');
      setWines([]);
    }
  };

  return (
    <div className="h-screen bg-[#1c1917] text-[#e7e5e4] flex flex-col relative overflow-hidden">
      {/* Texture Overlay for Premium Feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
      
      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
        {loading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1c1917]/95 backdrop-blur-md transition-all duration-500">
            {/* Visual centerpiece with Image */}
            <div className="relative mb-8 flex items-center justify-center">
               {/* Background Glow */}
               <div className="absolute w-40 h-40 bg-amber-600/20 rounded-full blur-3xl animate-pulse"></div>
               
               {/* Image */}
               <img 
                 src="https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=400&auto=format&fit=crop"
                 alt="Analyzing Wine"
                 className="h-48 object-contain drop-shadow-2xl animate-pulse"
                 style={{ animationDuration: '3s' }}
               />
               
               {/* Spinner Ring */}
               <div className="absolute inset-0 -m-4 border-4 border-transparent border-t-amber-600 rounded-full animate-spin"></div>
            </div>
            
            <div className="h-8 mb-2 w-full px-4">
                 <p className="font-serif text-xl tracking-widest text-stone-200 animate-pulse text-center w-full">
                    {loadingMessages[loadingStep]}
                </p>
            </div>
            <p className="text-xs text-stone-500 uppercase tracking-widest mt-4">Sommelier IA al lavoro</p>
          </div>
        )}

        {/* Error Modal */}
        {error && !loading && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-stone-900 border border-red-900/50 p-6 rounded-xl max-w-sm w-full text-center">
                    <div className="text-red-500 mb-4 flex justify-center"><Loader2 className="animate-spin" /></div> 
                    <h3 className="font-serif text-xl text-stone-100 mb-2">Attenzione</h3>
                    <p className="text-stone-400 mb-6">{error}</p>
                    <button 
                        onClick={() => setError(null)}
                        className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-6 py-2 rounded-full transition-colors"
                    >
                        Chiudi
                    </button>
                </div>
             </div>
        )}

        {view === 'HOME' && <Hero onScan={handleScan} onSearch={handleTextSearch} />}
        {view === 'SCANNER' && <Scanner onScan={handleScan} onCancel={() => setView('HOME')} />}
        {view === 'RESULTS' && <WineList wines={wines} cellar={cellar} onSelect={handleSelectWine} onBack={() => setView('HOME')} />}
        {view === 'CELLAR' && <Cellar cellar={cellar} onSelect={handleSelectWine} />}
        {view === 'DETAIL' && selectedWine && (
          <WineDetail 
            wine={selectedWine} 
            cellar={cellar}
            onToggleCellar={toggleCellar}
            onBack={goBack} 
          />
        )}
      </div>

      <Navbar currentView={view} setView={setView} />
    </div>
  );
};

export default App;
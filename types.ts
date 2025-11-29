export interface Wine {
  id: string;
  name: string;
  producer: string;
  country: string;
  region: string;
  style: string;
  grapes: string[];
  vintagesRecommended: string[];
  keyCharacteristics: string;
  tastingNotes: string;
  foodPairing: string[];
  expertOpinion: string;
  qualityRating: number;
  priceQualityScore: number;
  approxPriceEUR: string;
  bestBuyUrl: string;
  imageSearchQuery: string;
  labelTextRaw?: string;
  generatedImage?: string;
  detectedPrice?: number;
  tasteProfile?: {
    structure: number; // 0 (Leggero) - 100 (Strutturato)
    tannins: number;   // 0 (Morbido) - 100 (Tannico)
    sweetness: number; // 0 (Secco) - 100 (Dolce)
    acidity: number;   // 0 (Piatto) - 100 (Acidulo)
  };
  flavors?: {
    wood?: string; // e.g., "Legno, vaniglia"
    fruit?: string; // e.g., "Mora, ciliegia"
    earth?: string; // e.g., "Pelle, erbaceo"
  };
}

export interface WineResponse {
  wines: Wine[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewState = 'HOME' | 'RESULTS' | 'DETAIL' | 'CHAT';
export enum WineType {
  RED = 'Rosso',
  WHITE = 'Bianco',
  ROSE = 'Rosato',
  SPARKLING = 'Bollicine',
  DESSERT = 'Dessert',
  OTHER = 'Altro'
}

export interface TasteProfile {
  bold: number; // 0-100 (Light to Bold)
  tannic: number; // 0-100 (Smooth to Tannic)
  sweet: number; // 0-100 (Dry to Sweet)
  acidic: number; // 0-100 (Soft to Acidic)
}

export interface Wine {
  id: string;
  name: string;
  winery: string;
  region: string;
  country: string;
  year?: string;
  type: WineType;
  averageRating: number; // 0.0 to 5.0
  reviewCount: number;
  priceEstimate: string; // Market price estimate
  menuPrice?: number; // Specific price found on the menu
  description: string;
  grapes: string[];
  foodPairing: string[];
  alcoholContent?: string;
  tasteProfile?: TasteProfile;
  imageUrl?: string; // Optional URL for the specific bottle
}

export type ViewState = 'HOME' | 'SCANNER' | 'RESULTS' | 'DETAIL' | 'CELLAR';
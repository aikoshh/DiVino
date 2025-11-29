import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Wine, WineResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Sei "DiVino", un'intelligenza artificiale sommelier.
Il tuo compito è aiutare l'utente a cercare, confrontare e valutare vini.
Rispondi sempre con dati accurati, professionali e utili.
Il tono deve essere "In vino veritas!": esperto, appassionato, ma accessibile.

REGOLE FONDAMENTALI:
1. Se ricevi un'immagine di una bottiglia, analizza l'etichetta con precisione.
2. Se ricevi un'immagine di un menù, estrai i vini elencati E I LORO PREZZI (se visibili) nel campo 'detectedPrice'.
3. Se ricevi testo con offerte, estrai il prezzo specifico.
4. Ordina SEMPRE i risultati per 'priceQualityScore' (rapporto qualità/prezzo) decrescente.
5. Sii onesto sui prezzi di mercato (approxPriceEUR).
6. Compila SEMPRE il campo 'tasteProfile' stimando i valori da 0 a 100 per Struttura, Tannini, Dolcezza, Acidità.
7. Compila i campi 'flavors' estraendo le note principali (Legno/Spezie, Frutta, Terra/Vegetale).
`;

const WINE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    wines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID for the wine" },
          name: { type: Type.STRING, description: "Full name of the wine" },
          producer: { type: Type.STRING, description: "Producer name" },
          country: { type: Type.STRING },
          region: { type: Type.STRING },
          style: { type: Type.STRING, description: "e.g., Red Still, Champagne Brut" },
          grapes: { type: Type.ARRAY, items: { type: Type.STRING } },
          vintagesRecommended: { type: Type.ARRAY, items: { type: Type.STRING } },
          keyCharacteristics: { type: Type.STRING, description: "Brief description of key features" },
          tastingNotes: { type: Type.STRING, description: "Nose and palate notes" },
          foodPairing: { type: Type.ARRAY, items: { type: Type.STRING } },
          expertOpinion: { type: Type.STRING, description: "Sommelier opinion in Italian (2-3 sentences)" },
          qualityRating: { type: Type.NUMBER, description: "0-100 score for pure quality" },
          priceQualityScore: { type: Type.NUMBER, description: "0-100 score for value for money" },
          approxPriceEUR: { type: Type.STRING, description: "e.g. '18-24 €' (Market Average)" },
          detectedPrice: { type: Type.NUMBER, description: "Specific price found in the menu or input text, if available. Numeric only." },
          bestBuyUrl: { type: Type.STRING },
          imageSearchQuery: { type: Type.STRING, description: "Query to find image of bottle" },
          labelTextRaw: { type: Type.STRING, nullable: true },
          tasteProfile: {
            type: Type.OBJECT,
            properties: {
              structure: { type: Type.NUMBER, description: "0 (Leggero) to 100 (Strutturato)" },
              tannins: { type: Type.NUMBER, description: "0 (Morbido) to 100 (Tannico/Astringente)" },
              sweetness: { type: Type.NUMBER, description: "0 (Secco) to 100 (Dolce)" },
              acidity: { type: Type.NUMBER, description: "0 (Piatto) to 100 (Acidulo/Fresco)" },
            },
            required: ["structure", "tannins", "sweetness", "acidity"],
            description: "Estimated values 0-100 for visual sliders",
          },
          flavors: {
            type: Type.OBJECT,
            properties: {
              wood: { type: Type.STRING, description: "Notes related to aging (Wood, Vanilla, Chocolate, Spices). Null if none." },
              fruit: { type: Type.STRING, description: "Notes related to fruit (Berries, Citrus, Stone fruit). Null if none." },
              earth: { type: Type.STRING, description: "Notes related to earth/vegetal (Leather, Herbs, Mineral). Null if none." },
            },
            description: "Key flavor highlights extracted for display",
          }
        },
        required: [
          "id", "name", "producer", "country", "region", "style", 
          "grapes", "vintagesRecommended", "keyCharacteristics", "tastingNotes", "foodPairing", 
          "expertOpinion", "qualityRating", "priceQualityScore", "approxPriceEUR", "imageSearchQuery", "tasteProfile"
        ],
      },
    },
  },
  required: ["wines"],
};

// Fallback data for when API quota is exceeded
const MOCK_WINES: Wine[] = [
  {
    id: 'mock-1',
    name: 'Barolo DOCG Riserva 2016',
    producer: 'Giacomo Conterno',
    country: 'Italia',
    region: 'Piemonte',
    style: 'Rosso Strutturato',
    grapes: ['Nebbiolo'],
    vintagesRecommended: ['2010', '2013', '2016'],
    keyCharacteristics: 'Potente, elegante, longevo.',
    tastingNotes: 'Naso complesso di rosa appassita, catrame, liquirizia e tartufo. In bocca è austero, con tannini fitti e una lunghissima persistenza.',
    foodPairing: ['Brasato al Barolo', 'Formaggi stagionati', 'Tartufo bianco'],
    expertOpinion: 'Un monumento dell\'enologia italiana. Richiede tempo per aprirsi, ma ripaga con una complessità emotiva unica. Ideale per grandi occasioni.',
    qualityRating: 98,
    priceQualityScore: 92,
    approxPriceEUR: '250-300 €',
    bestBuyUrl: 'https://www.google.com/search?q=barolo+conterno+prezzo',
    imageSearchQuery: 'Barolo Giacomo Conterno bottle',
    tasteProfile: { structure: 95, tannins: 90, sweetness: 5, acidity: 80 },
    flavors: { wood: 'Rovere, tabacco', fruit: 'Prugna, ciliegia nera', earth: 'Catrame, rosa, tartufo' }
  },
  {
    id: 'mock-2',
    name: 'Chianti Classico Gran Selezione',
    producer: 'Marchesi Antinori',
    country: 'Italia',
    region: 'Toscana',
    style: 'Rosso Fermo',
    grapes: ['Sangiovese'],
    vintagesRecommended: ['2016', '2019'],
    keyCharacteristics: 'Equilibrato, intenso, speziato.',
    tastingNotes: 'Note di ciliegia rossa, viola mammola e spezie dolci. Tannino vibrante ma levigato, finale sapido.',
    foodPairing: ['Bistecca alla fiorentina', 'Pappardelle al cinghiale'],
    expertOpinion: 'La massima espressione del Chianti Classico. Un vino che coniuga la tradizione toscana con una precisione tecnica moderna.',
    qualityRating: 94,
    priceQualityScore: 95,
    approxPriceEUR: '45-55 €',
    bestBuyUrl: 'https://www.google.com/search?q=chianti+antinori+prezzo',
    imageSearchQuery: 'Chianti Classico Antinori bottle',
    tasteProfile: { structure: 75, tannins: 70, sweetness: 5, acidity: 85 },
    flavors: { wood: 'Spezie dolci', fruit: 'Amarena, viola', earth: 'Sottobosco' }
  }
];

export const searchWines = async (
  query: string, 
  imageBase64?: string
): Promise<Wine[]> => {
  const model = "gemini-2.5-flash"; // Supports vision and text
  
  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    });
    parts.push({
      text: "Analizza questa immagine. Se è una bottiglia, identifica il vino. Se è un menù, estrai i vini e i prezzi specifici (detectedPrice). Restituisci i dati in JSON completi di profilo gustativo (tasteProfile) e aromi (flavors)."
    });
  } else {
    parts.push({
      text: `Cerca e analizza i seguenti vini: "${query}". Se la query contiene prezzi, usali come detectedPrice. Restituisci i dati in JSON completi di profilo gustativo (tasteProfile) e aromi (flavors).`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: WINE_SCHEMA,
        temperature: 0.2, // Low temperature for factual extraction
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as WineResponse;
      return data.wines || [];
    }
    return [];
  } catch (error) {
    console.warn("Gemini API Error (likely quota):", error);
    // Return mock data so the user can test the app interface even if quota exceeded
    return MOCK_WINES; 
  }
};

export const getSimilarWines = async (wine: Wine): Promise<Wine[]> => {
  const prompt = `
    Analizza il vino: ${wine.name} di ${wine.producer} (${wine.region}, ${wine.style}).
    Trovami 3-5 vini SIMILI per stile e caratteristiche, possibilmente con un ottimo rapporto qualità/prezzo o prezzo inferiore.
    Includi il profilo gustativo (tasteProfile) e aromi (flavors) per confrontarli.
    Mantieni rigorosamente la struttura JSON richiesta.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: WINE_SCHEMA,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as WineResponse;
      // Assign new IDs to avoid conflicts if needed, or rely on model provided IDs
      return (data.wines || []).map(w => ({ ...w, id: `similar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }));
    }
    return [];
  } catch (error) {
    console.warn("Gemini API Error (Similar):", error);
    // Return mock data with different IDs for "Similar" simulation
    return MOCK_WINES.map(w => ({...w, id: w.id + '-sim', name: w.name + ' (Simile)'}));
  }
};

export const generateWineImage = async (wine: Wine): Promise<string | null> => {
  // Use gemini-2.5-flash-image for image generation
  const prompt = `
    A professional, high-quality product photography shot of a bottle of wine: ${wine.name} by ${wine.producer}.
    Region: ${wine.region}. Style: ${wine.style}.
    The bottle should be centered on a clean, light background.
    Photorealistic, 4k, studio lighting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    // Quota exceeded for images is common, just ignore and return null (UI shows placeholder)
    if (error.status === 429 || error.message?.includes('429') || error.toString().includes('quota')) {
       console.warn("Gemini Image Gen Quota Exceeded. Skipping image generation.");
       return null;
    }
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
}

export const askSommelier = async (wine: Wine, question: string): Promise<string> => {
  const prompt = `
    Contesto Vino:
    Nome: ${wine.name}
    Produttore: ${wine.producer}
    Regione: ${wine.region}
    Stile: ${wine.style}
    Uve: ${wine.grapes.join(", ")}
    Note: ${wine.tastingNotes}
    
    Domanda utente: "${question}"
    
    Rispondi in italiano, tono professionale ma amichevole (max 6-7 frasi).
    Dai consigli su servizio, abbinamento o conservazione.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION, // Use simple text response
      },
    });

    return response.text || "Mi dispiace, non riesco a rispondere al momento.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Il Sommelier è momentaneamente occupato (Limite traffico API raggiunto). Riprova più tardi.";
  }
};
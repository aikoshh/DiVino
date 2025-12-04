import { GoogleGenAI, Type } from "@google/genai";
import { Wine, WineType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured output
const wineSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Nome completo del vino" },
      winery: { type: Type.STRING, description: "Nome della cantina/produttore" },
      region: { type: Type.STRING, description: "Regione (es. Toscana, Piemonte, Napa Valley)" },
      country: { type: Type.STRING, description: "Paese di origine" },
      year: { type: Type.STRING, description: "Annata se visibile, altrimenti 'NV'" },
      type: { type: Type.STRING, description: "Rosso, Bianco, Rosato, Bollicine, ecc." },
      averageRating: { type: Type.NUMBER, description: "Valutazione stimata su 5.0 basata su Vivino o critica generale" },
      reviewCount: { type: Type.INTEGER, description: "Numero stimato di recensioni" },
      priceEstimate: { type: Type.STRING, description: "Prezzo medio di vendita in ENOTECA/RETAIL stimato (es. €20-€30). NON usare il prezzo del menu qui." },
      menuPrice: { type: Type.NUMBER, description: "Il prezzo esatto visualizzato sull'immagine del menu per questo vino, se presente. Solo il numero (es. 45). Se non visibile, null." },
      description: { type: Type.STRING, description: "Una breve descrizione da sommelier del carattere del vino (max 50 parole) in ITALIANO" },
      grapes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista dei vitigni utilizzati" },
      foodPairing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista di 3 abbinamenti gastronomici in ITALIANO" },
      alcoholContent: { type: Type.STRING, description: "Gradazione alcolica stimata" },
      tasteProfile: {
        type: Type.OBJECT,
        properties: {
          bold: { type: Type.NUMBER, description: "Scala 0-100: Da Leggero a Corposo" },
          tannic: { type: Type.NUMBER, description: "Scala 0-100: Da Morbido a Tannico" },
          sweet: { type: Type.NUMBER, description: "Scala 0-100: Da Secco a Dolce" },
          acidic: { type: Type.NUMBER, description: "Scala 0-100: Da Morbido a Acido" }
        },
        required: ["bold", "tannic", "sweet", "acidic"]
      }
    },
    required: ["name", "winery", "region", "country", "type", "description", "grapes", "tasteProfile"]
  }
};

export const scanWineImage = async (base64Image: string, promptContext: string): Promise<Wine[]> => {
  try {
    const prompt = `
      Sei un esperto Sommelier italiano e un database di vini basato sull'IA.
      Analizza l'immagine fornita. Potrebbe essere la foto di una singola bottiglia, un menu di vini o una parete piena di bottiglie.
      
      ${promptContext}

      ISTRUZIONI PREZZI:
      1. Se l'immagine è un MENU, estrai il prezzo scritto accanto al vino e inseriscilo nel campo 'menuPrice'.
      2. Per il campo 'priceEstimate', inserisci SEMPRE il prezzo di mercato medio (prezzo da scaffale/enoteca), NON il prezzo del ristorante.
      
      Identifica i vini visibili. Se è un menu, estrai le voci. Se è una bottiglia o una parete, identifica le etichette.
      Per ogni vino identificato, fornisci informazioni dettagliate come se fossi l'app 'Vivino'.
      Deduci il profilo gustativo (corpo, tannini, dolcezza, acidità) basandoti sul vitigno e sulla regione.
      
      Rispondi rigorosamente in formato JSON. Assicurati che TUTTI i testi (descrizioni, abbinamenti, ecc.) siano in ITALIANO.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: wineSchema,
        systemInstruction: "Sei un sommelier di classe mondiale. Fornisci dati accurati e in italiano."
      }
    });

    const rawText = response.text;
    if (!rawText) return [];
    
    const data = JSON.parse(rawText);
    
    // Map to ensure types match strict Enums if necessary, though schema helps.
    return data.map((item: any, index: number) => ({
      ...item,
      id: `wine-${Date.now()}-${index}`,
      type: mapStringToWineType(item.type)
    }));

  } catch (error) {
    console.error("Error identifying wine:", error);
    throw new Error("Impossibile identificare i vini. Riprova con un'immagine più chiara.");
  }
};

export const searchWineByText = async (searchText: string): Promise<Wine[]> => {
    try {
        const prompt = `
          Cerca il vino chiamato: "${searchText}".
          Fornisci informazioni dettagliate per questo vino specifico come se fossi l'app 'Vivino'.
          Deduci il profilo gustativo. Restituisci un array JSON con questo unico vino (o più se ambiguo).
          Tutti i testi devono essere in ITALIANO.
        `;
    
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: { parts: [{ text: prompt }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: wineSchema,
          }
        });
    
        const rawText = response.text;
        if (!rawText) return [];
        
        const data = JSON.parse(rawText);
        return data.map((item: any, index: number) => ({
          ...item,
          id: `wine-search-${Date.now()}-${index}`,
          type: mapStringToWineType(item.type)
        }));
    
      } catch (error) {
        console.error("Error searching wine:", error);
        throw new Error("Ricerca fallita.");
      }
}

const mapStringToWineType = (typeStr: string): WineType => {
  const lower = typeStr.toLowerCase();
  if (lower.includes('red') || lower.includes('rosso')) return WineType.RED;
  if (lower.includes('white') || lower.includes('bianco')) return WineType.WHITE;
  if (lower.includes('rose') || lower.includes('rosé') || lower.includes('rosato')) return WineType.ROSE;
  if (lower.includes('sparkling') || lower.includes('champagne') || lower.includes('prosecco') || lower.includes('bollicine') || lower.includes('spumante')) return WineType.SPARKLING;
  if (lower.includes('dessert') || lower.includes('port') || lower.includes('sherry') || lower.includes('dolce') || lower.includes('passito')) return WineType.DESSERT;
  return WineType.OTHER;
};
import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  
  const prompt = `Crea un resumen de una sola noticia relevante y reciente sobre negocios, startups, economía o innovación en la Patagonia (Chubut, Río Negro, Neuquén, Santa Cruz o Tierra del Fuego). 
Debes formatear la salida EXACTAMENTE como un objeto JSON con las siguientes claves, no uses markdown de código alrededor:
{
  "title": "Título llamativo para la noticia",
  "category": "Una categoría entre: Actualidad, Empresarial, Negocios, Startups, Innovación",
  "content": "Breve adelanto o resumen de la noticia (2-3 párrafos).",
  "url": "Enlace original a la fuente de la noticia para seguir leyendo"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    let rawText = response.text || '{}';
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(rawText);
    console.log("Success!");
    console.log(data);
  } catch (err: any) {
    console.error("AI Error:", err.message);
  }
}

test();

import express from "express";
import path from "path";
import crypto from "crypto";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { getUserRfqs, createRfq } from "./src/db/rfqs.ts";
import { notifyProvidersForRfq } from "./src/services/notificationService.ts";
import { adminDb } from "./src/lib/firebase-admin.ts";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./src/db/index.ts";
import { insights } from "./src/db/schema.ts";
import { desc, eq } from "drizzle-orm";

import { fetchEmails, sendEmail } from "./src/services/emailService.ts";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Allow cross-origin requests from the custom domain
  app.use(cors({ origin: true, credentials: true }));

  // API to list insights
  app.get("/api/insights", async (req, res) => {
    try {
      const results = await db.select().from(insights).orderBy(desc(insights.createdAt)).limit(50);
      res.json(results);
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // API to delete insight
  app.delete("/api/insights/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(insights).where(eq(insights.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete insight" });
    }
  });

  // API to add an insight manually
  app.post("/api/insights", async (req, res) => {
    try {
      const result = await db.insert(insights).values({
        title: req.body.title,
        category: req.body.category,
        content: req.body.content,
        author: req.body.author,
        image: req.body.image || null,
        videoUrl: req.body.videoUrl || null,
        sourceUrl: req.body.sourceUrl || null,
      }).returning();
      res.json({ success: true, insight: result[0] });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create insight" });
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/sync-user", requireAuth as any, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid || !req.user.email) {
         res.status(400).json({ error: "Invalid user data" });
         return;
      }
      
      const user = await getOrCreateUser(req.user.uid, req.user.email);
      res.json({ user });
    } catch (error) {
      console.error("Error syncing user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/rfqs", requireAuth as any, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid || !req.user.email) {
         res.status(400).json({ error: "Invalid user data" });
         return;
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email);
      const userRfqs = await getUserRfqs(user.id);
      res.json(userRfqs);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/rfqs", requireAuth as any, async (req: AuthRequest, res) => {
    try {
      if (!req.user || !req.user.uid || !req.user.email) {
         res.status(400).json({ error: "Invalid user data" });
         return;
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email);
      const newRfq = await createRfq(user.id, req.body);
      
      // Simular la iteración y el envío asíncrono de correos a proveedores
      notifyProvidersForRfq(newRfq.category, newRfq.title, newRfq.id).catch(err => {
        console.error("Failed to notify providers:", err);
      });

      res.json(newRfq);
    } catch (error) {
      console.error("Error creating RFQ:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/emails", requireAuth as any, async (req: AuthRequest, res) => {
    try {
      const emails = await fetchEmails();
      res.json(emails);
    } catch (error: any) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ error: error.message || "Failed to fetch emails" });
    }
  });

  app.post("/api/emails/send", requireAuth as any, async (req: AuthRequest, res) => {
    try {
      const { to, subject, text, html } = req.body;
      if (!to || !subject || (!text && !html)) {
         res.status(400).json({ error: "Missing required fields: to, subject, text/html" });
         return;
      }
      const result = await sendEmail(to, subject, text, html);
      res.json({ success: true, messageId: result.messageId });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  app.post("/api/generate-insights", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY no configurada");
      }
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const prompt = `Crea un resumen semanal estratégico curado y formateado en Markdown sobre actualidad empresarial, startups e innovación en la región patagónica (Chubut, Río Negro, Neuquén, Santa Cruz y Tierra del Fuego). Busca en internet las últimas noticias relevantes del mes en curso y sintetízalas. Enfócate en negocios, inversiones, startups y desarrollo económico. Incluye enlaces a fuentes si es posible. Formatea el texto con títulos, subtítulos, listas y negritas de manera profesional, adecuado para un "Hub de Servicios Inteligentes".`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      res.json({ insights: response.text });
    } catch (error: any) {
      console.error("Error generating insights:", error);
      res.status(500).json({ error: error.message || "Failed to generate insights" });
    }
  });

  // Cron endpoint to automatically fetch and publish insights
  app.post("/api/cron/publish-insight", async (req, res) => {
    try {
      // Basic security for cron (in production you would check for a secret header or GCP service account)
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'default-secret'}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY no configurada");
      }
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      
      const prompt = `Busca información pública reciente y noticias oficiales de los Ministerios de Producción (o equivalentes) y de las Secretarías de Trabajo, dando prioridad PRINCIPAL y ABSOLUTA a la provincia de Chubut, y secundariamente a Santa Cruz y las demás provincias de la Patagonia Argentina (Río Negro, Neuquén, Tierra del Fuego).
Crea un resumen de una sola noticia relevante sobre economía, industria, pymes, innovación, desarrollo productivo, promociones en capacitación laboral o facilidades para empresas basada en esas fuentes oficiales, asegurándote de buscar y priorizar noticias de Chubut y Santa Cruz primero.
Debes formatear la salida EXACTAMENTE como un objeto JSON con las siguientes claves, no uses markdown de código alrededor:
{
  "title": "Título llamativo para la noticia",
  "category": "Una categoría entre: Actualidad, Empresarial, Negocios, Startups, Innovación, Sector Público",
  "content": "Breve adelanto o resumen de la noticia (2-3 párrafos).",
  "url": "Enlace original a la fuente de la noticia para seguir leyendo"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      // Remove markdown code blocks if present
      let rawText = response.text || '{}';
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const data = JSON.parse(rawText);
      if (!data.title || !data.content) {
        throw new Error("AI did not return expected fields");
      }
      
      // Save directly to PostgreSQL via Drizzle
      const result = await db.insert(insights).values({
        title: data.title,
        category: data.category || "Actualidad",
        content: data.content + (data.url ? `\n\n[Leer noticia completa](${data.url})` : ''),
        image: null,
        videoUrl: null,
        author: "IA Reportero",
        sourceUrl: data.url || null
      }).returning();

      res.json({ success: true, id: result[0].id, insight: result[0] });
    } catch (error: any) {
      console.error("Error running cron publish-insight:", error);
      res.status(500).json({ error: error.message || "Failed to publish insight via cron" });
    }
  });

  app.post("/api/hero-suggestions", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY no configurada");
      }
      
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
      
      const prompt = `Eres el asistente inteligente de xPatagonia, el Hub de Servicios para la Industria Sostenible.
Genera 3 sugerencias breves de búsqueda de servicios B2B o insumos industriales relevantes para la región (ej. "Auditoría Ambiental", "Ingeniería Naval", "Logística de Frío").
Devuelve ÚNICAMENTE un array JSON válido de 3 strings, sin markdown.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let rawText = response.text || '[]';
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

      const suggestions = JSON.parse(rawText);
      res.json({ suggestions });
    } catch (error: any) {
      console.error("Error generating hero suggestions:", error);
      res.status(500).json({ error: error.message || "Failed to generate suggestions" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers for potential future API endpoints
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Basic API Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI Shopping Assistant Chat API
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, products = [], cart = [], userContext = {} } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      const latestUserMessage = messages[messages.length - 1]?.content || '';
      const ai = getGenAI();

      if (ai) {
        // Build concise catalog context
        const catalogSummary = products.slice(0, 30).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          rating: p.rating,
          description: p.description?.slice(0, 120),
          inStock: p.stock > 0
        }));

        const systemInstruction = `You are Aura, the expert AI Shopping Advisor & Personal Stylist for Shop Corner.
Your goal is to help shoppers discover products, compare features, get gift ideas, choose the right items, or check their order/delivery status.
Be friendly, concise, helpful, and sophisticated. Keep responses scannable and under 150 words when possible.

Current Product Catalog Context:
${JSON.stringify(catalogSummary, null, 2)}

User's Current Cart Items Count: ${cart.length}

CRITICAL FORMATTING INSTRUCTION:
Whenever you recommend, mention, or suggest a product from the catalog above, you MUST include its ID tag in the format [PRODUCT:product_id] right after mentioning it (e.g. "[PRODUCT:1]" or "[PRODUCT:prod_2]"). This allows our interface to display an interactive product card with an 'Add to Cart' button!`;

        // Format conversation history for Gemini
        const contents = messages.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        const replyText = response.text || "I'm here to help you find the perfect product at Shop Corner!";
        return res.json({ reply: replyText });
      } else {
        // Smart fallback when GEMINI_API_KEY is not set
        const lowerMsg = latestUserMessage.toLowerCase();
        let reply = "Hello! I'm Aura, your AI Shopping Guide. How can I help you find what you're looking for today?";

        // Find relevant products from user input keywords
        const matched = products.filter((p: any) => {
          const q = lowerMsg;
          return (
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
          );
        }).slice(0, 3);

        const formatUgx = (num: number) => `UGX ${Number(num || 0).toLocaleString()}`;

        if (lowerMsg.includes('gift') || lowerMsg.includes('recommend') || lowerMsg.includes('best')) {
          reply = `Here are some of our top-rated recommendations selected for you:\n\n`;
          if (matched.length > 0) {
            matched.forEach((m: any) => {
              reply += `• **${m.name}** (${formatUgx(m.price)}) - ${m.description?.slice(0, 70)}... [PRODUCT:${m.id}]\n`;
            });
          } else {
            const topProds = products.slice(0, 3);
            topProds.forEach((m: any) => {
              reply += `• **${m.name}** (${formatUgx(m.price)}) [PRODUCT:${m.id}]\n`;
            });
          }
        } else if (matched.length > 0) {
          reply = `I found these products matching "${latestUserMessage}":\n\n`;
          matched.forEach((m: any) => {
            reply += `• **${m.name}** (${formatUgx(m.price)}) - ${m.description?.slice(0, 70)}... [PRODUCT:${m.id}]\n`;
          });
        } else if (lowerMsg.includes('order') || lowerMsg.includes('track') || lowerMsg.includes('delivery')) {
          reply = `You can easily track your active orders by clicking the **Track Order** button in the top bar or checking your **Purchase Account Activity**!`;
        }

        return res.json({ reply });
      }
    } catch (err: any) {
      console.error('[AI Chat API Error]:', err);
      return res.status(500).json({
        reply: "I'm having trouble connecting to my knowledge base right now, but feel free to browse our categories or ask me again!"
      });
    }
  });

  // Vite middleware configuration
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Running in DEVELOPMENT mode. Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Running in PRODUCTION mode. Serving static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Core node online and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Critical failure during startup:', err);
  process.exit(1);
});

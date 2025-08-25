// api/query.js

// Importamos a biblioteca do Google
import { GoogleGenerativeAI } from "@google/generative-ai";

// O cache é definido fora do handler para persistir entre as chamadas
const cache = new Map();

// Esta é a função principal que a Vercel irá executar
export default async function handler(req, res) {
  // --- Controle de CORS ---
  // Define de qual origem o backend aceita requisições (a URL do seu frontend na Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*'); // Para teste, '*' é ok. Em produção, use a URL do seu site.
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // O navegador envia uma requisição OPTIONS antes do POST para verificar o CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // -------------------------

  // Verificamos se o método da requisição é POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // O restante da sua lógica continua aqui dentro
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    if (cache.has(prompt)) {
      console.log('CACHE HIT!');
      return res.status(200).json({ source: 'Cache', ...cache.get(prompt) });
    }

    console.log('CACHE MISS!');
    // Inicia o cliente do Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const responseData = { completion: { content: text } };
    cache.set(prompt, responseData);

    return res.status(200).json({ source: 'API Externa (Gemini)', ...responseData });

  } catch (error) {
    console.error("Erro na função da API:", error);
    return res.status(500).json({ error: 'Falha ao processar a requisição.' });
  }
}
// api/query.js - VERSÃO FINAL

const { GoogleGenerativeAI } = require("@google/generative-ai");

const cache = new Map();

module.exports = async (req, res) => {
  // Controle de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Lógica principal
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    if (cache.has(prompt)) {
      console.log('CACHE HIT!');
      return res.status(200).json({ source: 'Cache', ...cache.get(prompt) });
    }

    console.log('CACHE MISS! Chamando a API do Gemini...');
    // Inicializa o cliente do Gemini usando a chave de API da Vercel
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const responseData = { completion: { content: text } };
    cache.set(prompt, responseData);

    return res.status(200).json({ source: 'API Externa (Gemini)', ...responseData });

  } catch (error) {
    console.error("Erro na função da API do Gemini:", error);
    return res.status(500).json({ error: 'Falha ao processar a requisição.' });
  }
};
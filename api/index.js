// api/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
// ANTES (OpenAI): const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // DEPOIS (Google)

const app = express();
app.use(cors());
app.use(express.json());

// --- MUDANÇA NA CONFIGURAÇÃO ---
// ANTES (OpenAI):
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// DEPOIS (Google):
// Acessa a sua chave de API do arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//--------------------------------

const cache = new Map();

app.post('/api/query', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório.' });
  }

  if (cache.has(prompt)) {
    return res.json({ source: 'Cache', ...cache.get(prompt) });
  }

  try {
    // --- MUDANÇA NA CHAMADA DA API ---
    // ANTES (OpenAI):
    // const completion = await openai.chat.completions.create({ ... });
    // const responseData = { completion: completion.choices[0].message };
    
    // DEPOIS (Google):
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const responseData = { completion: { content: text } }; // Mantemos a estrutura para o frontend funcionar
    //--------------------------------

    cache.set(prompt, responseData);
    return res.json({ source: 'API Externa (Gemini)', ...responseData });
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error);
    return res.status(500).json({ error: 'Falha ao processar a requisição.' });
  }
});

module.exports = app;
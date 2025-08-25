// api/index.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();

// IMPORTANTE: Configure o CORS para permitir requisições do seu futuro domínio na Vercel
// Deixe '*' por enquanto para facilitar, ou coloque o domínio do seu frontend quando souber
app.use(cors()); 
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cache = new Map();

app.post('/api/query', async (req, res) => {
  // ... (todo o resto do seu código da rota continua exatamente o mesmo) ...
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt é obrigatório.' });
  }
  
  console.log(`Recebida requisição para o prompt: "${prompt}"`);

  if (cache.has(prompt)) {
    console.log('CACHE HIT! Retornando resposta do cache.');
    const cachedResponse = cache.get(prompt);
    return res.json({
      source: 'Cache',
      ...cachedResponse,
    });
  }

  try {
    console.log('CACHE MISS! Chamando a API da OpenAI...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    });

    const responseData = {
      completion: completion.choices[0].message,
    };
    
    cache.set(prompt, responseData);
    console.log('Resposta da OpenAI armazenada no cache.');

    return res.json({
      source: 'API Externa (OpenAI)',
      ...responseData,
    });
  } catch (error) {
    console.error('Erro ao chamar a API da OpenAI:', error);
    return res.status(500).json({ error: 'Falha ao processar a requisição.' });
  }
});


// A MUDANÇA PRINCIPAL: Em vez de ouvir uma porta, exportamos o app.
module.exports = app;
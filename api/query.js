// api/query.js - VERSÃO FINAL

const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Normaliza uma string para ser usada como chave de cache.
 * Converte para minúsculas, remove acentos, espaços extras e pontuação.
 * @param {string} str O prompt original.
 * @returns {string} O prompt normalizado.
 */
function normalizePrompt(str) {
  if (!str) return '';
  return str
    .toLowerCase() // 1. Converte para minúsculas
    .normalize("NFD") // 2. Separa os acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "") // 3. Remove os acentos
    .replace(/[^\w\s]/g, '') // 4. Remove pontuação (tudo que não é letra, número ou espaço)
    .replace(/\s+/g, ' ') // 5. Remove espaços duplicados
    .trim(); // 6. Remove espaços no início e no fim
}

const cache = new Map();

module.exports = async (req, res) => {
  // ... (código de CORS e verificação de método)

  // Lógica principal
  try {
    // 1. Pega o prompt original do corpo da requisição
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    // 2. Cria uma versão normalizada APENAS para usar como chave do cache
    const normalizedPrompt = normalizePrompt(prompt);

    // 3. Verifica o cache usando a chave normalizada
    if (cache.has(normalizedPrompt)) {
      console.log('CACHE HIT!');
      return res.status(200).json({ source: 'Cache', ...cache.get(normalizedPrompt) });
    }

    console.log('CACHE MISS! Chamando a API do Gemini...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});

    // 4. Envia o prompt ORIGINAL para a API do Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const responseData = { completion: { content: text } };

    // 5. Salva no cache usando a chave normalizada
    cache.set(normalizedPrompt, responseData);

    return res.status(200).json({ source: 'API Externa (Gemini)', ...responseData });

  } catch (error) {
    console.error("Erro na função da API do Gemini:", error);
    return res.status(500).json({ error: 'Falha ao processar a requisição.' });
  }
};
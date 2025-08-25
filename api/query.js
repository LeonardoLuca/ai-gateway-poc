// api/query.js - CÓDIGO DE TESTE TEMPORÁRIO

// Usamos 'module.exports' para exportar a função
module.exports = async (req, res) => {
  // --- Controle de CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // -------------------------

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Se a requisição for POST, apenas retorne uma mensagem de sucesso
  try {
    const { prompt } = req.body;
    console.log(`[TESTE] Recebido o prompt: ${prompt}`);

    const responseData = {
      completion: { content: `[SUCESSO] O backend recebeu seu prompt: "${prompt}"` }
    };

    return res.status(200).json({ source: 'Backend de Teste', ...responseData });

  } catch (error) {
    console.error("[TESTE] Erro:", error);
    return res.status(500).json({ error: 'Falha no backend de teste.' });
  }
};
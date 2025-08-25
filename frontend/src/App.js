// src/App.js

import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Vamos criar este arquivo para um estilo mínimo

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [source, setSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);
    setError('');
    setSource('');

    try {
      // Chama nosso backend, não a API da OpenAI diretamente!
      const result = await axios.post('http://localhost:3001/api/query', { prompt });
      setResponse(result.data.completion);
      setSource(result.data.source);
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Gateway - Proof of Concept</h1>
        <p>Teste o sistema de cache. Envie o mesmo prompt duas vezes e veja a fonte da resposta mudar.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Digite sua pergunta aqui..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processando...' : 'Enviar'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {response && (
          <div className="response-container">
            <p className="source-info" data-source={source}>
              <strong>Fonte da Resposta:</strong> {source}
            </p>
            <div className="response-content">
              {response.content}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
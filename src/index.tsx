import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error mounting app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Erro ao carregar a aplicação</h1>
      <p>Por favor, tente recarregar a página.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${error}</pre>
    </div>
  `;
}
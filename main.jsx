/**
 * CAMINHO: src/main.jsx
 * 
 * Ponto de entrada principal da aplicação React
 * Inicializa o React e configura providers globais
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos globais
import './styles/global.css';
import './styles/animations.css';

// Renderizar a aplicação
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
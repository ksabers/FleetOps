import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // stile globale, applicato a tutta l'app

// createRoot + render è la API "moderna" di React (React 18+).
// StrictMode è una modalità di sola-diagnostica: non renderizza nulla in
// più, ma segnala in console pratiche potenzialmente problematiche mentre
// impariamo React. Non ha alcun effetto sulla build di produzione finale.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

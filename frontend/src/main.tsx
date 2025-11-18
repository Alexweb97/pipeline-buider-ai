/**
 * Main Entry Point
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { configureMonacoEditor } from './config/monaco';

// Configure Monaco Editor before rendering the app
configureMonacoEditor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

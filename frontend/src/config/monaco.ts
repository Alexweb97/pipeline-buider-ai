/**
 * Monaco Editor Configuration
 * Centralized configuration for Monaco Editor to avoid multiple loader configs
 */
import { loader } from '@monaco-editor/react';

// Configure Monaco Editor loader once
// This should be imported early in the application (e.g., in main.tsx)
export const configureMonacoEditor = () => {
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
    }
  });
};

// Optional: Configure Monaco Editor themes and languages
export const setupMonacoEditor = async () => {
  const monaco = await loader.init();

  // You can add custom themes or language configurations here
  // For example:
  // monaco.editor.defineTheme('custom-dark', { ... });

  return monaco;
};

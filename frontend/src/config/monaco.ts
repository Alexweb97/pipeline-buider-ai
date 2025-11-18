/**
 * Monaco Editor Configuration
 * Centralized configuration for Monaco Editor
 */
import { loader } from '@monaco-editor/react';

export const configureMonacoEditor = () => {
  // Configure Monaco to use a specific CDN version
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs'
    }
  });

  // Set Monaco environment for web workers
  loader.init().then(() => {
    // Configure worker paths
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: string, label: string) {
        if (label === 'json') {
          return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/language/typescript/ts.worker.js';
        }
        return 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs/editor/editor.worker.js';
      }
    };
  });
};

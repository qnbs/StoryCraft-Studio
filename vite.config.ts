import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repository name für GitHub Pages
const REPO_NAME = 'StoryCraft-Studio';

export default defineConfig({
  // KRITISCH: Base-Pfad für GitHub Pages
  base: `/${REPO_NAME}/`,
  
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  
  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    
    rollupOptions: {
      output: {
        // Asset-Hashing für Cache-Busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        
        // Code-Splitting für bessere Ladezeiten
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-undo'],
          'ai-vendor': ['@google/genai'],
          'export-vendor': ['jspdf', 'docx', 'jszip'],
        },
      },
    },
  },
  
  // WICHTIG: Keine process.env API Key Injection mehr!
  // Der Key wird sicher via UI → IndexedDB gehandhabt
  define: {
    // Nur Build-Zeit Metadaten
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
    '__VERSION__': JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});

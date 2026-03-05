import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repository name für GitHub Pages
const REPO_NAME = 'StoryCraft-Studio';

// Custom Domain Detection: 
// Wenn public/CNAME existiert und einen Wert hat, verwende '/' als base
// Sonst nutze den Repository-Namen für GitHub Pages Subpath
function getBasePath(): string {
  try {
    const cnamePath = path.resolve(__dirname, 'public/CNAME');
    if (fs.existsSync(cnamePath)) {
      const cname = fs.readFileSync(cnamePath, 'utf-8').trim();
      if (cname && cname.length > 0) {
        console.log(`📦 Custom Domain detected: ${cname} → Using base '/'`);
        return '/';
      }
    }
  } catch {
    // Fallback to default
  }
  console.log(`📦 No Custom Domain → Using base '/${REPO_NAME}/'`);
  return `/${REPO_NAME}/`;
}

export default defineConfig({
  // Fix: Statischer Base-Pfad fr GitHub Pages
  base: '/StoryCraft-Studio/',
  
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

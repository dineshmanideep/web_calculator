import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  build: {
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate large vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-math': ['mathjs'],
          'vendor-plot': ['plotly.js-basic-dist', 'react-plotly.js'],
          'vendor-ui': ['lucide-react', 'react-toastify', 'axios'],
        },
      },
    },
    
    // Increase chunk size warning limit (plotly is large)
    chunkSizeWarningLimit: 1000,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'mathjs', 'plotly.js-basic-dist'],
  },
});

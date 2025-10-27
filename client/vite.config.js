import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react(), tailwindcss()],
    
    // Server configuration for development
    server: {
      port: 5173,
      strictPort: false,
      host: true,
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        }
      } : undefined
    },
    
    // Build configuration for production
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'math-vendor': ['mathjs'],
            'ui-vendor': ['react-toastify', 'lucide-react'],
          }
        }
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      strictPort: false,
      host: true,
    },
    
    // Environment variable prefix
    envPrefix: 'VITE_',
  };
});

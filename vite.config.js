import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Habilita Fast Refresh do React
      fastRefresh: true,
    })
  ],
  
  // Configuração de aliases para imports mais limpos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  
  // Configuração do servidor de desenvolvimento
  server: {
    port: 5173,
    host: true,
    open: true, // Abre automaticamente no navegador
    cors: true,
  },
  
  // Configuração de build para produção
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilitar sourcemaps em produção
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar dependências grandes em chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'animations': ['framer-motion'],
          'media': ['react-player', 'wavesurfer.js', 'pdfjs-dist'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar limite de aviso de chunk
  },
  
  // Otimizações
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
    ],
  },
  
  // Configuração de preview (para testar build localmente)
  preview: {
    port: 4173,
    host: true,
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    allowedHosts: [
      'efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host',
      '.clouding.host', // cualquier subdominio de Clouding
    ],
  },
});

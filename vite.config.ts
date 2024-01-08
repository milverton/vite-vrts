import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from 'tailwindcss';
// https://vitejs.dev/config/

export default defineConfig({
  // @ts-ignore
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'wwwroot', // sets the output directory for the build
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001', // Target server for API requests
    }
  }
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set VITE_BASE=/repo-name/ when deploying to GitHub Pages
  base: process.env.VITE_BASE ?? '/',
});

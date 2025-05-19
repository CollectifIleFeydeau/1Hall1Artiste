import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({  
  // Utiliser une base vide en développement et la base GitHub Pages en production
  base: mode === 'production' ? "/Collectif-Feydeau---app/" : "/",
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    hmr: {
      clientPort: 8080
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Utiliser le chemin du dépôt du collectif en production et une base vide en développement
  base: mode === 'production' ? "/1Hall1Artiste/" : "/",
  // Assurer que les chemins d'assets sont correctement générés
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    // Configuration du code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Regrouper React et les dépendances liées dans un chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Regrouper les composants UI dans un chunk séparé
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
            'lucide-react',
            'framer-motion',
          ],
        },
      },
    },
    // Réduire la taille des chunks générés
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    // Désactivation de HTTPS pour éviter les problèmes de certificat
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

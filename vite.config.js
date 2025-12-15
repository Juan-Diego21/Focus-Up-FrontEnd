import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@modules": resolve(__dirname, "./src/modules"),
      "@shared": resolve(__dirname, "./src/shared"),
      "@types": resolve(__dirname, "./src/types"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@services": resolve(__dirname, "./src/services"),
      "@contexts": resolve(__dirname, "./src/contexts"),
      "@pages": resolve(__dirname, "./src/pages"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Librerías de React y navegación
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router-dom") ||
            id.includes("node_modules/framer-motion")
          ) {
            return "vendor-react";
          }

          // Librerías de UI
          if (
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/@headlessui") ||
            id.includes("node_modules/sweetalert2")
          ) {
            return "vendor-ui";
          }

          // Librerías de estado y datos
          if (
            id.includes("node_modules/zustand") ||
            id.includes("node_modules/@tanstack") ||
            id.includes("node_modules/axios")
          ) {
            return "vendor-state";
          }

          // Módulos de la aplicación
          if (id.includes("src/modules/auth/")) {
            return "auth";
          }
          if (id.includes("src/modules/music/")) {
            return "music";
          }
          if (id.includes("src/modules/sessions/")) {
            return "sessions";
          }
          if (id.includes("src/modules/study-methods/")) {
            return "study-methods";
          }
          if (id.includes("src/modules/events/")) {
            return "events";
          }
          if (id.includes("src/modules/notifications/")) {
            return "notifications";
          }

          // Utilidades compartidas
          if (id.includes("src/shared/utils/")) {
            return "shared-utils";
          }
          if (id.includes("src/shared/hooks/")) {
            return "shared-hooks";
          }
          if (id.includes("src/shared/services/")) {
            return "shared-services";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar límite de advertencia
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

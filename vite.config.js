import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL?.trim();
  const proxyTarget = apiUrl?.startsWith("http")
    ? new URL(apiUrl).origin
    : undefined;

  return {
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
    // Production build: remove console/debugger statements from output bundles.
    esbuild: mode === "production" ? { drop: ["console", "debugger"] } : undefined,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React and navigation libraries
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react-router-dom") ||
              id.includes("node_modules/framer-motion")
            ) {
              return "vendor-react";
            }

            // UI libraries
            if (
              id.includes("node_modules/lucide-react") ||
              id.includes("node_modules/@headlessui") ||
              id.includes("node_modules/sweetalert2")
            ) {
              return "vendor-ui";
            }

            // State and data libraries
            if (
              id.includes("node_modules/zustand") ||
              id.includes("node_modules/@tanstack") ||
              id.includes("node_modules/axios")
            ) {
              return "vendor-state";
            }

            // Application modules
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

            // Shared utilities
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
      chunkSizeWarningLimit: 1000,
    },
    server: proxyTarget
      ? {
          proxy: {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  };
});

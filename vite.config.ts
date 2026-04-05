import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiTarget = process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:3000";

const apiProxy = {
  "/auth": { target: apiTarget, changeOrigin: true },
  "/users": { target: apiTarget, changeOrigin: true },
  "/health": { target: apiTarget, changeOrigin: true },
  "/diagnoses": { target: apiTarget, changeOrigin: true },
  "/comunidades": { target: apiTarget, changeOrigin: true },
};

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["dicom_icon.svg"],
      manifest: {
        name: "Diagnóstico Comunidades",
        short_name: "Diagnóstico",
        description: "Coleta em campo — offline-first",
        theme_color: "#2E7D32",
        background_color: "#F5F5F5",
        display: "standalone",
        orientation: "portrait-primary",
        lang: "pt-BR",
        start_url: "/",
        icons: [
          {
            src: "/dicom_icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,png,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    proxy: apiProxy,
  },
});

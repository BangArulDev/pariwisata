import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["qrcode.react"],
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit slightly to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          leaflet: ["leaflet", "react-leaflet"],
          utils: ["qrcode.react", "@yudiel/react-qr-scanner", "lucide-react"],
        },
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router-dom")) return "router";
          if (id.includes("@dnd-kit")) return "dnd-kit";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("socket.io-client")) return "socket";
          if (id.includes("axios")) return "http";
          return "vendor";
        },
      },
    },
  },
});

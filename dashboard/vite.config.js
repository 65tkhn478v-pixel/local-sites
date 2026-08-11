import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dashboard interne — V1 données locales uniquement, aucun backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});

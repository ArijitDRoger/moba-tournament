import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 👈 Allows access from other devices
    port: 5173, // 👈 Or any port you prefer
  },
  build: {
    sourcemap: true, // ✅ Enable source maps
  },
});

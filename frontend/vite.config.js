import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  server: {
    port: 3000, // Frontend runs on 3000
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Backend will run on 5001
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

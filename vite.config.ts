import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: "stream-browserify",
    },
  },
  optimizeDeps: {
    include: ["exceljs"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});

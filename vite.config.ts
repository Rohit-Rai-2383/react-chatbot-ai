import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": {},
  },

  plugins: [
    react({
      babel: { plugins: [] },
      jsxRuntime: "automatic",
      jsxImportSource: "react",
    }),
  ],

  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },

  optimizeDeps: {
    esbuildOptions: {
      jsx: "automatic",
      jsxImportSource: "react",
    },
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, "src/widget.tsx"),
      name: "ChatbotWidget",
      fileName: "chatbot-widget",
      formats: ["iife"],
    },
    outDir: "dist-widget",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});

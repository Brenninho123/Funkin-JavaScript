import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  publicDir: "../assets",
  server: {
    port: 8080,
    open: true
  },
  build: {
    outDir: "../export/release/html5",
    emptyOutDir: true
  }
});

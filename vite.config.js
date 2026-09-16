import { defineConfig } from "vite";

export default defineConfig({
  css: {
    postcss: {}, // evita que Vite busque un postcss.config.* en carpetas superiores
  },
});

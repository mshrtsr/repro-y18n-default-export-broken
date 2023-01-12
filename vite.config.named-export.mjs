import { defineConfig } from "vite";

/** @type {import('vite').UserConfig} */
const config = {
  build: {
    rollupOptions: {
      input: "src/importing-named-export.mjs",
      output: {
        format: "cjs",
        dir: "dist",
        entryFileNames: "[name].vite.cjs",
      },
    },
    emptyOutDir: false,
  },
};
export default defineConfig(config);

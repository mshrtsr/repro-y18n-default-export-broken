import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";

/** @type {import('rollup').UserConfig} */
const config = {
  input: "src/importing-default-export.mjs",
  output: {
    dir: "dist",
    entryFileNames: "[name].rollup.cjs",
    format: "cjs",
  },
  plugins: [nodeResolve()],
};
export default defineConfig(config);

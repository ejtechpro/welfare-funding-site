import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import pluginRouter from "@tanstack/eslint-plugin-router";

export default defineConfig([
  ...pluginRouter.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);

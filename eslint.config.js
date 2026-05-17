// eslint.config.mjs
import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from 'globals';

export default defineConfig([
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node
        },
        parser: tsparser,
        parserOptions: { project: "./tsconfig.json" },
    },

    // You can add your own configuration to override or add rules
    rules: {
      // example: turn off a rule from the recommended set
      //"obsidianmd/sample-names": "off",
      // example: add a rule not in the recommended set and set its severity
      //"obsidianmd/prefer-file-manager-trash": "error",
      "no-undef": "off",
      "@typescript-eslint/unbound-method": "off"
    },
  },
  {
	ignores: [
      "node_modules",
      "dist",
      "esbuild.config.mjs",
      "eslint.config.js",
      "version-bump.mjs",
      "versions.json",
      "main.js",
      "src/utils/handlebars_moment.cjs"
    ],
  },
]);

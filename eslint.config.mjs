import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"], plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.chai,
        ...globals.mocha,
        ...globals.node,
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "emit": "readonly",
        "Bits": "readonly",
        "Hex": "readonly"
      }
    }
  },
  {
    rules: {
      "prefer-destructuring": [
        "error",
        {
          "array": false,
          "object": true
        }
      ],
      "prefer-object-spread": "off",
      "no-bitwise": "off",
      "no-plusplus": "off",
      "curly": "error",
      "no-unused-vars": ["error", { "varsIgnorePattern": "consume" }],
      "no-underscore-dangle": ["error", { "allow": ["__get__", "__set__"] }]
    }
  },
  eslintConfigPrettier
]);

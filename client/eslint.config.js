// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook"

import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },

    ignores: ["dist", ".eslint.config.cjs"],
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "arrow-parens": "off", // Несовместимо с prettier
      "object-curly-newline": "off", // Несовместимо с prettier
      "no-mixed-operators": "off", // Несовместимо с prettier
      "function-paren-newline": "off", // Несовместимо с prettier
      "space-before-function-paren": 0, // Несовместимо с prettier
      "arrow-body-style": "off",
      "no-plusplus": "off",
      "max-len": [
        "error",
        100,
        2,
        { ignoreUrls: true, ignoreComments: true, ignoreStrings: true, ignoreRegExpLiterals: true },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-alert": "error",
      "no-param-reassign": "off",
      "react/jsx-pascal-case": "off",
      "no-prototype-builtins": "off",
      "react/jsx-a11y/anchor-is-valid": "off",
      "react/no-did-update-set-state": "off",
      "react/jsx-closing-tag-location": "off",
      "react/jsx-closing-bracket-location": "off",
      "react/jsx-handler-names": "off",
      "array-callback-return": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "never"],
      "no-unused-vars": "off",
      "default-case": "off",
      camelcase: ["off"],
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
    settings: {
      react: {
        version: "detect", // Позволяет автоматически определять версию React
      },
    },
  },
  ...storybook.configs["flat/recommended"],
])

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "storybook-static"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Prohibir console.log en cÃ³digo de producciÃ³n
      "no-console": ["error", { allow: ["warn", "error"] }],
      // Reglas adicionales para calidad de cÃ³digo
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);

// ConfiguraciÃ³n moderna de ESLint usando flat config
// Esta configuraciÃ³n reemplaza el archivo .eslintrc.* obsoleto
// Incluye reglas para TypeScript y React Hooks
// ProhÃ­be console.log para mantener cÃ³digo limpio en producciÃ³n

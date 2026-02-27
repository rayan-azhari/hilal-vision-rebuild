import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  // Global ignores
  { ignores: ["dist/", "node_modules/", "android/", "ios/", "*.config.*", "client/public/", "scripts/", "server/scripts/**"] },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // TypeScript handles undefined variable checking — disable JS-level no-undef
  { rules: { "no-undef": "off" } },

  // React hooks rules
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // Project-specific rules for all TS/TSX files
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Prevent console leaks in client production code
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // TypeScript strictness
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Safety
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Catch common bugs
      // null: "ignore" allows the idiomatic `!= null` check (catches both null and undefined)
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-var": "error",
      "prefer-const": "warn",
    },
  },

  // Relax rules for test files
  {
    files: ["**/*.test.*", "**/*.spec.*", "e2e/**"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Relax rules for server/API files (console needed for operational logging)
  // no-explicit-any is off because API/server code legitimately handles untyped JSON at HTTP boundaries
  {
    files: ["server/**", "api/**"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Prettier compatibility (must be last)
  prettierConfig,
);

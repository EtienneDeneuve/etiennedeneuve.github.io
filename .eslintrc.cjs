/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["eslint:recommended", "plugin:astro/recommended"],
  ignorePatterns: [
    "dist/",
    "node_modules/",
    ".astro/",
    "public/",
    "scripts/",
    "src/scripts/",
    "*.cjs",
    "e2e/",
  ],
  rules: {
    // TypeScript / Astro frontmatter often declares intentional names eslint cannot see.
    "no-unused-vars": "off",
    "no-undef": "off",
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
    },
    {
      files: ["**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
  ],
};

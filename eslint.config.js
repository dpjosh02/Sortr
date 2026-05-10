import js from "@eslint/js";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import importX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: ["coverage/", "dist/", "node_modules/"],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.js"],
  },
  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
      globals: {
        HTMLCanvasElement: "readonly",
        document: "readonly",
        window: "readonly",
      },
    },
    plugins: {
      "import-x": importX,
    },
    rules: {
      "import-x/first": "error",
      "import-x/newline-after-import": "error",
      "import-x/no-duplicates": "error",
      "import-x/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
          },
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
        },
      ],
    },
  },
);

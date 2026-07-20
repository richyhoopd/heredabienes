import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  {
    rules: {
      // En FASE 1 mantenemos <img> nativo a proposito (ver riesgo R2).
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;

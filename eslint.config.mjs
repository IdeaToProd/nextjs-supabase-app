import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: [".next/**", "out/**", "build/**", "node_modules/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"), // Prettier와 충돌하는 ESLint 규칙 비활성화 (반드시 마지막)
];

export default eslintConfig;

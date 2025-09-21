import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // N.21: Custom rules for Next.js Link patterns
    rules: {
      // Enforce proper Link usage - simplified rules to avoid regex issues
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXElement[openingElement.name.name='Link'] JSXAttribute[name.name='passHref']",
          message: "N.21: 'passHref' prop is deprecated in Next.js 13+ App Router"
        }
      ],
      // Enforce Link component for internal routes
      "jsx-a11y/anchor-is-valid": ["error", {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"]
      }],
      // Custom Next.js specific rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      "@next/next/no-head-element": "error",
    }
  }
];

export default eslintConfig;

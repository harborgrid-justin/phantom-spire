// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript"), {
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "cypress/downloads/**",
    "cypress/results/**",
    "coverage/**",
  ],
}, {
  // Enterprise-grade TypeScript and code quality rules
  rules: {
    // TypeScript specific rules
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "caughtErrorsIgnorePattern": "^_"
    }],
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/prefer-as-const": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/restrict-template-expressions": "error",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { 
      "prefer": "type-imports",
      "disallowTypeAnnotations": false 
    }],
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/array-type": ["error", { "default": "array-simple" }],
    "@typescript-eslint/ban-types": "error",
    
    // Code quality rules
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-debugger": "error",
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-template": "error",
    "prefer-arrow-callback": "error",
    "arrow-spacing": "error",
    "no-duplicate-imports": "error",
    "no-useless-return": "error",
    "no-useless-concat": "error",
    "no-useless-rename": "error",
    "no-else-return": "error",
    "prefer-destructuring": ["error", {
      "array": true,
      "object": true
    }],
    
    // Security rules
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-script-url": "error",
    "no-alert": "error",
    
    // Performance rules
    "no-await-in-loop": "warn",
    "require-atomic-updates": "error",
    
    // React/Next.js specific rules
    "react/no-unused-prop-types": "error",
    "react/no-unescaped-entities": "error",
    "react/jsx-no-target-blank": "error",
    "react/jsx-key": "error",
    "react/no-array-index-key": "warn",
    "react/jsx-pascal-case": "error",
    "react/self-closing-comp": "error",
    "react/jsx-boolean-value": ["error", "never"],
    
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
    "@next/next/no-page-custom-font": "warn",
    "@next/next/no-unwanted-polyfillio": "error",
    
    // Accessibility rules
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
  }
}, {
  // Special rules for test files
  files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn", // More lenient in tests
    "no-console": "off", // Allow console in tests
  }
}, {
  // Special rules for configuration files
  files: ["*.config.js", "*.config.ts", "next.config.ts", "tailwind.config.ts"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-var-requires": "off",
  }
}, {
  // Special rules for Cypress files
  files: ["cypress/**/*.ts", "cypress/**/*.js"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off",
  }
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;

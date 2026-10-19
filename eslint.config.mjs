import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", ".next-node/**", ".cloudflare/**", ".vinext/**", "out/**", "build/**", "dist/**", "next-env.d.ts"]),
  {
    rules: {
      // Block props are deliberately schema-driven JSON and therefore dynamic.
      "@typescript-eslint/no-explicit-any": "off",
      // The editor must render arbitrary user URLs and data-URI uploads directly.
      "@next/next/no-img-element": "off",
    },
  },
]);

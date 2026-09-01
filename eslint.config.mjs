import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      /**
       * The backoffice loads its data with `useEffect` + `setState`, which is
       * the documented pattern for client-side fetching without adding a data
       * layer such as React Query. The React Compiler rule flags it because a
       * Suspense-based loader would be preferable, but the current approach is
       * intentional: it keeps the JavaScript bundle small, which matters for
       * the low-bandwidth conditions this site targets.
       *
       * Downgraded to a warning so it stays visible without failing CI.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // Google Fonts are loaded from the root layout, which is correct for the
    // App Router; the rule targets the legacy `pages/` directory.
    files: ["src/app/layout.tsx"],
    rules: { "@next/next/no-page-custom-font": "off" },
  },
]);

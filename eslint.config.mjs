import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // All 23 occurrences are intentional SSR-safe localStorage reads:
      // useState default → useEffect reads localStorage → setState.
      // Fixing via useSyncExternalStore is planned for a dedicated refactor;
      // disabling here to keep lint signal meaningful.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;

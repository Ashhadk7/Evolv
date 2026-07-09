import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture guardrail: UI primitives must stay dumb and reusable.
  // They may not depend on feature code or mock-data files.
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/features/*", "**/features/*"],
              message:
                "UI primitives in components/ui must not import from features/. Keep them domain-agnostic.",
            },
            {
              group: ["**/*Data", "**/*Data.ts", "@/**/*Data"],
              message: "UI primitives must not import mock/domain data. Pass data in via props.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

import { test } from "@playwright/test";

/**
 * Attaches QA metadata to a test so the HTML report shows which test case it
 * covers, at what priority, and of what type — rather than just a title.
 *
 * Annotations render in the Playwright HTML report under each test, and are
 * also carried into the JSON and JUnit reporters for traceability.
 */
export type Priority = "P0" | "P1" | "P2" | "P3";

export type TestType =
  | "Functional"
  | "Validation"
  | "Negative"
  | "Boundary"
  | "Integration"
  | "UI";

export interface CaseMeta {
  /** Test case ID from Evolv_Person3_Test_Cases.xlsx, e.g. "TC-DISC-002". */
  id: string;
  priority: Priority;
  type: TestType;
  /** Feature area, matching the workbook's Module column. */
  area: string;
  /** What the case proves, in one line. Shown in the report. */
  objective: string;
}

export function annotate(meta: CaseMeta): void {
  test.info().annotations.push(
    { type: "Test Case", description: meta.id },
    { type: "Priority", description: meta.priority },
    { type: "Test Type", description: meta.type },
    { type: "Feature Area", description: meta.area },
    { type: "Objective", description: meta.objective }
  );
}

/** Tag helper so `--grep` filtering stays consistent across spec files. */
export function tags(area: string, priority: Priority, type: TestType): string[] {
  return [`@${area}`, `@${priority.toLowerCase()}`, `@${type.toLowerCase()}`, "@person3"];
}

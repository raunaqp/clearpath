/**
 * Validates the 50-case calibration set:
 *   data/calibration/clearpath_synthetic_50_full_schema_v2_1.json
 *
 * Per-case schema (additive — does NOT touch existing fields):
 *   expected_cdsco_class: "A" | "B" | "C" | "D" | null   (JSON null, NOT the string "null")
 *   or_acceptable:        Array of "A" | "B" | "C" | "D" | null  (alternates only — must NOT
 *                         include the value already in expected_cdsco_class)
 *   rationale:            non-empty string
 *   labeled_by:           non-empty string
 *   labeled_at:           "YYYY-MM-DD"
 *
 * File-level checks:
 *   - exactly 50 cases
 *
 * Exits 0 on full pass, 1 on any failure. Wire into CI before any eval run.
 *
 * Run:
 *   npx tsx scripts/validate-calibration-50.ts
 *   npx tsx scripts/validate-calibration-50.ts <path/to/file.json>
 */

import * as fs from "fs";
import * as path from "path";

const VALID_CLASS_STRINGS = new Set(["A", "B", "C", "D"]);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_PATH =
  "data/calibration/clearpath_synthetic_50_full_schema_v2_1.json";
const EXPECTED_COUNT = 50;

type CaseRow = Record<string, unknown> & {
  case_id?: unknown;
  expected_cdsco_class?: unknown;
  or_acceptable?: unknown;
  rationale?: unknown;
  labeled_by?: unknown;
  labeled_at?: unknown;
};

type Issue = { case_id: string; field: string; problem: string };

function isValidClassValue(v: unknown): boolean {
  return v === null || (typeof v === "string" && VALID_CLASS_STRINGS.has(v));
}

function classToString(v: unknown): string {
  return v === null ? "null" : JSON.stringify(v);
}

function validateCase(c: CaseRow, idx: number): Issue[] {
  const issues: Issue[] = [];
  const id = typeof c.case_id === "string" ? c.case_id : `(case index ${idx})`;

  // expected_cdsco_class — JSON null OR string in {A,B,C,D}
  if (!("expected_cdsco_class" in c)) {
    issues.push({ case_id: id, field: "expected_cdsco_class", problem: "missing" });
  } else if (!isValidClassValue(c.expected_cdsco_class)) {
    issues.push({
      case_id: id,
      field: "expected_cdsco_class",
      problem: `must be one of {A,B,C,D,null(JSON)}; got ${classToString(c.expected_cdsco_class)}`,
    });
  }

  // or_acceptable — array of valid values, must NOT include expected_cdsco_class itself
  if (!("or_acceptable" in c)) {
    issues.push({ case_id: id, field: "or_acceptable", problem: "missing" });
  } else if (!Array.isArray(c.or_acceptable)) {
    issues.push({
      case_id: id,
      field: "or_acceptable",
      problem: `must be an array; got ${typeof c.or_acceptable}`,
    });
  } else {
    for (let i = 0; i < c.or_acceptable.length; i++) {
      const v = c.or_acceptable[i];
      if (!isValidClassValue(v)) {
        issues.push({
          case_id: id,
          field: `or_acceptable[${i}]`,
          problem: `must be one of {A,B,C,D,null(JSON)}; got ${classToString(v)}`,
        });
      }
    }
    if (
      "expected_cdsco_class" in c &&
      isValidClassValue(c.expected_cdsco_class) &&
      (c.or_acceptable as unknown[]).some((v) => v === c.expected_cdsco_class)
    ) {
      issues.push({
        case_id: id,
        field: "or_acceptable",
        problem: `must NOT include the expected_cdsco_class itself (${classToString(c.expected_cdsco_class)}); list only ALTERNATIVE acceptable classifications`,
      });
    }
  }

  // rationale
  if (c.rationale === undefined) {
    issues.push({ case_id: id, field: "rationale", problem: "missing" });
  } else if (typeof c.rationale !== "string" || c.rationale.trim().length === 0) {
    issues.push({
      case_id: id,
      field: "rationale",
      problem: "must be a non-empty string",
    });
  }

  // labeled_by
  if (c.labeled_by === undefined) {
    issues.push({ case_id: id, field: "labeled_by", problem: "missing" });
  } else if (typeof c.labeled_by !== "string" || c.labeled_by.trim().length === 0) {
    issues.push({
      case_id: id,
      field: "labeled_by",
      problem: "must be a non-empty string",
    });
  }

  // labeled_at
  if (c.labeled_at === undefined) {
    issues.push({ case_id: id, field: "labeled_at", problem: "missing" });
  } else if (typeof c.labeled_at !== "string" || !DATE_REGEX.test(c.labeled_at)) {
    issues.push({
      case_id: id,
      field: "labeled_at",
      problem: `must match YYYY-MM-DD; got ${JSON.stringify(c.labeled_at)}`,
    });
  }

  return issues;
}

function main(): number {
  const filePath = path.resolve(
    process.cwd(),
    process.argv[2] ?? DEFAULT_PATH
  );

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return 1;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error(`JSON parse failed: ${err instanceof Error ? err.message : err}`);
    return 1;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as { cases?: unknown }).cases)
  ) {
    console.error(`Expected an object with a "cases" array. Got: ${typeof parsed}`);
    return 1;
  }

  const cases = (parsed as { cases: CaseRow[] }).cases;
  console.log(`[validate-calibration-50] file: ${filePath}`);
  console.log(`[validate-calibration-50] cases found: ${cases.length}`);

  const fileIssues: Issue[] = [];
  if (cases.length !== EXPECTED_COUNT) {
    fileIssues.push({
      case_id: "(file)",
      field: "cases.length",
      problem: `expected exactly ${EXPECTED_COUNT} cases; got ${cases.length}`,
    });
  }

  const allIssues: Issue[] = [...fileIssues];
  for (let i = 0; i < cases.length; i++) {
    allIssues.push(...validateCase(cases[i], i));
  }

  if (allIssues.length === 0) {
    const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, null: 0 };
    let withAlts = 0;
    for (const c of cases) {
      const k = c.expected_cdsco_class === null ? "null" : (c.expected_cdsco_class as string);
      dist[k] = (dist[k] ?? 0) + 1;
      if (Array.isArray(c.or_acceptable) && c.or_acceptable.length > 0) withAlts++;
    }
    console.log(`✓ all ${cases.length} cases pass validation`);
    console.log(
      `  distribution: A=${dist.A}, B=${dist.B}, C=${dist.C}, D=${dist.D}, null=${dist.null}`
    );
    console.log(`  cases with at least one or_acceptable alternate: ${withAlts}/${cases.length}`);
    return 0;
  }

  console.error(`\n✗ ${allIssues.length} issue(s) across ${new Set(allIssues.map((i) => i.case_id)).size} case(s):\n`);
  for (const issue of allIssues) {
    console.error(`  ${issue.case_id}  ·  ${issue.field}  ·  ${issue.problem}`);
  }
  console.error(``);
  return 1;
}

process.exit(main());

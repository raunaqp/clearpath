"use client";

/**
 * Tier B wizard client (Sprint 2 Story 2.5 Phase 3).
 *
 * Single-page form: 6 core fields + up to 2 conditional. Save-on-blur
 * per field via POST /api/wizard/save-tier-b. On submit, runs a final
 * sync of any unsaved values (covers the "user accepted prefill without
 * touching the field" case), then navigates to /upgrade/{id} for payment.
 */

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RadioCard from "@/components/wizard/RadioCard";
import {
  TIER_B_QUESTIONS,
  type TierBField,
} from "@/lib/wizard/tier-b-questions";
import type {
  AuthenticationModel,
  CybersecurityPosture,
  EncryptionPosture,
  PredicateDevice,
  RiskMitigation,
  WizardAnswers,
} from "@/lib/wizard/types";

// Phase 3.8 FIX 2 — Tier B form parity with Tier A. Each question
// renders as a card with a field-code eyebrow + serif prompt; radio
// options use the same RadioCard component as the Tier A wizard.
// Single-page format preserved.
function fieldCode(field: TierBField): string {
  return field.slice(0, 2).toUpperCase();
}

type Props = {
  assessmentId: string;
  initialValues: WizardAnswers;
  c1Trigger: boolean;
  c2Trigger: boolean;
  paymentHref: string;
};

type FieldState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

// Phase 3.8 FIX 3 — no default cyber posture. C2 renders with nothing
// pre-selected so the user actively answers each sub-field. (Previously
// a "no/no/none" default was rendered visually but never persisted to
// state, leaving the submit button disabled even when the form looked
// complete.)

export function TierBWizardClient({
  assessmentId,
  initialValues,
  c1Trigger,
  c2Trigger,
  paymentHref,
}: Props) {
  const router = useRouter();
  const [values, setValues] = useState<WizardAnswers>(initialValues);
  const [fieldStates, setFieldStates] = useState<
    Record<string, FieldState>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setFieldState = (field: TierBField, state: FieldState) => {
    setFieldStates((prev) => ({ ...prev, [field]: state }));
  };

  const saveField = useCallback(
    async (field: TierBField, partial: Partial<WizardAnswers>) => {
      setFieldState(field, { kind: "saving" });
      try {
        const res = await fetch("/api/wizard/save-tier-b", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessment_id: assessmentId,
            answers: partial,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        setFieldState(field, { kind: "saved" });
      } catch (err) {
        setFieldState(field, {
          kind: "error",
          message: err instanceof Error ? err.message : "Save failed.",
        });
      }
    },
    [assessmentId]
  );

  // Required fields for the submit gate. C1/C2 only counted if triggered.
  const requiredOk = useMemo(() => {
    if (!values.b1_intended_use_statement?.trim()) return false;
    if (!values.b2_use_environment) return false;
    // Phase 3.5 Bug E — B3 satisfied if at least one predicate has a name
    // OR the "no predicate" override is checked.
    const predicatesOk =
      !!values.b3_no_predicate ||
      (Array.isArray(values.b3_predicate_devices) &&
        values.b3_predicate_devices.some((p) => p.device_name.trim().length > 0));
    if (!predicatesOk) return false;
    if (
      !values.b4_risks_and_mitigations ||
      values.b4_risks_and_mitigations.length === 0 ||
      values.b4_risks_and_mitigations.every((r) => !r.risk.trim())
    )
      return false;
    if (!values.b5_clinical_evidence_status) return false;
    if (!values.b6_iso_13485_status) return false;
    if (c1Trigger && !values.c1_software_lifecycle_model) return false;
    if (c2Trigger) {
      const c2 = values.c2_cybersecurity_posture;
      if (
        !c2 ||
        !c2.data_at_rest_encryption ||
        !c2.data_in_transit_encryption ||
        !c2.authentication_model
      ) {
        return false;
      }
    }
    return true;
  }, [values, c1Trigger, c2Trigger]);

  const handleSubmit = useCallback(async () => {
    if (!requiredOk || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    // Final sync of the whole Tier B state — covers prefilled values
    // the user accepted without editing (so they never blurred a field).
    try {
      const fullPayload: Partial<WizardAnswers> = {
        b1_intended_use_statement: values.b1_intended_use_statement,
        b2_use_environment: values.b2_use_environment,
        b3_predicate_devices: values.b3_no_predicate
          ? []
          : values.b3_predicate_devices?.filter(
              (p) => p.device_name.trim().length > 0
            ),
        b3_no_predicate: !!values.b3_no_predicate,
        b4_risks_and_mitigations: values.b4_risks_and_mitigations?.filter(
          (r) => r.risk.trim().length > 0
        ),
        b5_clinical_evidence_status: values.b5_clinical_evidence_status,
        b6_iso_13485_status: values.b6_iso_13485_status,
      };
      if (c1Trigger && values.c1_software_lifecycle_model) {
        fullPayload.c1_software_lifecycle_model =
          values.c1_software_lifecycle_model;
      }
      if (c2Trigger && values.c2_cybersecurity_posture) {
        fullPayload.c2_cybersecurity_posture = values.c2_cybersecurity_posture;
      }

      // Phase 3.5 Bug A — set the completion flag so the /upgrade/[id]
      // gate uses an explicit "submitted" signal instead of field presence.
      const res = await fetch("/api/wizard/save-tier-b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          answers: fullPayload,
          completed: true,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      router.push(paymentHref);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Couldn't save. Please try again."
      );
      setSubmitting(false);
    }
  }, [
    requiredOk,
    submitting,
    values,
    c1Trigger,
    c2Trigger,
    assessmentId,
    paymentHref,
    router,
  ]);

  return (
    <form
      className="space-y-5 sm:space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
    >
      {/* B1 — intended use */}
      <FieldShell
        question={TIER_B_QUESTIONS[0]}
        state={fieldStates["b1_intended_use_statement"]}
      >
        <textarea
          value={values.b1_intended_use_statement ?? ""}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              b1_intended_use_statement: e.target.value,
            }))
          }
          onBlur={() =>
            void saveField("b1_intended_use_statement", {
              b1_intended_use_statement: values.b1_intended_use_statement,
            })
          }
          rows={5}
          maxLength={2000}
          className="w-full rounded-xl border border-[#D9D5C8] bg-[#F7F6F2] px-4 py-3 text-[15px] text-[#0E1411] leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:ring-offset-1 focus-visible:ring-offset-white focus-visible:border-[#0F6E56]"
          placeholder="e.g., Continuous monitoring of glucose in adults with diabetes via a wearable subcutaneous patch."
        />
      </FieldShell>

      {/* B2 — use environment */}
      <FieldShell
        question={TIER_B_QUESTIONS[1]}
        state={fieldStates["b2_use_environment"]}
      >
        <RadioGroup
          options={TIER_B_QUESTIONS[1].options ?? []}
          value={values.b2_use_environment ?? ""}
          onChange={(value) => {
            setValues((v) => ({
              ...v,
              b2_use_environment: value as typeof v.b2_use_environment,
            }));
            void saveField("b2_use_environment", {
              b2_use_environment: value as typeof values.b2_use_environment,
            });
          }}
        />
      </FieldShell>

      {/* B3 — predicate devices (manual entry; "no predicate" override) */}
      <FieldShell
        question={TIER_B_QUESTIONS[2]}
        state={fieldStates["b3_predicate_devices"]}
      >
        <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!values.b3_no_predicate}
            onChange={(e) => {
              const next = e.target.checked;
              // When toggling on, clear any partial entries; when toggling
              // off, leave the previous entries so the user can resume.
              setValues((v) => ({
                ...v,
                b3_no_predicate: next,
                b3_predicate_devices: next ? [] : v.b3_predicate_devices,
              }));
              void saveField("b3_predicate_devices", {
                b3_no_predicate: next,
                b3_predicate_devices: next ? [] : values.b3_predicate_devices,
              });
            }}
            className="accent-[#0F6E56]"
          />
          <span className="text-[#0E1411]">
            I have no predicate device for this product
          </span>
        </label>
        {!values.b3_no_predicate && (
          <PredicateList
            value={values.b3_predicate_devices ?? []}
            onChange={(next) =>
              setValues((v) => ({ ...v, b3_predicate_devices: next }))
            }
            onBlur={(next) =>
              void saveField("b3_predicate_devices", {
                b3_predicate_devices: next,
              })
            }
          />
        )}
      </FieldShell>

      {/* B4 — risks + mitigations */}
      <FieldShell
        question={TIER_B_QUESTIONS[3]}
        state={fieldStates["b4_risks_and_mitigations"]}
      >
        <RiskMitigationList
          value={values.b4_risks_and_mitigations ?? []}
          onChange={(next) =>
            setValues((v) => ({ ...v, b4_risks_and_mitigations: next }))
          }
          onBlur={(next) =>
            void saveField("b4_risks_and_mitigations", {
              b4_risks_and_mitigations: next,
            })
          }
        />
      </FieldShell>

      {/* B5 — clinical evidence */}
      <FieldShell
        question={TIER_B_QUESTIONS[4]}
        state={fieldStates["b5_clinical_evidence_status"]}
      >
        <RadioGroup
          options={TIER_B_QUESTIONS[4].options ?? []}
          value={values.b5_clinical_evidence_status ?? ""}
          onChange={(value) => {
            setValues((v) => ({
              ...v,
              b5_clinical_evidence_status:
                value as typeof v.b5_clinical_evidence_status,
            }));
            void saveField("b5_clinical_evidence_status", {
              b5_clinical_evidence_status:
                value as typeof values.b5_clinical_evidence_status,
            });
          }}
        />
      </FieldShell>

      {/* B6 — ISO 13485 */}
      <FieldShell
        question={TIER_B_QUESTIONS[5]}
        state={fieldStates["b6_iso_13485_status"]}
      >
        <RadioGroup
          options={TIER_B_QUESTIONS[5].options ?? []}
          value={values.b6_iso_13485_status ?? ""}
          onChange={(value) => {
            setValues((v) => ({
              ...v,
              b6_iso_13485_status: value as typeof v.b6_iso_13485_status,
            }));
            void saveField("b6_iso_13485_status", {
              b6_iso_13485_status: value as typeof values.b6_iso_13485_status,
            });
          }}
        />
      </FieldShell>

      {/* C1 — software lifecycle (only if SaMD or AI/ML) */}
      {c1Trigger && (
        <FieldShell
          question={TIER_B_QUESTIONS[6]}
          state={fieldStates["c1_software_lifecycle_model"]}
        >
          <RadioGroup
            options={TIER_B_QUESTIONS[6].options ?? []}
            value={values.c1_software_lifecycle_model ?? ""}
            onChange={(value) => {
              setValues((v) => ({
                ...v,
                c1_software_lifecycle_model:
                  value as typeof v.c1_software_lifecycle_model,
              }));
              void saveField("c1_software_lifecycle_model", {
                c1_software_lifecycle_model:
                  value as typeof values.c1_software_lifecycle_model,
              });
            }}
          />
        </FieldShell>
      )}

      {/* C2 — cybersecurity (only if data sensitivity > none) */}
      {c2Trigger && (
        <FieldShell
          question={TIER_B_QUESTIONS[7]}
          state={fieldStates["c2_cybersecurity_posture"]}
        >
          <CybersecurityFields
            value={values.c2_cybersecurity_posture}
            onChange={(next) => {
              setValues((v) => ({ ...v, c2_cybersecurity_posture: next }));
            }}
            onBlur={(next) =>
              void saveField("c2_cybersecurity_posture", {
                c2_cybersecurity_posture: next,
              })
            }
          />
        </FieldShell>
      )}

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[#6B766F]">
          {requiredOk
            ? "All required fields complete. Ready to continue."
            : "Fill the required fields to continue."}
        </p>
        <button
          type="submit"
          disabled={!requiredOk || submitting}
          className="inline-flex items-center justify-center rounded-full bg-[#0F6E56] hover:bg-[#0d5c48] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-3 transition-colors"
        >
          {submitting ? "Saving…" : "Continue to payment →"}
        </button>
      </div>

      {submitError && (
        <p className="text-sm text-[#993C1D]" role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}

/* ─── shared field shell ─────────────────────────────────────────── */

// Phase 3.8 FIX 2 — restyled as a Tier-A-style card. Eyebrow shows the
// field code (B1, B2, ...); prompt rendered in the same serif/size family
// as Tier A question titles; subtle border + padding visually separates
// each question block on the single-page layout.
function FieldShell({
  question,
  state,
  children,
}: {
  question: (typeof TIER_B_QUESTIONS)[number];
  state: FieldState | undefined;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white border border-[#D9D5C8] p-5 sm:p-6 xl:p-7">
      <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-2">
        {fieldCode(question.field)}
      </p>
      <h2 className="font-serif text-xl sm:text-2xl text-[#0E1411] leading-snug mb-2">
        {question.required && (
          <span aria-hidden className="text-[#993C1D] mr-1">
            *
          </span>
        )}
        {question.prompt}
      </h2>
      {question.helper && (
        <p className="text-sm text-[#6B766F] italic leading-relaxed mb-5">
          {question.helper}
        </p>
      )}
      <div className="mt-1">{children}</div>
      <FieldStatus state={state} />
    </section>
  );
}

function FieldStatus({ state }: { state: FieldState | undefined }) {
  if (!state || state.kind === "idle") return null;
  if (state.kind === "saving") {
    return <p className="text-xs text-[#6B766F] mt-1">Saving…</p>;
  }
  if (state.kind === "saved") {
    return <p className="text-xs text-[#0F6E56] mt-1">Saved ✓</p>;
  }
  return (
    <p className="text-xs text-[#993C1D] mt-1" role="alert">
      Save failed: {state.message}
    </p>
  );
}

/* ─── radio groups ───────────────────────────────────────────────── */

// Top-level radio group — uses Tier A's RadioCard component so B2/B5/B6/C1
// feel consistent with the Risk Card wizard.
function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {options.map((opt) => (
        <RadioCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={value === opt.value}
          onSelect={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

// Compact variant for nested radio groups (the 3 sub-questions inside C2
// cybersecurity). Keeps that block tight rather than nesting 3 full
// RadioCard stacks inside the C2 FieldShell card.
function CompactRadioGroup({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex items-start gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
              selected
                ? "border-[#0F6E56] bg-[#E1F5EE]"
                : "border-[#D9D5C8] bg-white hover:border-[#0F6E56]"
            }`}
          >
            <input
              type="radio"
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 accent-[#0F6E56]"
            />
            <span className="text-sm font-medium text-[#0E1411]">
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ─── predicate picker (manual entry; LLM suggestions Phase 4b) ──── */

function PredicateList({
  value,
  onChange,
  onBlur,
}: {
  value: PredicateDevice[];
  onChange: (next: PredicateDevice[]) => void;
  onBlur: (next: PredicateDevice[]) => void;
}) {
  const rows = value.length === 0 ? [{ device_name: "" }] : value;

  const update = (idx: number, patch: Partial<PredicateDevice>) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  };

  const removeRow = (idx: number) => {
    const next = rows.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : [{ device_name: "" }]);
    onBlur(next.filter((r) => r.device_name.trim().length > 0));
  };

  const addRow = () => {
    if (rows.length >= 3) return;
    onChange([...rows, { device_name: "" }]);
  };

  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-[#D9D5C8] bg-[#F7F6F2] p-4 space-y-2"
        >
          <input
            type="text"
            placeholder="Device name (e.g., Dexcom G6)"
            value={row.device_name}
            onChange={(e) => update(idx, { device_name: e.target.value })}
            onBlur={() =>
              onBlur(rows.filter((r) => r.device_name.trim().length > 0))
            }
            maxLength={200}
            className="w-full text-sm rounded-lg border border-[#D9D5C8] bg-[#F7F6F2] px-3 py-2 text-[#0E1411] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:border-[#0F6E56]"
          />
          <input
            type="text"
            placeholder="Manufacturer (optional)"
            value={row.manufacturer ?? ""}
            onChange={(e) => update(idx, { manufacturer: e.target.value })}
            onBlur={() =>
              onBlur(rows.filter((r) => r.device_name.trim().length > 0))
            }
            maxLength={200}
            className="w-full text-sm rounded-lg border border-[#D9D5C8] bg-[#F7F6F2] px-3 py-2 text-[#0E1411] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:border-[#0F6E56]"
          />
          <textarea
            placeholder="Why this is a predicate (optional — e.g., same intended use, similar mechanism)"
            value={row.rationale ?? ""}
            onChange={(e) => update(idx, { rationale: e.target.value })}
            onBlur={() =>
              onBlur(rows.filter((r) => r.device_name.trim().length > 0))
            }
            maxLength={500}
            rows={2}
            className="w-full text-sm rounded-lg border border-[#D9D5C8] bg-[#F7F6F2] px-3 py-2 text-[#0E1411] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:border-[#0F6E56]"
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="text-xs text-[#6B766F] hover:text-[#993C1D] underline"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {rows.length < 3 && (
        <button
          type="button"
          onClick={addRow}
          className="text-xs text-[#0F6E56] hover:text-[#0d5c48] underline"
        >
          + Add another predicate
        </button>
      )}
    </div>
  );
}

/* ─── risk + mitigation pairs ────────────────────────────────────── */

// Phase 3.5 Bug C — B4 max raised from 3 to 5; rows render fully from
// the server-supplied prefill (no slice). Bug D — explicit Risk /
// Mitigation labels above each input. Bug C — × remove icon per row.
const B4_MAX_ROWS = 5;

function RiskMitigationList({
  value,
  onChange,
  onBlur,
}: {
  value: RiskMitigation[];
  onChange: (next: RiskMitigation[]) => void;
  onBlur: (next: RiskMitigation[]) => void;
}) {
  const rows = value.length === 0 ? [{ risk: "", mitigation: "" }] : value;

  const update = (idx: number, patch: Partial<RiskMitigation>) => {
    const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    const next = rows.filter((_, i) => i !== idx);
    onChange(next);
    onBlur(next.filter((r) => r.risk.trim().length > 0));
  };

  const addRow = () => {
    if (rows.length >= B4_MAX_ROWS) return;
    onChange([...rows, { risk: "", mitigation: "" }]);
  };

  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-[#D9D5C8] bg-[#F7F6F2] p-4 space-y-3 relative"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#6B766F]">
              Risk {idx + 1}
            </p>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(idx)}
                aria-label={`Remove risk ${idx + 1}`}
                className="text-[#6B766F] hover:text-[#993C1D] w-6 h-6 inline-flex items-center justify-center rounded transition-colors"
              >
                ×
              </button>
            )}
          </div>
          <div>
            <label
              htmlFor={`b4-risk-${idx}`}
              className="block text-xs text-[#6B766F] mb-1"
            >
              Risk:
            </label>
            <input
              id={`b4-risk-${idx}`}
              type="text"
              placeholder="e.g., ISO 13485 certification not yet achieved"
              value={row.risk}
              onChange={(e) => update(idx, { risk: e.target.value })}
              onBlur={() =>
                onBlur(rows.filter((r) => r.risk.trim().length > 0))
              }
              maxLength={300}
              className="w-full text-sm rounded-lg border border-[#D9D5C8] bg-[#F7F6F2] px-3 py-2 text-[#0E1411] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:border-[#0F6E56]"
            />
          </div>
          <div>
            <label
              htmlFor={`b4-mit-${idx}`}
              className="block text-xs text-[#6B766F] mb-1"
            >
              Mitigation:
            </label>
            <input
              id={`b4-mit-${idx}`}
              type="text"
              placeholder="e.g., Stage 1 audit scheduled Q3 2026 with BSI India"
              value={row.mitigation}
              onChange={(e) => update(idx, { mitigation: e.target.value })}
              onBlur={() =>
                onBlur(rows.filter((r) => r.risk.trim().length > 0))
              }
              maxLength={300}
              className="w-full text-sm rounded-lg border border-[#D9D5C8] bg-[#F7F6F2] px-3 py-2 text-[#0E1411] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6E56] focus-visible:border-[#0F6E56]"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        disabled={rows.length >= B4_MAX_ROWS}
        className="text-xs text-[#0F6E56] hover:text-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed underline"
      >
        + Add another risk{rows.length >= B4_MAX_ROWS ? " (max 5)" : ""}
      </button>
    </div>
  );
}

/* ─── cybersecurity (C2) ─────────────────────────────────────────── */

const ENCRYPTION_OPTIONS: Array<{ value: EncryptionPosture; label: string }> = [
  { value: "yes", label: "Yes" },
  { value: "partial", label: "Partial" },
  { value: "no", label: "No" },
];

const AUTH_OPTIONS: Array<{ value: AuthenticationModel; label: string }> = [
  { value: "none", label: "None" },
  { value: "local", label: "Local (username + password)" },
  { value: "federated", label: "Federated (SAML/OIDC)" },
  { value: "sso", label: "SSO via IdP" },
];

function CybersecurityFields({
  value,
  onChange,
  onBlur,
}: {
  value: CybersecurityPosture | undefined;
  onChange: (next: CybersecurityPosture) => void;
  onBlur: (next: CybersecurityPosture) => void;
}) {
  // Phase 3.8 FIX 3 — accept undefined and partial values. Each
  // sub-field renders with "" (nothing selected) when missing; user
  // must click to set. Submit gate requires all three.
  const update = <K extends keyof CybersecurityPosture>(
    key: K,
    next: CybersecurityPosture[K]
  ) => {
    const merged = { ...(value ?? {}), [key]: next } as CybersecurityPosture;
    onChange(merged);
    onBlur(merged);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-2">
          Data at rest encryption
        </p>
        <CompactRadioGroup
          options={ENCRYPTION_OPTIONS}
          value={value?.data_at_rest_encryption ?? ""}
          onChange={(v) =>
            update("data_at_rest_encryption", v as EncryptionPosture)
          }
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-2">
          Data in transit encryption
        </p>
        <CompactRadioGroup
          options={ENCRYPTION_OPTIONS}
          value={value?.data_in_transit_encryption ?? ""}
          onChange={(v) =>
            update("data_in_transit_encryption", v as EncryptionPosture)
          }
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-2">
          Authentication model
        </p>
        <CompactRadioGroup
          options={AUTH_OPTIONS}
          value={value?.authentication_model ?? ""}
          onChange={(v) =>
            update("authentication_model", v as AuthenticationModel)
          }
        />
      </div>
    </div>
  );
}

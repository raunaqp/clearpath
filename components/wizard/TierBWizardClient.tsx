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

const EMPTY_CYBER: CybersecurityPosture = {
  data_at_rest_encryption: "no",
  data_in_transit_encryption: "no",
  authentication_model: "none",
};

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
    if (
      !values.b3_predicate_devices ||
      values.b3_predicate_devices.length === 0 ||
      values.b3_predicate_devices.every((p) => !p.device_name.trim())
    )
      return false;
    if (
      !values.b4_risks_and_mitigations ||
      values.b4_risks_and_mitigations.length === 0 ||
      values.b4_risks_and_mitigations.every((r) => !r.risk.trim())
    )
      return false;
    if (!values.b5_clinical_evidence_status) return false;
    if (!values.b6_iso_13485_status) return false;
    if (c1Trigger && !values.c1_software_lifecycle_model) return false;
    if (c2Trigger && !values.c2_cybersecurity_posture) return false;
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
        b3_predicate_devices: values.b3_predicate_devices?.filter(
          (p) => p.device_name.trim().length > 0
        ),
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

      const res = await fetch("/api/wizard/save-tier-b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          answers: fullPayload,
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
      className="space-y-8"
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
          className="w-full rounded-md border border-[#D9D5C8] bg-white px-3 py-2 text-sm text-[#0E1411] focus:outline-none focus:border-[#0F6E56]"
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

      {/* B3 — predicate devices (manual entry, LLM suggestions Phase 4b) */}
      <FieldShell
        question={TIER_B_QUESTIONS[2]}
        state={fieldStates["b3_predicate_devices"]}
      >
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
            value={values.c2_cybersecurity_posture ?? EMPTY_CYBER}
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
    <div>
      <p className="font-serif text-lg text-[#0E1411] mb-1">
        {question.required && (
          <span aria-hidden className="text-[#993C1D] mr-1">
            *
          </span>
        )}
        {question.prompt}
      </p>
      {question.helper && (
        <p className="text-sm text-[#6B766F] italic mb-3">{question.helper}</p>
      )}
      {children}
      <FieldStatus state={state} />
    </div>
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

/* ─── radio group ────────────────────────────────────────────────── */

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
            <span className="text-sm">
              <span className="font-medium text-[#0E1411]">{opt.label}</span>
              {opt.description && (
                <span className="text-[#6B766F] block text-xs mt-0.5">
                  {opt.description}
                </span>
              )}
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
          className="rounded-md border border-[#D9D5C8] bg-white p-3 space-y-2"
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
            className="w-full text-sm rounded border border-[#D9D5C8] px-2 py-1.5 focus:outline-none focus:border-[#0F6E56]"
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
            className="w-full text-sm rounded border border-[#D9D5C8] px-2 py-1.5 focus:outline-none focus:border-[#0F6E56]"
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
            className="w-full text-sm rounded border border-[#D9D5C8] px-2 py-1.5 focus:outline-none focus:border-[#0F6E56]"
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
    const next = rows.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : [{ risk: "", mitigation: "" }]);
    onBlur(next.filter((r) => r.risk.trim().length > 0));
  };

  const addRow = () => {
    if (rows.length >= 3) return;
    onChange([...rows, { risk: "", mitigation: "" }]);
  };

  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="rounded-md border border-[#D9D5C8] bg-white p-3 space-y-2"
        >
          <input
            type="text"
            placeholder="Risk"
            value={row.risk}
            onChange={(e) => update(idx, { risk: e.target.value })}
            onBlur={() =>
              onBlur(rows.filter((r) => r.risk.trim().length > 0))
            }
            maxLength={300}
            className="w-full text-sm rounded border border-[#D9D5C8] px-2 py-1.5 focus:outline-none focus:border-[#0F6E56]"
          />
          <input
            type="text"
            placeholder="Mitigation"
            value={row.mitigation}
            onChange={(e) => update(idx, { mitigation: e.target.value })}
            onBlur={() =>
              onBlur(rows.filter((r) => r.risk.trim().length > 0))
            }
            maxLength={300}
            className="w-full text-sm rounded border border-[#D9D5C8] px-2 py-1.5 focus:outline-none focus:border-[#0F6E56]"
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
          + Add another risk
        </button>
      )}
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
  value: CybersecurityPosture;
  onChange: (next: CybersecurityPosture) => void;
  onBlur: (next: CybersecurityPosture) => void;
}) {
  const update = <K extends keyof CybersecurityPosture>(
    key: K,
    next: CybersecurityPosture[K]
  ) => {
    const merged = { ...value, [key]: next };
    onChange(merged);
    onBlur(merged);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-1">
          Data at rest encryption
        </p>
        <RadioGroup
          options={ENCRYPTION_OPTIONS}
          value={value.data_at_rest_encryption}
          onChange={(v) =>
            update("data_at_rest_encryption", v as EncryptionPosture)
          }
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-1">
          Data in transit encryption
        </p>
        <RadioGroup
          options={ENCRYPTION_OPTIONS}
          value={value.data_in_transit_encryption}
          onChange={(v) =>
            update("data_in_transit_encryption", v as EncryptionPosture)
          }
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[#6B766F] mb-1">
          Authentication model
        </p>
        <RadioGroup
          options={AUTH_OPTIONS}
          value={value.authentication_model}
          onChange={(v) =>
            update("authentication_model", v as AuthenticationModel)
          }
        />
      </div>
    </div>
  );
}

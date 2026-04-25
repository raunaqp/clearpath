"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import {
  CONTEXT_MAX_WORDS,
  countWords,
  JOURNEY_STAGE_LABELS,
  JOURNEY_STAGE_VALUES,
  runAllValidations,
  validateContext,
  validateEmail,
  validateJourneyStage,
  validateMobile,
  validateName,
  validateProductName,
  type ConciergeErrors,
  type JourneyStage,
} from "@/lib/concierge/validation";

export type ConciergeInitialValues = {
  name: string;
  email: string;
  mobile: string;
  product_name: string;
  journey_stage: string;
  context: string;
};

type FieldName =
  | "name"
  | "email"
  | "mobile"
  | "product_name"
  | "journey_stage"
  | "context";

export function ConciergeForm({
  initial,
  prefilled,
  sourceAssessmentId,
}: {
  initial: ConciergeInitialValues;
  prefilled: boolean;
  sourceAssessmentId: string | null;
}) {
  const router = useRouter();

  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [mobile, setMobile] = useState(initial.mobile);
  const [productName, setProductName] = useState(initial.product_name);
  const [journeyStage, setJourneyStage] = useState(initial.journey_stage);
  const [context, setContext] = useState(initial.context);

  const [errors, setErrors] = useState<ConciergeErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (prefilled && sourceAssessmentId) {
      try {
        posthog.capture("concierge_form_prefilled", {
          assessment_id: sourceAssessmentId,
        });
      } catch {}
    }
  }, [prefilled, sourceAssessmentId]);

  const clearError = useCallback((field: FieldName) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const runFieldValidation = useCallback(
    (field: FieldName, value: string): string | null => {
      switch (field) {
        case "name":
          return validateName(value);
        case "email":
          return validateEmail(value);
        case "mobile":
          return validateMobile(value);
        case "product_name":
          return validateProductName(value);
        case "journey_stage":
          return validateJourneyStage(value);
        case "context":
          return validateContext(value);
      }
    },
    []
  );

  const handleBlur = useCallback(
    (field: FieldName, value: string) => {
      const err = runFieldValidation(field, value);
      setErrors((prev) => {
        if (!err) {
          if (!prev[field]) return prev;
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: err };
      });
    },
    [runFieldValidation]
  );

  function scrollToFieldError(field: FieldName) {
    if (typeof document === "undefined") return;
    const el = document.getElementById(field);
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allErrors = runAllValidations({
      name,
      email,
      mobile,
      product_name: productName,
      journey_stage: journeyStage,
      context,
    });
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const order: FieldName[] = [
        "name",
        "email",
        "mobile",
        "product_name",
        "journey_stage",
        "context",
      ];
      const first = order.find((f) => f in allErrors);
      if (first) scrollToFieldError(first);
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      posthog.capture("concierge_form_submitted", {
        assessment_id: sourceAssessmentId ?? null,
        prefilled,
        journey_stage: journeyStage,
      });
    } catch {}

    let res: Response;
    try {
      res = await fetch("/api/concierge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile: mobile || undefined,
          product_name: productName,
          journey_stage: journeyStage,
          context,
          source_assessment_id: sourceAssessmentId ?? undefined,
          prefilled,
        }),
      });
    } catch {
      setSubmitError("Network error. Please try again.");
      setSubmitting(false);
      return;
    }

    let json: { error?: string } = {};
    try {
      json = await res.json();
    } catch {}

    if (!res.ok) {
      setSubmitError(json.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push(`/concierge/confirmation?email=${encodeURIComponent(email)}`);
  }

  const ctxWords = countWords(context);
  const ctxOverLimit = ctxWords > CONTEXT_MAX_WORDS;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {prefilled && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-[#EAF3EF] border border-[#0F6E56]/30">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F6E56] mb-1">
            Prefilled from your card
          </p>
          <p className="text-xs text-[#0E1411] leading-relaxed">
            We&apos;ve prefilled some fields from your earlier submission.
            Edit anything you&apos;d like to update.
          </p>
        </div>
      )}

      <div className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-6 md:p-8 space-y-6">
        <Field
          id="name"
          label="Your name"
          required
          value={name}
          onChange={(v) => {
            setName(v);
            clearError("name");
          }}
          onBlur={() => handleBlur("name", name)}
          error={errors.name}
          placeholder="Dr. Priya Sharma"
        />

        <Field
          id="email"
          label="Your email"
          required
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            clearError("email");
          }}
          onBlur={() => handleBlur("email", email)}
          error={errors.email}
          placeholder="founder@yourcompany.com"
        />

        <Field
          id="mobile"
          label="Mobile"
          optional
          type="tel"
          value={mobile}
          onChange={(v) => {
            setMobile(v);
            clearError("mobile");
          }}
          onBlur={() => handleBlur("mobile", mobile)}
          error={errors.mobile}
          placeholder="+91 98765 43210"
        />

        <Field
          id="product_name"
          label="Product name"
          required
          value={productName}
          onChange={(v) => {
            setProductName(v);
            clearError("product_name");
          }}
          onBlur={() => handleBlur("product_name", productName)}
          error={errors.product_name}
          helper="What product needs the review?"
          placeholder="Your product name"
        />

        {/* Journey stage radio group */}
        <fieldset id="journey_stage" data-field-error="journey_stage">
          <legend className="block text-sm font-medium text-[#0E1411] mb-1.5">
            Since when have you been on this regulatory journey?
            <span className="text-[#993C1D] ml-0.5">*</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {JOURNEY_STAGE_VALUES.map((value) => {
              const checked = journeyStage === value;
              return (
                <label
                  key={value}
                  htmlFor={`journey_stage_${value}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                    checked
                      ? "border-2 border-[#0F6E56] bg-[#EAF3EF]"
                      : "border border-[#D9D5C8] bg-white hover:bg-[#FAFAF7]"
                  }`}
                >
                  <input
                    id={`journey_stage_${value}`}
                    type="radio"
                    name="journey_stage"
                    value={value}
                    checked={checked}
                    onChange={() => {
                      setJourneyStage(value);
                      clearError("journey_stage");
                    }}
                    onBlur={() => handleBlur("journey_stage", value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`inline-flex w-4 h-4 rounded-full shrink-0 ${
                      checked
                        ? "bg-[#0F6E56] ring-4 ring-[#0F6E56]/20"
                        : "border border-[#D9D5C8] bg-white"
                    }`}
                  />
                  <span className="text-sm text-[#0E1411]">
                    {JOURNEY_STAGE_LABELS[value as JourneyStage]}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.journey_stage && (
            <p
              data-field-error="journey_stage"
              className="text-sm text-[#993C1D] mt-1.5 flex items-start gap-1"
            >
              <span aria-hidden>⚠</span>
              <span>{errors.journey_stage}</span>
            </p>
          )}
        </fieldset>

        {/* Challenges textarea */}
        <div>
          <label
            htmlFor="context"
            className="block text-sm font-medium text-[#0E1411] mb-1"
          >
            What challenges are you facing today?
            <span className="text-[#993C1D] ml-0.5">*</span>
          </label>
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-xs text-[#6B766F] leading-relaxed">
              Up to {CONTEXT_MAX_WORDS} words.
            </p>
            <p
              className={`text-xs shrink-0 tabular-nums ${
                ctxOverLimit
                  ? "text-[#993C1D]"
                  : ctxWords > CONTEXT_MAX_WORDS - 30
                  ? "text-[#BA7517]"
                  : "text-[#6B766F]"
              }`}
            >
              {ctxWords} / {CONTEXT_MAX_WORDS}
            </p>
          </div>
          <textarea
            id="context"
            rows={5}
            value={context}
            onChange={(e) => {
              setContext(e.target.value);
              clearError("context");
            }}
            onBlur={() => handleBlur("context", context)}
            placeholder="What's your current situation? Filing fresh, iterating on a deficiency letter, stuck on classification, etc."
            className={`w-full rounded-lg bg-white px-4 py-3 text-sm text-[#0E1411] placeholder:text-[#6B766F] focus:outline-none focus:ring-1 resize-none transition-colors ${
              errors.context
                ? "border-2 border-[#993C1D] focus:border-[#993C1D] focus:ring-[#993C1D]"
                : "border border-[#D9D5C8] focus:border-[#0F6E56] focus:ring-[#0F6E56]"
            }`}
          />
          {errors.context && (
            <p
              data-field-error="context"
              className="text-sm text-[#993C1D] mt-1.5 flex items-start gap-1"
            >
              <span aria-hidden>⚠</span>
              <span>{errors.context}</span>
            </p>
          )}
        </div>

        {submitError && (
          <p className="text-sm text-[#993C1D] bg-[#FAECE7] border border-[#f0c4b6] rounded-lg px-4 py-3">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0F6E56] text-white font-medium text-[15px] px-6 py-3.5 rounded-full hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Sending your request…
            </>
          ) : (
            "Request concierge review →"
          )}
        </button>

        <p className="text-xs text-[#6B766F] text-center leading-relaxed">
          Your details are used only to set up the concierge engagement.{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-[#0E1411]"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  optional,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  helper,
  error,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  helper?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#0E1411] mb-1.5"
      >
        {label}
        {required && <span className="text-[#993C1D] ml-0.5">*</span>}
        {optional && (
          <span className="text-[#6B766F] font-normal ml-1">(optional)</span>
        )}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-lg bg-white px-4 py-3 text-sm text-[#0E1411] placeholder:text-[#6B766F] focus:outline-none focus:ring-1 transition-colors ${
          error
            ? "border-2 border-[#993C1D] focus:border-[#993C1D] focus:ring-[#993C1D]"
            : "border border-[#D9D5C8] focus:border-[#0F6E56] focus:ring-[#0F6E56]"
        }`}
      />
      {error ? (
        <p
          data-field-error={id}
          className="text-sm text-[#993C1D] mt-1.5 flex items-start gap-1"
        >
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </p>
      ) : (
        helper && <p className="text-xs text-[#6B766F] mt-1.5">{helper}</p>
      )}
    </div>
  );
}

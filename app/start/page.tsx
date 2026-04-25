"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { countPdfPages, sha256Hex } from "@/lib/pdf-utils";
import {
  validateEmail,
  validateMobile,
  validateName,
  validateOneLiner,
  validateUrl,
  type IntakeErrors,
  ONE_LINER_MIN,
  ONE_LINER_MAX,
} from "@/lib/intake/validation";

const MAX_FILES = 3;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;   // 5 MB
const MAX_PAGES = 10;

type FieldName = "name" | "email" | "mobile" | "oneLiner" | "url";

type UploadedDoc = {
  id: string;
  filename: string;
  size_bytes: number;
  sha256: string;
  page_count: number;
  storage_path: string;
  status: "uploading" | "uploaded" | "failed";
  progress: number;
  error?: string;
};

function fmtSize(bytes: number) {
  const kb = bytes / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

function uploadWithProgress(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", "application/pdf");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

export default function StartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F6F2]" />}>
      <StartPageInner />
    </Suspense>
  );
}

function StartPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams?.get("resume") ?? null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [url, setUrl] = useState("");
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fileError, setFileError] = useState("");
  const [prefillLoading, setPrefillLoading] = useState<boolean>(!!resumeId);
  const [prefillError, setPrefillError] = useState("");

  // Per-field errors + whether the field has been blurred at least once.
  const [errors, setErrors] = useState<IntakeErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

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
        case "oneLiner":
          return validateOneLiner(value);
        case "url":
          return validateUrl(value);
      }
    },
    []
  );

  const handleBlur = useCallback(
    (field: FieldName, value: string) => {
      setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
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

  useEffect(() => {
    try {
      posthog.capture("intake_form_started", { resume: !!resumeId });
    } catch {}
  }, [resumeId]);

  // Prefill from existing assessment when ?resume={id} is present.
  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/assessment/${resumeId}`);
        if (!res.ok) {
          if (!cancelled) {
            setPrefillError(
              res.status === 404
                ? "We couldn't find that assessment to edit."
                : "Could not load your previous submission."
            );
            setPrefillLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setName(data.name ?? "");
        setEmail(data.email ?? "");
        setMobile(data.mobile ?? "");
        setOneLiner(data.one_liner ?? "");
        setUrl(data.url ?? "");
        if (Array.isArray(data.uploaded_docs)) {
          setDocs(
            (
              data.uploaded_docs as Array<{
                filename: string;
                storage_path: string;
                size_bytes: number;
                sha256: string;
              }>
            ).map((d) => ({
              id: d.sha256,
              filename: d.filename,
              size_bytes: d.size_bytes,
              sha256: d.sha256,
              page_count: 0,
              storage_path: d.storage_path,
              status: "uploaded" as const,
              progress: 100,
            }))
          );
        }
        setPrefillLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("prefill fetch failed:", err);
          setPrefillError("Could not load your previous submission.");
          setPrefillLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeId]);

  // Step-1 validity
  const step1Valid =
    validateName(name) === null &&
    validateEmail(email) === null &&
    validateMobile(mobile) === null;

  // Step-2 validity
  const oneLinerLen = oneLiner.length;
  const hasPendingUploads = docs.some((d) => d.status === "uploading");
  const hasFailedUploads = docs.some((d) => d.status === "failed");
  const step2Valid =
    validateOneLiner(oneLiner) === null &&
    validateUrl(url) === null &&
    !hasPendingUploads &&
    !hasFailedUploads;

  function scrollToFieldError(field: FieldName) {
    const domId = field === "oneLiner" ? "one_liner" : field;
    if (typeof document === "undefined") return;
    const el = document.getElementById(domId);
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function goToStep2() {
    // Validate step-1 fields explicitly so Next click without blur
    // still surfaces errors.
    const step1Errors: IntakeErrors = {};
    const nErr = validateName(name);
    if (nErr) step1Errors.name = nErr;
    const eErr = validateEmail(email);
    if (eErr) step1Errors.email = eErr;
    const mErr = validateMobile(mobile);
    if (mErr) step1Errors.mobile = mErr;

    if (Object.keys(step1Errors).length > 0) {
      setErrors((prev) => ({ ...prev, ...step1Errors }));
      setTouched((prev) => ({
        ...prev,
        name: true,
        email: true,
        mobile: true,
      }));
      const order: FieldName[] = ["name", "email", "mobile"];
      const first = order.find((f) => f in step1Errors);
      if (first) scrollToFieldError(first);
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep1() {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setFileError("");
      const list = Array.from(files);

      if (docs.length + list.length > MAX_FILES) {
        setFileError(`Max ${MAX_FILES} files. Remove one first.`);
        return;
      }

      for (const file of list) {
        if (file.type !== "application/pdf") {
          setFileError(`"${file.name}" isn't a PDF.`);
          continue;
        }
        if (file.size > MAX_SIZE_BYTES) {
          setFileError(`"${file.name}" is over 5 MB.`);
          continue;
        }

        let pageCount: number;
        try {
          pageCount = await countPdfPages(file);
        } catch {
          setFileError(`Couldn't read "${file.name}" — may be encrypted.`);
          continue;
        }
        if (pageCount > MAX_PAGES) {
          setFileError(
            `"${file.name}" has ${pageCount} pages — max ${MAX_PAGES}.`
          );
          continue;
        }

        const hash = await sha256Hex(file);
        const id = crypto.randomUUID();
        const entry: UploadedDoc = {
          id,
          filename: file.name,
          size_bytes: file.size,
          sha256: hash,
          page_count: pageCount,
          storage_path: "",
          status: "uploading",
          progress: 0,
        };
        setDocs((prev) => [...prev, entry]);

        try {
          const res = await fetch("/api/storage/signed-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filename: file.name,
              size_bytes: file.size,
            }),
          });
          if (!res.ok) throw new Error((await res.json()).error || "Signed URL failed");
          const { signedUrl, storage_path } = await res.json();

          await uploadWithProgress(signedUrl, file, (pct) => {
            setDocs((prev) =>
              prev.map((d) => (d.id === id ? { ...d, progress: pct } : d))
            );
          });

          setDocs((prev) =>
            prev.map((d) =>
              d.id === id
                ? { ...d, storage_path, status: "uploaded", progress: 100 }
                : d
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setDocs((prev) =>
            prev.map((d) =>
              d.id === id ? { ...d, status: "failed", error: msg } : d
            )
          );
        }
      }
    },
    [docs.length]
  );

  function removeDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setFileError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Explicit validation on submit — cover both step-1 and step-2 fields
    // so invalid step-1 data can't slip through via direct step state
    // manipulation.
    const allErrors: IntakeErrors = {};
    const nErr = validateName(name);
    if (nErr) allErrors.name = nErr;
    const eErr = validateEmail(email);
    if (eErr) allErrors.email = eErr;
    const mErr = validateMobile(mobile);
    if (mErr) allErrors.mobile = mErr;
    const oErr = validateOneLiner(oneLiner);
    if (oErr) allErrors.oneLiner = oErr;
    const uErr = validateUrl(url);
    if (uErr) allErrors.url = uErr;
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({
        name: true,
        email: true,
        mobile: true,
        oneLiner: true,
        url: true,
      });
      const order: FieldName[] = ["name", "email", "mobile", "oneLiner", "url"];
      const first = order.find((f) => f in allErrors);
      if (first) {
        // step-1 errors mean we bounce back to step-1 first.
        if (first === "name" || first === "email" || first === "mobile") {
          setStep(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        scrollToFieldError(first);
      }
      return;
    }
    if (!step2Valid) return;
    setSubmitError("");
    setSubmitting(true);

    const uploaded = docs.filter((d) => d.status === "uploaded");

    try {
      posthog.capture("intake_form_submitted", {
        has_url: !!url,
        docs_uploaded_count: uploaded.length,
        one_liner_length: oneLinerLen,
      });
    } catch {}

    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        mobile: mobile || undefined,
        one_liner: oneLiner,
        url: url || undefined,
        uploaded_docs: uploaded.map((d) => ({
          filename: d.filename,
          storage_path: d.storage_path,
          size_bytes: d.size_bytes,
          sha256: d.sha256,
        })),
        ...(resumeId ? { resume_id: resumeId } : {}),
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setSubmitError(json.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push(`/assess/${json.assessmentId}`);
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      <GlobalHeader />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-12">
        <div className="w-full max-w-3xl mx-auto">
          {resumeId && !prefillError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#EAF3EF] border border-[#0F6E56]/30">
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#0F6E56] mb-1">
                {prefillLoading ? "Loading your submission…" : "Editing your submission"}
              </p>
              {!prefillLoading && (
                <p className="text-xs text-[#0E1411] leading-relaxed">
                  We&apos;ve loaded your answers. Edit any field, then submit to re-run the analysis.
                </p>
              )}
            </div>
          )}
          {prefillError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#FAECE7] border border-[#f0c4b6]">
              <p className="text-sm text-[#993C1D]">{prefillError}</p>
            </div>
          )}

          {/* Step header */}
          <div className="flex items-center gap-2 mb-4">
            <StepDot filled active={step === 1} onClick={step === 2 ? goToStep1 : undefined} />
            <div className="flex-1 h-px bg-[#D9D5C8]" />
            <StepDot filled={step === 2} active={step === 2} />
          </div>
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#BA7517] mb-4">
            Step {step} of 2
          </p>

          {step === 1 && (
            <Step1
              name={name}
              setName={(v) => {
                setName(v);
                clearError("name");
              }}
              email={email}
              setEmail={(v) => {
                setEmail(v);
                clearError("email");
              }}
              mobile={mobile}
              setMobile={(v) => {
                setMobile(v);
                clearError("mobile");
              }}
              onBlur={handleBlur}
              errors={errors}
              canContinue={step1Valid}
              onContinue={goToStep2}
            />
          )}

          {step === 2 && (
            <Step2
              oneLiner={oneLiner}
              setOneLiner={(v) => {
                setOneLiner(v);
                clearError("oneLiner");
              }}
              oneLinerLen={oneLinerLen}
              url={url}
              setUrl={(v) => {
                setUrl(v);
                clearError("url");
              }}
              onBlur={handleBlur}
              errors={errors}
              docs={docs}
              dragOver={dragOver}
              setDragOver={setDragOver}
              handleFiles={handleFiles}
              removeDoc={removeDoc}
              fileInputRef={fileInputRef}
              fileError={fileError}
              submitting={submitting}
              submitError={submitError}
              onBack={goToStep1}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function StepDot({
  filled,
  active,
  onClick,
}: {
  filled: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const size = active ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
  const bg = filled ? "bg-[#0F6E56]" : "bg-[#D9D5C8]";
  const base = `rounded-full transition-all ${size} ${bg}`;
  return onClick ? (
    <button type="button" onClick={onClick} className={base + " cursor-pointer"} aria-label="Go to step 1" />
  ) : (
    <span className={base} />
  );
}

function Step1({
  name,
  setName,
  email,
  setEmail,
  mobile,
  setMobile,
  onBlur,
  errors,
  canContinue,
  onContinue,
}: {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  onBlur: (field: FieldName, value: string) => void;
  errors: IntakeErrors;
  canContinue: boolean;
  onContinue: () => void;
}) {
  return (
    <>
      <h1 className="font-serif font-normal text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-2">
        Tell us about yourself
      </h1>
      <p className="text-[#6B766F] text-base mb-8 leading-relaxed">
        We&apos;ll email your Readiness Card here. Takes 30 seconds.
      </p>

      <div className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-6 md:p-8 space-y-6">
        <Field
          id="name"
          label="Your name"
          required
          value={name}
          onChange={setName}
          onBlur={() => onBlur("name", name)}
          error={errors.name}
          placeholder="Dr. Priya Sharma"
        />
        <Field
          id="email"
          label="Your email"
          required
          type="email"
          value={email}
          onChange={setEmail}
          onBlur={() => onBlur("email", email)}
          error={errors.email}
          placeholder="founder@yourcompany.com"
          helper="We&rsquo;ll send your Readiness Card here. No spam."
        />
        <Field
          id="mobile"
          label="Mobile"
          optional
          type="tel"
          value={mobile}
          onChange={setMobile}
          onBlur={() => onBlur("mobile", mobile)}
          error={errors.mobile}
          placeholder="+91 98765 43210"
        />

        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-[#0F6E56] text-white font-medium text-[15px] px-6 py-3.5 rounded-full hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </button>

        <p className="text-xs text-[#6B766F] text-center leading-relaxed">
          Your data is used only to generate your Readiness Card. Stored
          encrypted, deleted after 90 days, never shared.{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[#0E1411]">
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}

function Step2({
  oneLiner,
  setOneLiner,
  oneLinerLen,
  url,
  setUrl,
  onBlur,
  errors,
  docs,
  dragOver,
  setDragOver,
  handleFiles,
  removeDoc,
  fileInputRef,
  fileError,
  submitting,
  submitError,
  onBack,
  onSubmit,
}: {
  oneLiner: string;
  setOneLiner: (v: string) => void;
  oneLinerLen: number;
  url: string;
  setUrl: (v: string) => void;
  onBlur: (field: FieldName, value: string) => void;
  errors: IntakeErrors;
  docs: UploadedDoc[];
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  handleFiles: (files: FileList | File[]) => Promise<void>;
  removeDoc: (id: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileError: string;
  submitting: boolean;
  submitError: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const atCap = docs.length >= MAX_FILES;

  return (
    <>
      <h1 className="font-serif font-normal text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-0.02em] text-[#0E1411] mb-2">
        Tell us about your product
      </h1>
      <p className="text-[#6B766F] text-base mb-8 leading-relaxed">
        We&apos;ll analyse it against 9 Indian regulations in about 5 minutes — free.
      </p>

      <form onSubmit={onSubmit} noValidate>
        <div className="bg-[#FDFCF8] border border-[#D9D5C8] rounded-xl p-6 md:p-8 space-y-6">

          {/* One-liner with helper + counter ABOVE the box */}
          <div>
            <label
              htmlFor="one_liner"
              className="block text-sm font-medium text-[#0E1411] mb-1"
            >
              What does your product do?
              <span className="text-[#993C1D] ml-0.5">*</span>
            </label>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="text-xs text-[#6B766F] leading-relaxed space-y-1">
                <p>One sentence. What the product does, for whom, using what approach.</p>
                <p className="italic text-[#8a918b]">
                  E.g. &ldquo;AI tool that flags early Alzheimer&apos;s from MRI scans for radiologists&rdquo;
                </p>
              </div>
              <p
                className={`text-xs shrink-0 tabular-nums ${
                  oneLinerLen > ONE_LINER_MAX - 20 ? "text-[#BA7517]" : "text-[#6B766F]"
                }`}
              >
                {oneLinerLen} / {ONE_LINER_MAX}
              </p>
            </div>
            <textarea
              id="one_liner"
              rows={3}
              maxLength={ONE_LINER_MAX}
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              onBlur={() => onBlur("oneLiner", oneLiner)}
              placeholder="Describe your product in one sentence…"
              className={`w-full rounded-lg bg-white px-4 py-3 text-sm text-[#0E1411] placeholder:text-[#6B766F] focus:outline-none focus:ring-1 resize-none transition-colors ${
                errors.oneLiner
                  ? "border-2 border-[#993C1D] focus:border-[#993C1D] focus:ring-[#993C1D]"
                  : "border border-[#D9D5C8] focus:border-[#0F6E56] focus:ring-[#0F6E56]"
              }`}
            />
            {errors.oneLiner && (
              <p
                data-field-error="oneLiner"
                className="text-sm text-[#993C1D] mt-1.5 flex items-start gap-1"
              >
                <span aria-hidden>⚠</span>
                <span>{errors.oneLiner}</span>
              </p>
            )}
          </div>

          {/* PDF upload */}
          <div>
            <label className="block text-sm font-medium text-[#0E1411] mb-1">
              Upload product docs{" "}
              <span className="text-[#6B766F] font-normal">(optional, recommended)</span>
            </label>
            <p className="text-xs text-[#6B766F] mb-2 leading-relaxed">
              Pitch decks · product briefs · tech specs · prior filings. Up to {MAX_FILES} files,
              5 MB each, {MAX_PAGES} pages each. PDF only.
            </p>

            <label
              htmlFor="pdf-input"
              onDragOver={(e) => {
                e.preventDefault();
                if (!atCap) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!atCap) handleFiles(e.dataTransfer.files);
              }}
              className={`block border border-dashed rounded-lg px-4 py-6 text-center cursor-pointer transition-colors ${
                atCap
                  ? "bg-gray-50 border-[#D9D5C8] cursor-not-allowed"
                  : dragOver
                  ? "bg-[#EAF3EF] border-[#0F6E56]"
                  : "bg-white border-[#D9D5C8] hover:border-[#0F6E56]"
              }`}
            >
              <input
                id="pdf-input"
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="sr-only"
                disabled={atCap}
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              />
              <p className="text-sm text-[#0E1411]">
                {atCap ? (
                  <span className="text-[#6B766F]">
                    You&apos;ve added {MAX_FILES} files. Remove one to add another.
                  </span>
                ) : docs.length === 0 ? (
                  <>
                    Drop PDFs here or{" "}
                    <span className="underline underline-offset-2 text-[#0F6E56]">
                      click to select
                    </span>
                  </>
                ) : (
                  <>
                    Add another —{" "}
                    <span className="underline underline-offset-2 text-[#0F6E56]">
                      click to select
                    </span>{" "}
                    <span className="text-[#6B766F]">
                      ({docs.length} of {MAX_FILES} added)
                    </span>
                  </>
                )}
              </p>
            </label>

            {fileError && (
              <p className="text-xs text-[#993C1D] mt-2">{fileError}</p>
            )}

            {/* File list */}
            {docs.length > 0 && (
              <ul className="mt-3 space-y-2">
                {docs.map((d) => (
                  <li
                    key={d.id}
                    className={`rounded-lg px-3 py-2 text-xs border ${
                      d.status === "uploaded"
                        ? "bg-[#EAF3EF] border-[#0F6E56]/40"
                        : d.status === "failed"
                        ? "bg-[#FAECE7] border-[#f0c4b6]"
                        : "bg-white border-[#D9D5C8]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 flex items-start gap-2">
                        {d.status === "uploaded" && (
                          <span
                            aria-hidden
                            className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#0F6E56] text-white text-[10px] leading-[16px] text-center font-bold"
                          >
                            ✓
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[#0E1411] truncate" title={d.filename}>
                            {d.filename}
                          </p>
                          <p className="text-[#6B766F]">
                            {fmtSize(d.size_bytes)} · {d.page_count}{" "}
                            {d.page_count === 1 ? "page" : "pages"}
                            {d.status === "uploading" && ` · ${Math.round(d.progress)}%`}
                            {d.status === "uploaded" && (
                              <span className="text-[#0F6E56]"> · uploaded</span>
                            )}
                            {d.status === "failed" && (
                              <span className="text-[#993C1D]"> · {d.error || "failed"}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDoc(d.id)}
                        className="text-[#6B766F] hover:text-[#993C1D] transition-colors px-1"
                        aria-label="Remove file"
                      >
                        Remove
                      </button>
                    </div>
                    {d.status === "uploading" && (
                      <div className="mt-1.5 h-1 bg-[#E8E4D6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0F6E56] transition-[width] duration-150"
                          style={{ width: `${d.progress}%` }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-[#0E1411] mb-1.5"
            >
              Product website{" "}
              <span className="text-[#6B766F] font-normal">(optional)</span>
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => onBlur("url", url)}
              placeholder="https://yourproduct.com"
              className={`w-full rounded-lg bg-white px-4 py-3 text-sm text-[#0E1411] placeholder:text-[#6B766F] focus:outline-none focus:ring-1 transition-colors ${
                errors.url
                  ? "border-2 border-[#993C1D] focus:border-[#993C1D] focus:ring-[#993C1D]"
                  : "border border-[#D9D5C8] focus:border-[#0F6E56] focus:ring-[#0F6E56]"
              }`}
            />
            {errors.url ? (
              <p
                data-field-error="url"
                className="text-sm text-[#993C1D] mt-1.5 flex items-start gap-1"
              >
                <span aria-hidden>⚠</span>
                <span>{errors.url}</span>
              </p>
            ) : (
              <p className="text-xs text-[#6B766F] mt-1.5">
                We&apos;ll read your site to cross-check your description — helps catch features you might have missed.
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-sm text-[#993C1D] bg-[#FAECE7] border border-[#f0c4b6] rounded-lg px-4 py-3">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-shrink-0 text-[#0E1411] font-medium text-[15px] px-5 py-3.5 rounded-full border border-[#D9D5C8] bg-white hover:bg-[#F7F6F2] transition-colors"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#0F6E56] text-white font-medium text-[15px] px-6 py-3.5 rounded-full hover:bg-[#0d5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving your submission…
                </>
              ) : (
                "Start analysis →"
              )}
            </button>
          </div>
        </div>
      </form>
    </>
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
      <label htmlFor={id} className="block text-sm font-medium text-[#0E1411] mb-1.5">
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

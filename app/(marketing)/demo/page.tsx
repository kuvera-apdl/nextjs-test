"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  ProgressSteps,
  Select,
  Slider,
  Spinner,
  Textarea,
} from "@/components/ui";
import {
  IconBank,
  IconCard,
  IconCheck,
  IconSend,
  IconTrendingUp,
} from "@/components/icons";
import { cn, fmtMoney } from "@/lib/utils";

const EMAIL_RE = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/;

const STEPS = ["Company", "Needs", "Contact"];

const TEAM_SIZES = [
  { value: "1–20", label: "1–20" },
  { value: "21–100", label: "21–100" },
  { value: "101–500", label: "101–500" },
  { value: "500+", label: "500+" },
];

const INDUSTRIES = [
  { value: "Logistics", label: "Logistics" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "SaaS", label: "SaaS" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Retail", label: "Retail" },
  { value: "Other", label: "Other" },
];

const PRODUCTS = [
  {
    name: "Payments",
    icon: IconSend,
    text: "Send and receive in 38 currencies with one API.",
  },
  {
    name: "Treasury",
    icon: IconBank,
    text: "Earn on idle cash with automated sweeps.",
  },
  {
    name: "Lending",
    icon: IconTrendingUp,
    text: "Working-capital lines that scale with revenue.",
  },
  {
    name: "Corporate Cards",
    icon: IconCard,
    text: "Smart limits, real-time controls, 1.5% back.",
  },
];

export default function DemoPage() {
  useEffect(() => {
    document.title = "Get a demo — Keelstone Financial";
  }, []);

  const [step, setStep] = useState(0);

  // Step 1
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyError, setCompanyError] = useState<string | null>(null);

  // Step 2
  const [selected, setSelected] = useState<string[]>([]);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [volume, setVolume] = useState(250000);
  const [notes, setNotes] = useState("");

  // Step 3
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactErrors, setContactErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const companyValid = company.trim().length > 0;

  const nextFromCompany = () => {
    if (!companyValid) {
      setCompanyError("Please enter your company name.");
      return;
    }
    setCompanyError(null);
    setStep(1);
  };

  const nextFromNeeds = () => {
    if (selected.length === 0) {
      setProductsError("Select at least one product to see.");
      return;
    }
    setProductsError(null);
    setStep(2);
  };

  const toggleProduct = (productName: string) => {
    setProductsError(null);
    setSelected((prev) =>
      prev.includes(productName)
        ? prev.filter((p) => p !== productName)
        : [...prev, productName]
    );
  };

  const submit = async () => {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = "Please enter your name.";
    if (!email.trim()) errs.email = "Please enter your work email.";
    else if (!EMAIL_RE.test(email.trim()))
      errs.email = "That doesn’t look like a valid email address.";
    setContactErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      const combinedNotes = [
        notes.trim(),
        `Monthly payment volume: ${fmtMoney(volume, "USD", { compact: true })}`,
        industry ? `Industry: ${industry}` : "",
        phone.trim() ? `Phone: ${phone.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          name: name.trim(),
          email: email.trim(),
          teamSize,
          products: selected,
          notes: combinedNotes,
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; reference?: string; error?: string }
        | null;
      if (res.ok && data?.reference) {
        setReference(data.reference);
      } else {
        setServerError(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("We couldn’t reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Get a demo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              See Keelstone on your numbers
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              Three quick questions, then we’ll tailor a walkthrough to your
              stack and volumes.
            </p>
          </div>

          <Card className="mt-10 p-6 sm:p-8">
            {reference ? (
              /* ----------------------------- Success ---------------------------- */
              <div className="flex flex-col items-center py-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <IconCheck className="h-8 w-8 text-emerald-600" />
                </span>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
                  Request received
                </h2>
                <p className="mt-3 rounded-xl bg-slate-100 px-4 py-2 font-mono text-lg font-semibold tracking-wide text-slate-900">
                  {reference}
                </p>
                <p className="mt-4 max-w-sm text-sm text-slate-600">
                  Keep that reference handy. Our team will email you within one
                  business day to schedule your session and set up sandbox
                  access.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button href="/">Back home</Button>
                  <Button href="/resources/blog" variant="secondary">
                    Read the blog meanwhile
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ProgressSteps steps={STEPS} current={step} />
                <div className="mt-8 border-t border-slate-100 pt-8">
                  {step === 0 && (
                    /* --------------------------- Step 1 --------------------------- */
                    <div className="space-y-5">
                      <Input
                        label="Company name"
                        placeholder="Atlas Freight"
                        value={company}
                        onChange={(e) => {
                          setCompany(e.target.value);
                          if (companyError) setCompanyError(null);
                        }}
                        error={companyError ?? undefined}
                      />
                      <Select
                        label="Team size"
                        placeholder="Select team size"
                        options={TEAM_SIZES}
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                      />
                      <Select
                        label="Industry"
                        placeholder="Select industry"
                        options={INDUSTRIES}
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                      />
                    </div>
                  )}

                  {step === 1 && (
                    /* --------------------------- Step 2 --------------------------- */
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          What do you want to see?
                        </p>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {PRODUCTS.map((product) => {
                            const isSelected = selected.includes(product.name);
                            return (
                              <button
                                key={product.name}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleProduct(product.name)}
                                className={cn(
                                  "relative cursor-pointer rounded-2xl border p-4 text-left transition-all",
                                  isSelected
                                    ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                )}
                              >
                                {isSelected && (
                                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                                    <IconCheck className="h-3 w-3" />
                                  </span>
                                )}
                                <product.icon
                                  className={cn(
                                    "h-5 w-5",
                                    isSelected ? "text-emerald-600" : "text-slate-400"
                                  )}
                                />
                                <span className="mt-3 block font-medium text-slate-900">
                                  {product.name}
                                </span>
                                <span className="mt-1 block text-xs text-slate-500">
                                  {product.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {productsError && (
                          <p className="mt-2 text-xs text-rose-600">{productsError}</p>
                        )}
                      </div>
                      <Slider
                        label="Monthly payment volume"
                        value={volume}
                        onChange={setVolume}
                        min={10000}
                        max={10000000}
                        step={10000}
                        format={(v) => fmtMoney(v, "USD", { compact: true })}
                      />
                      <Textarea
                        label="Anything specific? (optional)"
                        placeholder="Workflows, integrations, currencies, or anything else you’d like covered."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    /* --------------------------- Step 3 --------------------------- */
                    <div className="space-y-5">
                      <Input
                        label="Your name"
                        placeholder="Jordan Reyes"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (contactErrors.name)
                            setContactErrors((p) => ({ ...p, name: undefined }));
                        }}
                        error={contactErrors.name}
                      />
                      <Input
                        label="Work email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (contactErrors.email)
                            setContactErrors((p) => ({ ...p, email: undefined }));
                        }}
                        error={contactErrors.email}
                      />
                      <Input
                        label="Phone (optional)"
                        type="tel"
                        placeholder="+1 (555) 014-2030"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      {serverError && (
                        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                          {serverError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* ------------------------- Wizard controls ------------------------ */}
                <div className="mt-8 flex items-center justify-between">
                  {step > 0 ? (
                    <Button
                      variant="ghost"
                      onClick={() => setStep((s) => s - 1)}
                      disabled={submitting}
                    >
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  {step === 0 && (
                    <span
                      onClick={() => {
                        if (!companyValid)
                          setCompanyError("Please enter your company name.");
                      }}
                    >
                      <Button onClick={nextFromCompany} disabled={!companyValid}>
                        Next
                      </Button>
                    </span>
                  )}
                  {step === 1 && <Button onClick={nextFromNeeds}>Next</Button>}
                  {step === 2 && (
                    <Button onClick={submit} disabled={submitting}>
                      {submitting && (
                        <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                      )}
                      {submitting ? "Submitting…" : "Request demo"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>

          <p className="mt-6 text-center text-sm text-slate-500">
            30-minute call · sandbox access included · no commitment
          </p>
        </div>
      </div>
    </section>
  );
}

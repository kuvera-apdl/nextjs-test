"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Input,
  SectionHeading,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui";
import {
  IconArrowRight,
  IconCheck,
  IconClock,
  IconExternal,
  IconMapPin,
} from "@/components/icons";
import { fmtDateTime } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "partnerships", label: "Partnerships" },
  { value: "press", label: "Press" },
  { value: "careers", label: "Careers" },
  { value: "other", label: "Other" },
];

const OFFICES = [
  {
    city: "New York HQ",
    lines: ["1 Keelstone Plaza, Floor 22", "New York, NY 10004, United States"],
  },
  {
    city: "London",
    lines: ["14 Cheapside", "London EC2V 6DN, United Kingdom"],
  },
  {
    city: "Singapore",
    lines: ["8 Marina View, #21-04", "Singapore 018960"],
  },
];

type FieldErrors = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
};

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact — Keelstone Financial";
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string; receivedAt: string } | null>(
    null
  );

  const clearError = (key: keyof FieldErrors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your work email.";
    else if (!EMAIL_RE.test(email.trim()))
      next.email = "That doesn’t look like a valid email address.";
    if (!topic) next.topic = "Please choose a topic.";
    if (!message.trim()) next.message = "Please include a message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          topic,
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; id?: string; receivedAt?: string; error?: string }
        | null;
      if (res.ok && data?.id && data.receivedAt) {
        setSuccess({ id: data.id, receivedAt: data.receivedAt });
      } else {
        setServerError(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("We couldn’t reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setName("");
    setEmail("");
    setCompany("");
    setTopic("");
    setMessage("");
    setErrors({});
    setServerError(null);
    setSuccess(null);
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to our team"
          description="Questions about pricing, a payment that needs attention, or a partnership idea — we read everything and reply fast."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ------------------------------ Form ----------------------------- */}
          <Card className="lg:col-span-2">
            {success ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <IconCheck className="h-8 w-8 text-emerald-600" />
                </span>
                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
                  Message received
                </h2>
                <p className="mt-2 text-slate-600">
                  Reference{" "}
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-slate-900">
                    {success.id}
                  </span>{" "}
                  · received {fmtDateTime(success.receivedAt)}
                </p>
                <p className="mt-3 max-w-md text-sm text-slate-600">
                  We typically respond within one business day.
                  Payment-impacting issues are routed to the on-call team
                  immediately.
                </p>
                <Button variant="secondary" className="mt-8" onClick={reset}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label="Name"
                    placeholder="Jordan Reyes"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    error={errors.name}
                  />
                  <Input
                    label="Work email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    error={errors.email}
                  />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input
                    label="Company (optional)"
                    placeholder="Cobalt Labs"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  <Select
                    label="Topic"
                    placeholder="Choose a topic"
                    options={TOPICS}
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      clearError("topic");
                    }}
                    error={errors.topic}
                  />
                </div>
                <Textarea
                  label="Message"
                  placeholder="Tell us what you’re trying to do — the more detail, the faster we can help."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    clearError("message");
                  }}
                  error={errors.message}
                />
                {serverError && (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {serverError}
                  </p>
                )}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-slate-500">
                    We’ll only use your details to reply to this message.
                  </p>
                  <Button type="submit" disabled={submitting}>
                    {submitting && (
                      <Spinner className="h-4 w-4 border-white/40 border-t-white" />
                    )}
                    {submitting ? "Sending…" : "Send message"}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* --------------------------- Info column -------------------------- */}
          <div className="space-y-4">
            {OFFICES.map((office) => (
              <Card key={office.city} className="flex gap-3 p-5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <IconMapPin className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900">{office.city}</h3>
                  {office.lines.map((line) => (
                    <p key={line} className="mt-0.5 text-sm text-slate-600">
                      {line}
                    </p>
                  ))}
                </div>
              </Card>
            ))}

            <Card className="flex gap-3 p-5">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IconClock className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">Support hours</h3>
                <p className="mt-0.5 text-sm text-slate-600">
                  24/7 for payment-impacting issues.
                </p>
                <p className="mt-0.5 text-sm text-slate-600">
                  Mon–Fri 8:00–20:00 ET for everything else.
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900">Developers?</h3>
              <p className="mt-1 text-sm text-slate-600">
                API reference, SDKs, and sandbox keys live in the developer
                hub — no sales call required.
              </p>
              <div className="mt-4 flex flex-col items-start gap-2">
                <Button variant="secondary" size="sm" href="/developers">
                  Visit the developer hub
                  <IconExternal className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" href="/status">
                  Check system status first
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

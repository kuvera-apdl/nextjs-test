"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Input, Spinner, Toggle } from "@/components/ui";
import { IconAlert, IconArrowRight } from "@/components/icons";
import { Logo } from "@/components/nav";

const DEMO_EMAIL = "demo@meridian.example";
const DEMO_PASSWORD = "northstar";

const panelMetrics = [
  { value: "$2.4B", label: "Processed annually" },
  { value: "140+", label: "Currencies" },
  { value: "99.99%", label: "Platform uptime" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    document.title = "Sign in — Meridian Financial";
  }, []);

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push("/dashboard");
        return;
      }
      setError(data.error ?? "Sign in failed. Please try again.");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } catch {
      setError("Network error — check your connection and try again.");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 bg-white">
      <style>{`@keyframes mf-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>

      {/* Left: form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-12">
        <div
          className="mx-auto w-full max-w-sm"
          style={shake ? { animation: "mf-shake 0.4s ease-in-out" } : undefined}
        >
          <Logo />
          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">
            Sign in to Meridian
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome back. Enter your credentials to access your workspace.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "3.75rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <Toggle checked={remember} onChange={setRemember} label="Remember me" />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4 border-white/40! border-t-white!" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <Card className="mt-8 bg-slate-50! p-4! shadow-none!">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Demo credentials
                </p>
                <p className="mt-1.5 font-mono text-xs text-slate-700">
                  {DEMO_EMAIL}
                </p>
                <p className="font-mono text-xs text-slate-700">{DEMO_PASSWORD}</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={fillDemo}>
                Fill
              </Button>
            </div>
          </Card>

          <p className="mt-8 text-center text-sm text-slate-600">
            No account?{" "}
            <Link
              href="/demo"
              className="inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-600"
            >
              Get a demo
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Meridian Financial
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            The financial backbone for ambitious operators.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Treasury, global payments, invoicing, and spend — unified in one
            console. Your team’s money moves at the speed of your roadmap.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {panelMetrics.map((m) => (
              <div key={m.label}>
                <dt className="order-last mt-1 text-xs text-slate-400">{m.label}</dt>
                <dd className="text-xl font-semibold tracking-tight tabular-nums">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Mock corporate card (CSS only) */}
          <div className="mt-12 w-80 -rotate-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">
                Meridian Treasury
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600">
                <span className="block h-3 w-3 rounded-full border-2 border-white" />
              </span>
            </div>
            <div className="mt-7 h-7 w-10 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-90" />
            <p className="mt-3 font-mono text-lg tracking-widest text-slate-200">
              •••• •••• •••• 4421
            </p>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
              <span>Halcyon Robotics</span>
              <span className="tabular-nums">12/29</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

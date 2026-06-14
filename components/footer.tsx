"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/nav";

const columns: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Products",
    links: [
      { href: "/solutions/payments", label: "Global Payments" },
      { href: "/solutions/treasury", label: "Treasury" },
      { href: "/solutions/lending", label: "Lending" },
      { href: "/solutions/corporate-cards", label: "Corporate Cards" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources/blog", label: "Blog" },
      { href: "/resources/faqs", label: "Help & FAQ" },
      { href: "/developers", label: "Developers" },
      { href: "/tools/fx-converter", label: "FX Converter" },
      { href: "/status", label: "System Status" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
      { href: "/demo", label: "Get a demo" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

const legalLinks = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/cookies", label: "Cookie Policy" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/legal", label: "Legal Center" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              The financial operations platform for modern business — payments,
              treasury, lending, and corporate cards in one place.
            </p>
            <form onSubmit={subscribe} className="mt-6 max-w-sm">
              <label
                htmlFor="footer-email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Product updates, monthly
              </label>
              {state === "done" ? (
                <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
                  You&rsquo;re on the list. Watch your inbox.
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="footer-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="work@company.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-2 focus:outline-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={state === "busy"}
                    className="shrink-0 cursor-pointer rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {state === "busy" ? "…" : "Subscribe"}
                  </button>
                </div>
              )}
              {state === "error" && (
                <p className="mt-2 text-xs text-rose-400">
                  That didn&rsquo;t work — check the address and try again.
                </p>
              )}
            </form>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-slate-800 pt-8">
          <nav
            aria-label="Legal"
            className="mb-6 flex flex-wrap gap-x-6 gap-y-2"
          >
            {legalLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              © 2026 Meridian Financial, Inc. All rights reserved.
            </p>
            <div className="flex gap-5 text-xs text-slate-500">
              <span>SOC 2 Type II</span>
              <span>PCI DSS Level 1</span>
              <span>ISO 27001</span>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-600">
            Meridian Financial is a fictional company. This website is a demo
            application — nothing on it is a real financial product, offer, or
            claim. All customers, people, and figures are invented.
          </p>
        </div>
      </div>
    </footer>
  );
}

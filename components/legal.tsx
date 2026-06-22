"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconDownload,
} from "@/components/icons";

export type LegalSection = {
  id: string;
  heading: string;
  body: ReactNode;
};

export const LEGAL_DOCS = [
  { slug: "privacy", href: "/legal/privacy", label: "Privacy Policy" },
  { slug: "terms", href: "/legal/terms", label: "Terms of Service" },
  { slug: "cookies", href: "/legal/cookies", label: "Cookie Policy" },
  { slug: "disclaimer", href: "/legal/disclaimer", label: "Disclaimer" },
];

export const LEGAL_UPDATED = "June 14, 2026";

export function DemoNotice() {
  return (
    <div className="flex gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 p-5">
      <IconAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <p className="text-sm leading-relaxed text-amber-900">
        <span className="font-semibold">Demonstration notice. </span>
        Keelstone Financial is a fictional company, and this website is a demo and
        integration-testing application. The text below is illustrative sample
        content — it is not legal advice and does not govern any real product or
        service. Please do not enter real personal, financial, or confidential
        information anywhere on this site.
      </p>
    </div>
  );
}

export function LegalPage({
  slug,
  title,
  intro,
  keyPoints,
  sections,
}: {
  slug: string;
  title: string;
  intro: string;
  keyPoints?: string[];
  sections: LegalSection[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    document.title = `${title} — Keelstone Financial`;
  }, [title]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id);
            break;
          }
        }
      },
      { rootMargin: "-15% 0px -75% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  function goto(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
    }
  }

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/legal" className="hover:text-slate-900">
              Legal
            </Link>
            <span aria-hidden>/</span>
            <span className="text-slate-700">{title}</span>
          </nav>
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Legal
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">{intro}</p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
            Last updated {LEGAL_UPDATED}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10">
          <DemoNotice />
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                On this page
              </p>
              <ul className="mt-3 space-y-1 border-l border-slate-200">
                {sections.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => goto(s.id)}
                      className={cn(
                        "-ml-px block w-full cursor-pointer border-l-2 py-1 pl-3 text-left text-sm transition-colors",
                        active === s.id
                          ? "border-emerald-600 font-medium text-emerald-700"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      )}
                    >
                      {s.heading}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => window.print()}
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <IconDownload className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          </aside>

          <div className="min-w-0">
            {keyPoints && keyPoints.length > 0 && (
              <div className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold text-slate-900">
                  In plain terms
                </p>
                <ul className="mt-3 space-y-2">
                  {keyPoints.map((k) => (
                    <li key={k} className="flex gap-2 text-sm text-slate-600">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-28">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                    <span className="mr-2 text-slate-300">{i + 1}.</span>
                    {s.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 [&_a:hover]:underline [&_a]:font-medium [&_a]:text-emerald-700 [&_li]:flex [&_li]:gap-2 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:space-y-2">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 border-t border-slate-200 pt-8">
              <p className="text-sm font-semibold text-slate-900">
                More legal documents
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {LEGAL_DOCS.filter((l) => l.slug !== slug).map((l) => (
                  <Link
                    key={l.slug}
                    href={l.href}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
                  >
                    {l.label}
                    <IconArrowRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Questions about this document?
              </p>
              <p className="mt-1 text-sm text-slate-600">
                In a real deployment you would reach a privacy or legal team. In
                this demo, the contact form simply records your message in memory.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
                >
                  Contact us
                </Link>
                <Link
                  href="/legal"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  All policies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

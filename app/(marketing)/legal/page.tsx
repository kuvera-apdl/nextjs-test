"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LEGAL_UPDATED } from "@/components/legal";
import {
  IconAlert,
  IconArrowRight,
  IconFile,
  IconLayers,
  IconLock,
  IconServer,
  IconShield,
} from "@/components/icons";

const docs = [
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    desc: "What information the demo collects, how it is used, and the rights you would have in a real deployment.",
    icon: IconLock,
  },
  {
    href: "/legal/terms",
    title: "Terms of Service",
    desc: "The terms that govern use of this demonstration application, including acceptable use and disclaimers.",
    icon: IconFile,
  },
  {
    href: "/legal/cookies",
    title: "Cookie Policy",
    desc: "The single session cookie this app sets, why it exists, and how to control cookies in your browser.",
    icon: IconLayers,
  },
  {
    href: "/legal/disclaimer",
    title: "Disclaimer",
    desc: "Why everything here is fictional: no real company, no real money movement, and no financial advice.",
    icon: IconAlert,
  },
];

const handling = [
  {
    icon: IconServer,
    title: "Stored in memory only",
    body: "Anything you submit through a form or any session you create lives in volatile server memory. Nothing is written to a database.",
  },
  {
    icon: IconShield,
    title: "Discarded on restart",
    body: "All demo data is permanently erased whenever the server restarts. It is never backed up, exported, or sold.",
  },
  {
    icon: IconAlert,
    title: "Safe to script against",
    body: "Because there is no real data and no real transactions, this app is intended to be used as a fixture for development and integration testing.",
  },
];

export default function LegalIndexPage() {
  useEffect(() => {
    document.title = "Legal Center — Meridian Financial";
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Legal
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Legal Center
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            The policies and notices for the Meridian Financial demo. Everything
            here is sample text for a fictional company — published mainly to make
            it unmistakable that this is a safe, synthetic environment.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
            All documents last updated {LEGAL_UPDATED}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {docs.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <d.icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                {d.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {d.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                Read document
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            How this demo handles your data
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            The short version, so you do not have to read every policy to know
            whether it is safe to use this site.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {handling.map((h) => (
              <div key={h.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
                  <h.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {h.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {h.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

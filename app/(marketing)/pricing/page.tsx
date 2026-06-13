"use client";

import { Fragment, useEffect, useState } from "react";
import {
  AccordionItem,
  Badge,
  Button,
  Card,
  SectionHeading,
  Slider,
  Toggle,
} from "@/components/ui";
import { cn, fmtMoney } from "@/lib/utils";
import { IconArrowRight, IconCheck, IconChevronDown } from "@/components/icons";

/* ------------------------------- Plans ------------------------------ */

type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthly: number | null;
  rate: number | null;
  rateLabel: string;
  popular?: boolean;
  inherits?: string;
  features: string[];
  cta: { label: string; href: string };
};

const plans: Plan[] = [
  {
    id: "growth",
    name: "Growth",
    tagline: "For teams getting their first global flows live.",
    monthly: 0,
    rate: 0.0025,
    rateLabel: "0.25% per payment",
    features: [
      "Up to 5 connected bank accounts",
      "Payments in 40+ currencies",
      "FX at mid-market +0.40%",
      "5 corporate cards with 1% cash back",
      "Single-step payment approvals",
      "Email support",
    ],
    cta: { label: "Start with a demo", href: "/demo" },
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "For finance teams running real volume every week.",
    monthly: 499,
    rate: 0.0015,
    rateLabel: "0.15% per payment",
    popular: true,
    inherits: "Everything in Growth, plus",
    features: [
      "Up to 25 accounts across 3 entities",
      "FX at mid-market +0.20%",
      "Batch payments and multi-step approvals",
      "100 cards with budgets and 1.5% cash back",
      "Cash forecasting and 4.1% yield on idle cash",
      "Priority support with a 4-hour response",
    ],
    cta: { label: "Get a demo", href: "/demo" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For global, multi-entity organizations.",
    monthly: null,
    rate: null,
    rateLabel: "Custom rates",
    inherits: "Everything in Scale, plus",
    features: [
      "Unlimited accounts and entities",
      "Custom FX routing and negotiated rates",
      "Credit lines up to $20M",
      "Unlimited cards with custom controls",
      "Dedicated finance operations manager",
      "99.99% uptime SLA, SSO, and audit exports",
    ],
    cta: { label: "Talk to sales", href: "/contact" },
  },
];

/* -------------------------- Comparison table ------------------------ */

type CellValue = string | boolean;

const comparisonGroups: {
  name: string;
  rows: { feature: string; values: [CellValue, CellValue, CellValue] }[];
}[] = [
  {
    name: "Payments",
    rows: [
      { feature: "Domestic transfers", values: [true, true, true] },
      { feature: "International payments", values: ["40+ currencies", "40+ currencies", "40+ currencies"] },
      { feature: "FX margin over mid-market", values: ["0.40%", "0.20%", "Custom"] },
      { feature: "Batch payments", values: [false, true, true] },
      { feature: "Approval workflows", values: ["Single-step", "Multi-step", "Custom"] },
      { feature: "Payments API access", values: [true, true, true] },
    ],
  },
  {
    name: "Treasury",
    rows: [
      { feature: "Connected bank accounts", values: ["Up to 5", "Up to 25", "Unlimited"] },
      { feature: "Legal entities", values: ["1", "3", "Unlimited"] },
      { feature: "Cash forecasting", values: [false, true, true] },
      { feature: "Yield on idle cash", values: [false, "4.1% APY", "4.3% APY"] },
      { feature: "Auto-sweep rules", values: [false, true, true] },
    ],
  },
  {
    name: "Cards",
    rows: [
      { feature: "Corporate cards", values: ["5", "100", "Unlimited"] },
      { feature: "Cash back on spend", values: ["1.0%", "1.5%", "Custom"] },
      { feature: "Budgets with auto-lock", values: [false, true, true] },
      { feature: "Virtual cards", values: [true, true, true] },
      { feature: "Receipt capture and auto-coding", values: [true, true, true] },
    ],
  },
  {
    name: "Support",
    rows: [
      { feature: "Email support", values: [true, true, true] },
      { feature: "Priority response (4 hours)", values: [false, true, true] },
      { feature: "Dedicated finance ops manager", values: [false, false, true] },
      { feature: "Onboarding", values: ["Self-serve", "Guided", "White-glove"] },
      { feature: "Uptime SLA", values: [false, false, "99.99%"] },
    ],
  },
];

function CellContent({ value }: { value: CellValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <IconCheck className="mx-auto h-4 w-4 text-emerald-600" />
    ) : (
      <span className="text-slate-300">—</span>
    );
  }
  return <span className="text-sm text-slate-700">{value}</span>;
}

/* -------------------------------- Page ------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [volume, setVolume] = useState(250000);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Payments: true,
    Treasury: true,
    Cards: true,
    Support: true,
  });

  useEffect(() => {
    document.title = "Pricing — Meridian Financial";
  }, []);

  const platformFee = (p: Plan) => {
    if (p.monthly === null) return null;
    return p.monthly;
  };

  return (
    <>
      {/* --------------------------- Header + plans --------------------------- */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Pay for what moves, not for seats"
            description="A flat platform fee plus a small per-payment rate that shrinks as your volume grows. No seat licenses, no implementation invoices, no surprises in March."
            align="center"
          />

          {/* Billing toggle */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <span className={cn("text-sm", annual ? "text-slate-500" : "font-semibold text-slate-900")}>
                Monthly
              </span>
              <Toggle checked={annual} onChange={setAnnual} />
              <span className={cn("text-sm", annual ? "font-semibold text-slate-900" : "text-slate-500")}>
                Annual
              </span>
              <Badge tone="emerald">–20%</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Annual billing takes 20% off platform fees. Payment fees are always billed on actual volume.
            </p>
          </div>

          {/* Volume slider */}
          <Card className="mx-auto mt-8 w-full max-w-xl">
            <p className="text-sm font-semibold text-slate-900">Estimate your payment fees</p>
            <p className="mt-1 text-sm text-slate-500">
              Drag to your monthly outbound volume and each plan below updates its estimate.
            </p>
            <div className="mt-5">
              <Slider
                label="Monthly payment volume"
                value={volume}
                onChange={setVolume}
                min={50000}
                max={5000000}
                step={50000}
                format={(v) => fmtMoney(v, "USD", { compact: true })}
              />
            </div>
          </Card>

          {/* Plan cards */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {plans.map((p) => {
              const fee = platformFee(p);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm sm:p-8",
                    p.popular ? "border-transparent ring-2 ring-emerald-600" : "border-slate-200"
                  )}
                >
                  {p.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{p.tagline}</p>

                  <div className="mt-6 flex items-baseline gap-2">
                    {fee === null ? (
                      <span className="text-4xl font-semibold tracking-tight text-slate-900">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-semibold tracking-tight text-slate-900">${fee}</span>
                        <span className="text-sm text-slate-500">/mo platform fee</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 h-5 text-xs text-slate-500">
                    {fee === null
                      ? "Annual agreements with negotiated terms"
                      : annual && p.monthly !== null && p.monthly > 0
                        ? (
                            <>
                              <span className="line-through">${p.monthly}/mo</span> billed annually
                            </>
                          )
                        : "billed monthly, cancel anytime"}
                  </p>

                  <div
                    className={cn(
                      "mt-5 rounded-xl px-4 py-3 text-sm",
                      p.popular ? "bg-emerald-50 text-emerald-900" : "bg-slate-50 text-slate-700"
                    )}
                  >
                    {p.rate !== null ? (
                      <>
                        <span className="font-semibold tabular-nums">
                          ~{fmtMoney(volume * p.rate, "USD", { compact: true })}/mo
                        </span>{" "}
                        estimated payment fees
                        <span className="mt-0.5 block text-xs opacity-70">
                          at {fmtMoney(volume, "USD", { compact: true })} volume · {p.rateLabel}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">Volume-based payment rates</span>
                        <span className="mt-0.5 block text-xs opacity-70">
                          modeled with you at {fmtMoney(volume, "USD", { compact: true })}+ volume
                        </span>
                      </>
                    )}
                  </div>

                  <Button
                    href={p.cta.href}
                    variant={p.popular ? "primary" : "secondary"}
                    className="mt-6 w-full"
                  >
                    {p.cta.label}
                  </Button>

                  <div className="mt-7 border-t border-slate-100 pt-6">
                    {p.inherits && (
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {p.inherits}
                      </p>
                    )}
                    <ul className="space-y-3">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                            <IconCheck className="h-3.5 w-3.5 text-emerald-700" />
                          </span>
                          <span className="text-sm text-slate-600">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------- Comparison table --------------------------- */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Compare"
            title="Every plan, side by side"
            description="Click a group header to collapse it and focus on what matters to your team."
            align="center"
          />
          <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse bg-white">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-[40%] px-4 py-4 text-left text-sm font-semibold text-slate-900 sm:px-6">
                      Features
                    </th>
                    <th className="w-[20%] px-4 py-4 text-center text-sm font-semibold text-slate-900">
                      Growth
                    </th>
                    <th className="w-[20%] px-4 py-4 text-center text-sm font-semibold text-emerald-700">
                      Scale
                    </th>
                    <th className="w-[20%] px-4 py-4 text-center text-sm font-semibold text-slate-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonGroups.map((g) => {
                    const open = openGroups[g.name];
                    return (
                      <Fragment key={g.name}>
                        <tr className="border-t border-slate-200 bg-slate-50/80">
                          <td colSpan={4} className="p-0">
                            <button
                              onClick={() =>
                                setOpenGroups((prev) => ({ ...prev, [g.name]: !prev[g.name] }))
                              }
                              aria-expanded={open}
                              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left sm:px-6"
                            >
                              <span className="text-sm font-semibold text-slate-900">{g.name}</span>
                              <IconChevronDown
                                className={cn(
                                  "h-4 w-4 text-slate-400 transition-transform",
                                  open && "rotate-180"
                                )}
                              />
                            </button>
                          </td>
                        </tr>
                        {open &&
                          g.rows.map((row) => (
                            <tr key={row.feature} className="border-t border-slate-100">
                              <td className="px-4 py-3 text-sm text-slate-600 sm:px-6">{row.feature}</td>
                              {row.values.map((v, i) => (
                                <td key={i} className="px-4 py-3 text-center">
                                  <CellContent value={v} />
                                </td>
                              ))}
                            </tr>
                          ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">
            All plans include the payments API, audit logs, and unlimited users at no extra cost.
          </p>
        </div>
      </section>

      {/* --------------------------------- FAQ --------------------------------- */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Pricing questions, answered"
            align="center"
          />
          <div className="mx-auto mt-10 max-w-3xl">
            <AccordionItem title="What counts as monthly payment volume?" defaultOpen>
              Volume is the total value of outbound payments you send through Meridian in a
              calendar month — wires, local rails, and FX conversions each count once. Incoming
              funds and transfers between your own Meridian balances are free and never count
              toward volume.
            </AccordionItem>
            <AccordionItem title="How does the annual discount work?">
              Annual billing takes 20% off the platform fee, paid up front for the year. Per-payment
              fees are always billed monthly on the volume you actually moved, so a quiet month
              costs you less — there is no minimum commitment on volume.
            </AccordionItem>
            <AccordionItem title="Can I change plans mid-cycle?">
              Yes. Upgrades take effect immediately and we prorate the difference to the day.
              Downgrades apply at your next renewal so you never lose features mid-month. Growth
              has no contract at all — you can leave whenever you like and export everything.
            </AccordionItem>
            <AccordionItem title="Are there hidden FX or transfer fees?">
              No. FX is priced at the mid-market rate plus the margin shown on your plan, locked
              before you confirm any transfer. Where a correspondent bank charges a fee on an
              international wire, we show it before you hit send — never after.
            </AccordionItem>
          </div>
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-600">
              Moving more than {fmtMoney(5000000, "USD", { compact: true })} a month, or something
              unusual on your books?
            </p>
            <Button href="/contact" variant="secondary" className="mt-4">
              Talk to sales
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

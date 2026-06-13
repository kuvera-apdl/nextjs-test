"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Badge,
  Stat,
  SectionHeading,
  Slider,
  Tabs,
} from "@/components/ui";
import { BarChart } from "@/components/charts";
import {
  IconArrowRight,
  IconCheck,
  IconGlobe,
  IconLayers,
  IconRefresh,
  IconSearch,
  IconServer,
  IconShield,
} from "@/components/icons";
import { fmtMoney, fmtNumber } from "@/lib/utils";

/* ----------------------------- Hero visual ---------------------------- */

function PaymentInFlight() {
  const steps = [
    { label: "Initiated", sub: "09:14 ET", state: "done" },
    { label: "FX locked", sub: "0.9215 USD/EUR", state: "done" },
    { label: "In transit", sub: "SWIFT gpi", state: "active" },
    { label: "Delivered", sub: "ETA today", state: "pending" },
  ] as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur sm:p-6">
      <div className="flex items-center justify-between">
        <Badge tone="emerald" dot>
          Payment in flight
        </Badge>
        <span className="text-xs tabular-nums text-slate-400">PAY-83721</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">
            From
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Halcyon Robotics
          </div>
          <div className="mt-0.5 text-xs text-slate-400">San Francisco · USD</div>
          <div className="mt-3 text-lg font-semibold tabular-nums text-white">
            $48,500.00
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">
            To
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Nordwind Logistics
          </div>
          <div className="mt-0.5 text-xs text-slate-400">Hamburg · EUR</div>
          <div className="mt-3 text-lg font-semibold tabular-nums text-emerald-400">
            €44,692.75
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 400 90"
        className="mt-2 block w-full"
        aria-hidden="true"
      >
        <path
          d="M 24 70 C 130 8, 270 8, 376 70"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="6 9"
          strokeLinecap="round"
          opacity="0.7"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-60"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="24" cy="70" r="5" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
        <circle cx="376" cy="70" r="5" fill="#0f172a" stroke="#10b981" strokeWidth="2" />
        <circle r="5" fill="#34d399">
          <animateMotion
            dur="2.8s"
            repeatCount="indefinite"
            path="M 24 70 C 130 8, 270 8, 376 70"
          />
        </circle>
      </svg>

      <ol className="mt-3 grid grid-cols-4 gap-2">
        {steps.map((s) => (
          <li key={s.label} className="text-center">
            <span
              className={
                s.state === "done"
                  ? "mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950"
                  : s.state === "active"
                    ? "animate-pulse-soft mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-400/20"
                    : "mx-auto flex h-6 w-6 items-center justify-center rounded-full border border-white/20"
              }
            >
              {s.state === "done" ? (
                <IconCheck className="h-3.5 w-3.5" />
              ) : (
                <span
                  className={
                    s.state === "active"
                      ? "h-1.5 w-1.5 rounded-full bg-emerald-400"
                      : "h-1.5 w-1.5 rounded-full bg-slate-500"
                  }
                />
              )}
            </span>
            <div className="mt-1.5 text-xs font-medium text-white">{s.label}</div>
            <div className="text-[10px] text-slate-400">{s.sub}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------- Savings calculator ------------------------- */

const SIZE_STEPS = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

function SavingsCalculator() {
  const [count, setCount] = useState(400);
  const [sizeIdx, setSizeIdx] = useState(4); // $2,500
  const [intlShare, setIntlShare] = useState(35);

  const { legacy, meridian, savings } = useMemo(() => {
    const size = SIZE_STEPS[sizeIdx];
    const intl = Math.round((count * intlShare) / 100);
    const domestic = count - intl;
    const legacyCost = intl * (25 + size * 0.014) + domestic * 2;
    const meridianCost = intl * (5 + size * 0.0035) + domestic * 0.4;
    return {
      legacy: legacyCost,
      meridian: meridianCost,
      savings: legacyCost - meridianCost,
    };
  }, [count, sizeIdx, intlShare]);

  const pct = legacy > 0 ? Math.round((savings / meridian) * 100) : 0;

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-7">
          <Slider
            label="Payments per month"
            value={count}
            onChange={setCount}
            min={10}
            max={2000}
            step={10}
            format={(v) => fmtNumber(v)}
          />
          <Slider
            label="Average payment size"
            value={sizeIdx}
            onChange={setSizeIdx}
            min={0}
            max={SIZE_STEPS.length - 1}
            step={1}
            format={(v) => fmtMoney(SIZE_STEPS[v], "USD", { compact: true })}
          />
          <Slider
            label="Share of international payments"
            value={intlShare}
            onChange={setIntlShare}
            min={0}
            max={100}
            step={5}
            format={(v) => `${v}%`}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
            Legacy bank modeled at $25 per international wire, $2 per domestic
            payment, and a 1.4% FX margin. Meridian modeled at $5 international,
            $0.40 domestic, and 0.35% FX. Estimates only — your actual pricing
            may be lower at volume.
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-6">
            <Stat
              label="Legacy bank / month"
              value={fmtMoney(legacy, "USD", { compact: true })}
              sub="fees + FX margin"
            />
            <Stat
              label="Meridian / month"
              value={fmtMoney(meridian, "USD", { compact: true })}
              sub="transparent pricing"
              trend="up"
            />
          </div>
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-medium text-emerald-800">
              Estimated savings
            </div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-emerald-700">
              {fmtMoney(savings)}{" "}
              <span className="text-base font-medium text-emerald-600">
                / month
              </span>
            </div>
            <div className="mt-1 text-sm text-emerald-700">
              {fmtMoney(savings * 12, "USD", { compact: true })} per year — about{" "}
              {pct}% lower than your legacy bank.
            </div>
          </div>
          <div className="mt-6">
            <BarChart
              height={190}
              valueFormat={(v) => fmtMoney(v, "USD", { compact: true })}
              data={[
                { label: "Legacy bank", value: Math.round(legacy), color: "#64748b" },
                { label: "Meridian", value: Math.round(meridian), color: "#10b981" },
              ]}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------- Rails tabs ----------------------------- */

const RAILS: Record<
  string,
  {
    title: string;
    blurb: string;
    rows: [string, string][];
    bestFor: string[];
  }
> = {
  ach: {
    title: "ACH",
    blurb:
      "The workhorse of US domestic payments. Meridian batches, schedules, and retries ACH credits and debits automatically, with same-day windows when you need them.",
    rows: [
      ["Cost", "$0.40 per credit, flat"],
      ["Speed", "Same-day windows at 8:00, 11:00, and 14:00 ET"],
      ["Corridors", "US bank accounts, with RTP fallback"],
      ["Limits", "Up to $1M per transfer"],
    ],
    bestFor: ["Payroll and contractor runs", "Vendor batches", "Recurring debits"],
  },
  wire: {
    title: "Wire",
    blurb:
      "Domestic and international wires with full Fedwire and correspondent coverage. Every wire carries structured remittance data so the beneficiary knows exactly what arrived.",
    rows: [
      ["Cost", "$5 per wire — domestic or international"],
      ["Speed", "Minutes domestically, same day for most corridors"],
      ["Corridors", "180+ countries via partner network"],
      ["Limits", "Up to $25M per transfer"],
    ],
    bestFor: ["Time-critical supplier payments", "M&A and closing funds", "Large one-off transfers"],
  },
  sepa: {
    title: "SEPA",
    blurb:
      "Euro payments across all 36 SEPA countries, with SEPA Instant where the receiving bank supports it. IBAN validation happens before you ever hit send.",
    rows: [
      ["Cost", "€0.35 per credit transfer"],
      ["Speed", "Instant (under 10 seconds) or next business day"],
      ["Corridors", "36 SEPA countries, EUR only"],
      ["Limits", "€100K instant, unlimited standard"],
    ],
    bestFor: ["European vendor payouts", "EU subsidiary funding", "Refunds at scale"],
  },
  swift: {
    title: "SWIFT",
    blurb:
      "Cross-border coverage for everywhere else, with gpi tracking end to end. You and your beneficiary both see where the money is — no more chasing intermediary banks.",
    rows: [
      ["Cost", "$5 + 0.35% FX at mid-market"],
      ["Speed", "Same day to 2 business days"],
      ["Corridors", "180+ countries, 38 settlement currencies"],
      ["Limits", "Up to $25M per transfer"],
    ],
    bestFor: ["Exotic-currency suppliers", "APAC and LATAM corridors", "Tracked high-value payments"],
  },
};

function RailsSection() {
  const [rail, setRail] = useState("ach");
  const active = RAILS[rail];

  return (
    <div>
      <Tabs
        tabs={[
          { id: "ach", label: "ACH" },
          { id: "wire", label: "Wire" },
          { id: "sepa", label: "SEPA" },
          { id: "swift", label: "SWIFT" },
        ]}
        active={rail}
        onChange={setRail}
        className="mb-8"
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            {active.title} on Meridian
          </h3>
          <p className="mt-3 leading-relaxed text-slate-600">{active.blurb}</p>
          <ul className="mt-5 space-y-2.5">
            {active.bestFor.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <Card className="p-0">
          <table className="w-full text-sm">
            <tbody>
              {active.rows.map(([k, v], i) => (
                <tr
                  key={k}
                  className={i > 0 ? "border-t border-slate-100" : undefined}
                >
                  <td className="px-5 py-3.5 font-medium text-slate-500">{k}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------ Features ------------------------------ */

function Feature({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card hover className="h-full">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
    </Card>
  );
}

/* -------------------------------- Page -------------------------------- */

export default function PaymentsPage() {
  useEffect(() => {
    document.title = "Global Payments — Meridian Financial";
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <Badge tone="emerald" dot>
                Global Payments
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Move money like it’s already there
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                Pay vendors, partners, and teams in 180+ countries from one
                balance. Mid-market FX, flat per-payment fees, and tracking on
                every rail — so finance stops guessing where the money went.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/demo" variant="white" size="lg">
                  Book a demo <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/pricing" variant="primary" size="lg">
                  See pricing
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
                {[
                  ["180+", "countries"],
                  ["38", "currencies"],
                  ["99.99%", "uptime"],
                ].map(([v, l]) => (
                  <div key={l} className="flex flex-col">
                    <dt className="text-sm text-slate-400">{l}</dt>
                    <dd className="order-first text-2xl font-semibold tracking-tight text-white">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="animate-fade-up">
              <PaymentInFlight />
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Savings calculator"
            title="See what your bank is really charging you"
            description="Drag the sliders to match your payment volume. We’ll estimate your monthly cost on a legacy bank versus Meridian — fees and FX margin included."
          />
          <div className="mt-10">
            <SavingsCalculator />
          </div>
        </div>
      </section>

      {/* Rails */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Every rail, one API"
            title="The right rail for every payment"
            description="Meridian routes each payment over the fastest, cheapest rail that meets your delivery deadline — or you can pin a rail explicitly."
          />
          <div className="mt-10">
            <RailsSection />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Built for finance teams"
            title="Everything around the payment, handled"
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<IconShield className="h-5 w-5" />}
              title="Approval workflows"
              desc="Multi-step approval chains by amount, currency, or counterparty. Approvers get the full context — invoice, FX quote, and history — in one click."
            />
            <Feature
              icon={<IconLayers className="h-5 w-5" />}
              title="Batch payments"
              desc="Upload a CSV or push via API and pay 5,000 vendors in one batch. Failures are isolated, retried, and reported line by line."
            />
            <Feature
              icon={<IconSearch className="h-5 w-5" />}
              title="Payment tracking"
              desc="gpi-level tracking on every rail. See each hop, share a status link with your beneficiary, and stop fielding ‘where’s my money’ emails."
            />
            <Feature
              icon={<IconGlobe className="h-5 w-5" />}
              title="FX at mid-market"
              desc="Convert at the mid-market rate plus a transparent 0.35% — no hidden spread. Lock quotes for up to 24 hours before you send."
            />
            <Feature
              icon={<IconServer className="h-5 w-5" />}
              title="Idempotent API"
              desc="Every request takes an idempotency key, so a retried timeout never becomes a duplicate payment. Webhooks confirm each state change."
            />
            <Feature
              icon={<IconRefresh className="h-5 w-5" />}
              title="Auto-reconciliation"
              desc="Payments sync to your ledger with references intact. Meridian matches confirmations to invoices and flags the rare exception for review."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center sm:px-16">
            <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Send your first payment in a day
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                Onboard this week, connect your ERP, and route your next vendor
                run through Meridian. Pricing that scales down as your volume
                scales up.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href="/demo" variant="white" size="lg">
                  Book a demo <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/pricing" variant="primary" size="lg">
                  View pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

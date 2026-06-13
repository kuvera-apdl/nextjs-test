"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Badge,
  Stat,
  SectionHeading,
  Slider,
  Input,
  Toggle,
} from "@/components/ui";
import { Donut } from "@/components/charts";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconFile,
  IconLock,
  IconSparkles,
  IconX,
} from "@/components/icons";
import { cn, fmtMoney } from "@/lib/utils";

/* ---------------------------- Card customizer ------------------------- */

const GRADIENTS = [
  {
    id: "emerald",
    label: "Emerald",
    classes: "from-emerald-500 via-emerald-600 to-teal-800",
  },
  {
    id: "graphite",
    label: "Graphite",
    classes: "from-slate-700 via-slate-800 to-slate-950",
  },
  {
    id: "violet",
    label: "Violet",
    classes: "from-violet-500 via-violet-600 to-indigo-800",
  },
  {
    id: "sunset",
    label: "Sunset",
    classes: "from-amber-400 via-orange-500 to-rose-600",
  },
  {
    id: "ocean",
    label: "Ocean",
    classes: "from-sky-500 via-blue-600 to-indigo-900",
  },
];

function CardCustomizer() {
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [name, setName] = useState("Avery Quinn");
  const [virtual, setVirtual] = useState(true);

  const displayName = (name.trim() || "Your Name").toUpperCase();

  return (
    <div className="grid gap-8">
      {/* Live preview */}
      <div className="mx-auto w-full max-w-sm">
        <div
          className={cn(
            "relative aspect-[8/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-xl transition-transform duration-300 hover:-rotate-2 hover:scale-105 sm:p-6",
            gradient.classes
          )}
        >
          <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-black/20 blur-2xl" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.25em]">
                Meridian
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                {virtual ? "Virtual" : "Physical"}
              </span>
            </div>
            <div className="mt-5 h-8 w-11 rounded-md border border-amber-200/60 bg-gradient-to-br from-amber-200 to-amber-500 sm:h-9 sm:w-12">
              <div className="mx-auto mt-2.5 h-3 w-7 rounded-sm border border-amber-700/30 sm:w-8" />
            </div>
            <div className="mt-auto">
              <div className="text-lg font-medium tracking-[0.2em] sm:text-xl">
                •••• •••• •••• 4921
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-white/60">
                    Cardholder
                  </div>
                  <div className="truncate text-sm font-medium tracking-wider">
                    {displayName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-white/60">
                    Valid thru
                  </div>
                  <div className="text-sm font-medium tracking-wider">09/29</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-5 sm:p-6">
        <div className="text-sm font-medium text-slate-700">Card design</div>
        <div className="mt-2.5 flex flex-wrap gap-3">
          {GRADIENTS.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-label={`${g.label} design`}
              title={g.label}
              onClick={() => setGradient(g)}
              className={cn(
                "h-9 w-9 cursor-pointer rounded-full bg-gradient-to-br transition-transform hover:scale-110",
                g.classes,
                gradient.id === g.id &&
                  "ring-2 ring-emerald-600 ring-offset-2 ring-offset-white"
              )}
            />
          ))}
        </div>
        <div className="mt-5">
          <Input
            label="Cardholder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            placeholder="Avery Quinn"
          />
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <Toggle
            checked={virtual}
            onChange={setVirtual}
            label={virtual ? "Virtual — ready in seconds" : "Physical — ships in 3 days"}
          />
          <Badge tone={virtual ? "emerald" : "slate"} dot>
            {virtual ? "Instant issue" : "Mailed to you"}
          </Badge>
        </div>
      </Card>
    </div>
  );
}

/* --------------------------- Spend controls --------------------------- */

const CATEGORIES = [
  { key: "Software", color: "#10b981" },
  { key: "Travel", color: "#0ea5e9" },
  { key: "Ads", color: "#f59e0b" },
  { key: "Other", color: "#8b5cf6" },
];

const POLICY_CAP = 100000;

function SpendControls() {
  const [limits, setLimits] = useState<number[]>([18000, 9000, 22000, 6000]);
  const total = useMemo(() => limits.reduce((a, b) => a + b, 0), [limits]);
  const over = total > POLICY_CAP;

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-7">
          {CATEGORIES.map((c, i) => (
            <Slider
              key={c.key}
              label={`${c.key} limit / month`}
              value={limits[i]}
              onChange={(v) =>
                setLimits((prev) => prev.map((x, j) => (j === i ? v : x)))
              }
              min={0}
              max={50000}
              step={1000}
              format={(v) => fmtMoney(v, "USD", { compact: true })}
            />
          ))}
          <p className="text-xs leading-relaxed text-slate-500">
            Limits enforce at authorization time — a declined swipe, not a
            month-end surprise. Finance can adjust any limit in one click.
          </p>
        </div>
        <div className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-3">
            {over ? (
              <Badge tone="rose" dot>
                Over the {fmtMoney(POLICY_CAP, "USD", { compact: true })} policy cap
              </Badge>
            ) : (
              <Badge tone="emerald" dot>
                Within the {fmtMoney(POLICY_CAP, "USD", { compact: true })} policy cap
              </Badge>
            )}
            <span className="text-xs tabular-nums text-slate-500">
              {over
                ? `${fmtMoney(total - POLICY_CAP, "USD", { compact: true })} above cap`
                : `${fmtMoney(POLICY_CAP - total, "USD", { compact: true })} headroom`}
            </span>
          </div>
          <Donut
            size={200}
            centerValue={fmtMoney(total, "USD", { compact: true })}
            centerLabel="total monthly limit"
            segments={CATEGORIES.map((c, i) => ({
              label: c.key,
              value: limits[i],
              color: c.color,
            }))}
          />
          {over && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-700">
              This allocation exceeds the company policy cap. In production,
              Meridian would route it to your admin for approval before any
              limit changes take effect.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------- Rewards calculator ------------------------- */

function RewardsCalculator() {
  const [spend, setSpend] = useState(60000);
  const annual = spend * 12 * 0.0015;

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Slider
            label="Monthly card spend"
            value={spend}
            onChange={setSpend}
            min={1000}
            max={500000}
            step={1000}
            format={(v) => fmtMoney(v, "USD", { compact: true })}
          />
          <ul className="space-y-2.5">
            {[
              "Flat 1.5% on every category — no quarterly games",
              "Cashback lands as a statement credit each month",
              "No caps, no points portal, no expiry",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-slate-700">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <Stat
            label="Estimated annual cashback"
            value={
              <span className="text-emerald-700">{fmtMoney(annual)}</span>
            }
            sub="at a flat 1.5% on all spend"
            trend="up"
          />
          <p className="mt-4 text-sm leading-relaxed text-emerald-700">
            That’s {fmtMoney(annual / 12)} back every month on{" "}
            {fmtMoney(spend, "USD", { compact: true })} of spend — enough to
            cover a few of those SaaS subscriptions you forgot about.
          </p>
        </div>
      </div>
    </Card>
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

/* ----------------------------- Comparison ----------------------------- */

const COMPARISON: { feature: string; meridian: boolean; legacy: boolean }[] = [
  { feature: "Instant virtual card issuance", meridian: true, legacy: false },
  { feature: "Real-time spend controls per card", meridian: true, legacy: false },
  { feature: "1.5% cashback on all spend", meridian: true, legacy: false },
  { feature: "No annual or per-card fees", meridian: true, legacy: false },
  { feature: "Receipts matched automatically", meridian: true, legacy: false },
  { feature: "Syncs to your ERP nightly", meridian: true, legacy: false },
  { feature: "Accepted worldwide", meridian: true, legacy: true },
  { feature: "No personal guarantee", meridian: true, legacy: false },
];

function ComparisonTable() {
  return (
    <Card className="mx-auto max-w-3xl overflow-hidden p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-5 py-3.5 font-medium text-slate-500">Capability</th>
            <th className="w-28 px-4 py-3.5 text-center font-semibold text-slate-900">
              Meridian
            </th>
            <th className="w-28 px-4 py-3.5 text-center font-medium text-slate-500">
              Legacy card
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON.map((row) => (
            <tr
              key={row.feature}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="px-5 py-3 text-slate-700">{row.feature}</td>
              <td className="px-4 py-3">
                {row.meridian ? (
                  <IconCheck className="mx-auto h-5 w-5 text-emerald-600" />
                ) : (
                  <IconX className="mx-auto h-5 w-5 text-slate-300" />
                )}
              </td>
              <td className="px-4 py-3">
                {row.legacy ? (
                  <IconCheck className="mx-auto h-5 w-5 text-emerald-600" />
                ) : (
                  <IconX className="mx-auto h-5 w-5 text-slate-300" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* -------------------------------- Page -------------------------------- */

export default function CorporateCardsPage() {
  useEffect(() => {
    document.title = "Corporate Cards — Meridian Financial";
  }, []);

  return (
    <>
      {/* Hero with customizer */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-violet-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <Badge tone="emerald" dot>
                Corporate Cards
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Cards your team loves. Controls your CFO trusts.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Issue unlimited virtual and physical cards with per-card limits,
                vendor locks, and 1.5% cashback on everything. Design yours on
                the right — it’s live before this page finishes loading.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/demo" size="lg">
                  Book a demo <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/pricing" variant="secondary" size="lg">
                  See pricing
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                No annual fees · No per-card fees · Cobalt Labs runs 340 active
                cards on Meridian
              </p>
            </div>
            <div className="animate-fade-up">
              <CardCustomizer />
            </div>
          </div>
        </div>
      </section>

      {/* Spend controls */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Spend controls"
            title="Set the budget. The card enforces it."
            description="Give every team a category limit and stop reviewing expenses after the money’s gone. Try an allocation — the donut and policy check react live."
          />
          <div className="mt-10">
            <SpendControls />
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Rewards"
            title="1.5% back on everything, no fine print"
            description="Drag your monthly spend and see what the flat rate returns over a year."
          />
          <div className="mt-10">
            <RewardsCalculator />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Expense automation"
            title="The month-end close, mostly automated"
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feature
              icon={<IconFile className="h-5 w-5" />}
              title="Receipts matching"
              desc="Cardholders text or forward a receipt; Meridian matches it to the transaction and files it for your accountants automatically."
            />
            <Feature
              icon={<IconBolt className="h-5 w-5" />}
              title="Instant issue"
              desc="Spin up a virtual card in seconds for a new vendor, a contractor, or a one-off purchase — straight into Apple or Google wallets."
            />
            <Feature
              icon={<IconLock className="h-5 w-5" />}
              title="Per-vendor locks"
              desc="Lock a card to a single merchant so the AWS card only ever pays AWS. Compromised numbers become useless everywhere else."
            />
            <Feature
              icon={<IconSparkles className="h-5 w-5" />}
              title="Auto-categorization"
              desc="Transactions land pre-coded to your chart of accounts with memo, receipt, and tax treatment attached. Review takes minutes, not days."
            />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why switch"
            title="Meridian vs the card your bank gave you"
            align="center"
          />
          <div className="mt-12">
            <ComparisonTable />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center sm:px-16">
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-24 right-12 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Issue your first card today
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                Onboard in a day, set your policy once, and let the cards do the
                enforcement. Cashback starts on the first swipe.
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

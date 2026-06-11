"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Badge,
  Stat,
  SectionHeading,
  Slider,
  Tabs,
  Toggle,
} from "@/components/ui";
import { LineChart } from "@/components/charts";
import {
  IconArrowRight,
  IconBolt,
  IconCheck,
  IconClock,
  IconFile,
  IconInfo,
} from "@/components/icons";
import { fmtMoney } from "@/lib/utils";

/* --------------------------- Loan calculator -------------------------- */

function LoanCalculator() {
  const [amount, setAmount] = useState(250000);
  const [term, setTerm] = useState(12);

  const apr = 7.9 + term / 24;

  const { payment, totalInterest, totalRepaid, balances, schedule } =
    useMemo(() => {
      const r = apr / 100 / 12;
      const pay = (amount * r) / (1 - Math.pow(1 + r, -term));
      const bals: number[] = [amount];
      const rows: {
        month: number;
        payment: number;
        interest: number;
        principal: number;
        balance: number;
      }[] = [];
      let bal = amount;
      for (let m = 1; m <= term; m++) {
        const interest = bal * r;
        const principal = pay - interest;
        bal = Math.max(0, bal - principal);
        bals.push(bal);
        rows.push({ month: m, payment: pay, interest, principal, balance: bal });
      }
      return {
        payment: pay,
        totalInterest: pay * term - amount,
        totalRepaid: pay * term,
        balances: bals,
        schedule: rows.slice(0, 6),
      };
    }, [amount, term, apr]);

  const labels = ["Start", ...Array.from({ length: term }, (_, i) => `M${i + 1}`)];

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-7 lg:col-span-2">
          <Slider
            label="Loan amount"
            value={amount}
            onChange={setAmount}
            min={25000}
            max={2000000}
            step={25000}
            format={(v) => fmtMoney(v, "USD", { compact: true })}
          />
          <Slider
            label="Term"
            value={term}
            onChange={setTerm}
            min={3}
            max={36}
            step={1}
            format={(v) => `${v} mo`}
          />
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">
              Your rate at this term
            </span>
            <span className="text-lg font-semibold tabular-nums text-emerald-700">
              {apr.toFixed(2)}% APR
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-100 pt-6">
            <Stat label="Monthly payment" value={fmtMoney(payment)} />
            <Stat
              label="Total interest"
              value={fmtMoney(totalInterest, "USD", { compact: true })}
              sub={`over ${term} months`}
            />
            <Stat
              label="Total repaid"
              value={fmtMoney(totalRepaid, "USD", { compact: true })}
            />
            <Stat label="Origination fee" value="$0" sub="none, ever" trend="up" />
          </div>
        </div>
        <div className="lg:col-span-3">
          <LineChart
            height={250}
            labels={labels}
            valueFormat={(v) => fmtMoney(v, "USD", { compact: true })}
            area
            series={[
              { name: "Outstanding balance", color: "#10b981", data: balances },
            ]}
          />
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-130 text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2.5 font-medium">Month</th>
                  <th className="px-4 py-2.5 text-right font-medium">Payment</th>
                  <th className="px-4 py-2.5 text-right font-medium">Interest</th>
                  <th className="px-4 py-2.5 text-right font-medium">Principal</th>
                  <th className="px-4 py-2.5 text-right font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.month} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {row.month}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                      {fmtMoney(row.payment)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                      {fmtMoney(row.interest)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                      {fmtMoney(row.principal)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-slate-900">
                      {fmtMoney(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            First 6 of {term} payments shown. Standard amortization, no
            prepayment penalty — repay early and the remaining interest
            disappears.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ----------------------------- Product tabs --------------------------- */

const PRODUCTS: Record<
  string,
  {
    name: string;
    desc: string;
    rows: [string, string][];
    bestFor: string[];
  }
> = {
  term: {
    name: "Term loan",
    desc: "A fixed amount, funded up front, repaid monthly. Predictable payments make it the right tool for purchases you can put a number on — equipment, inventory buys, or a planned expansion.",
    rows: [
      ["Limits", "$25K – $2M"],
      ["Term", "3 – 36 months"],
      ["Typical pricing", "7.9% – 9.4% APR, no origination fee"],
      ["Funding speed", "1 – 2 business days after approval"],
    ],
    bestFor: [
      "Equipment and fleet purchases — Atlas Freight financed 14 trailers this way",
      "Bulk inventory ahead of a seasonal peak",
      "Funding a known, one-time project",
    ],
  },
  loc: {
    name: "Line of credit",
    desc: "An approved limit you draw against whenever you need it, repaying as cash comes in. You pay interest only on what’s drawn — a standing buffer for the lumpy months.",
    rows: [
      ["Limits", "$50K – $1.5M revolving"],
      ["Term", "12-month renewable facility"],
      ["Typical pricing", "8.5% – 11% APR on drawn balance only"],
      ["Funding speed", "Draws land same day"],
    ],
    bestFor: [
      "Smoothing payroll through slow collection cycles",
      "Bridging a gap between paying suppliers and getting paid",
      "Keeping dry powder without paying for idle capital",
    ],
  },
  invoice: {
    name: "Invoice financing",
    desc: "Turn unpaid B2B invoices into cash today. Advance up to 90% of the face value the day you issue, and receive the remainder, minus the fee, when your customer pays.",
    rows: [
      ["Limits", "Up to 90% of invoice face value"],
      ["Term", "Until invoice settles, up to 120 days"],
      ["Typical pricing", "0.9% – 1.5% per 30 days outstanding"],
      ["Funding speed", "Same day on approved debtors"],
    ],
    bestFor: [
      "Long payment terms — Verdant Foods waits 75 days on grocery chains",
      "Fast-growing teams whose receivables outpace cash",
      "One-off large invoices that strain working capital",
    ],
  },
};

function ProductTabs() {
  const [tab, setTab] = useState("term");
  const p = PRODUCTS[tab];

  return (
    <div>
      <Tabs
        tabs={[
          { id: "term", label: "Term loan" },
          { id: "loc", label: "Line of credit" },
          { id: "invoice", label: "Invoice financing" },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-8"
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            {p.name}
          </h3>
          <p className="mt-3 leading-relaxed text-slate-600">{p.desc}</p>
          <ul className="mt-5 space-y-2.5">
            {p.bestFor.map((b) => (
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
              {p.rows.map(([k, v], i) => (
                <tr key={k} className={i > 0 ? "border-t border-slate-100" : undefined}>
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

/* ------------------------- Eligibility checker ------------------------ */

const CRITERIA = [
  "12+ months operating history",
  "$500K+ annual revenue",
  "Entity registered in the US, EU, or UK",
  "No active liens or judgments",
  "6+ months of runway",
];

function EligibilityChecker() {
  const [checks, setChecks] = useState<boolean[]>(CRITERIA.map(() => false));
  const count = checks.filter(Boolean).length;
  const likely = count >= 4;

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          {CRITERIA.map((c, i) => (
            <div key={c} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-700">{c}</span>
              <Toggle
                checked={checks[i]}
                onChange={(v) =>
                  setChecks((prev) => prev.map((x, j) => (j === i ? v : x)))
                }
              />
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              Criteria met: {count} of {CRITERIA.length}
            </span>
            <span className="tabular-nums text-slate-500">
              {Math.round((count / CRITERIA.length) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${(count / CRITERIA.length) * 100}%` }}
            />
          </div>
          {likely ? (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2">
                <IconCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-base font-semibold text-emerald-800">
                  Likely eligible — get a quote
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-emerald-700">
                Companies with your profile typically receive an offer within 48
                hours. Quotes are soft-pull only and never affect your credit.
              </p>
              <Button href="/demo" className="mt-4">
                Get a quote <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <IconInfo className="h-5 w-5 text-slate-500" />
                <span className="text-base font-semibold text-slate-800">
                  Keep toggling — most customers meet 4 of 5
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Meeting at least four criteria puts you in the typical approval
                range. Close but not quite? Talk to us anyway — invoice financing
                has the lightest requirements of the three products.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------- Page -------------------------------- */

export default function LendingPage() {
  useEffect(() => {
    document.title = "Lending — Meridian Financial";
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <Badge tone="emerald" dot>
                Lending
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Working capital that moves at your speed
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                Term loans, credit lines, and invoice financing from $25K to
                $2M — underwritten on your real revenue data, not a six-week
                paperwork marathon. Offers in 48 hours, funds in days.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/demo" variant="white" size="lg">
                  Get a quote <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/pricing" variant="primary" size="lg">
                  See pricing
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-400">
                Soft credit pull only · No origination fees · No prepayment
                penalties
              </p>
            </div>
            <div className="animate-fade-up">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <Badge tone="emerald" dot>
                    Offer ready
                  </Badge>
                  <span className="text-xs text-slate-400">
                    expires in 14 days
                  </span>
                </div>
                <div className="mt-5">
                  <div className="text-sm text-slate-400">
                    Cobalt Labs · Line of credit
                  </div>
                  <div className="mt-1 text-4xl font-semibold tracking-tight text-white">
                    $750,000
                  </div>
                  <div className="mt-1 text-sm text-emerald-400">
                    8.7% APR on drawn balance
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
                  {[
                    ["48 hrs", "to offer"],
                    ["Same day", "draws"],
                    ["$0", "until drawn"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <div className="text-base font-semibold text-white">{v}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="animate-pulse-soft mt-6 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  <IconClock className="h-4 w-4 shrink-0" />
                  Underwriting reviewed 3 months of live revenue — no PDFs
                  uploaded
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Loan calculator"
            title="Know your payment before you apply"
            description="Pick an amount and term. Your rate, monthly payment, total interest, and full payoff curve update as you drag — the same math our offers use."
          />
          <div className="mt-10">
            <LoanCalculator />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Three products"
            title="Match the capital to the cash-flow problem"
            description="Fixed projects want term loans. Lumpy months want a line. Slow-paying customers want invoice financing. Mix all three under one limit."
          />
          <div className="mt-10">
            <ProductTabs />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="From application to funded in three steps"
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <IconFile className="h-5 w-5" />,
                step: "01",
                title: "Apply in 10 minutes",
                desc: "Connect your accounting and banking data read-only. No deck, no projections spreadsheet, no notarized anything.",
              },
              {
                icon: <IconBolt className="h-5 w-5" />,
                step: "02",
                title: "Offer within 48 hours",
                desc: "Underwriting runs on your live revenue, margins, and cash position. You get real terms — amount, rate, schedule — not a teaser range.",
              },
              {
                icon: <IconClock className="h-5 w-5" />,
                step: "03",
                title: "Funded in 1–2 days",
                desc: "Accept online and funds land in your Meridian or external account. Lines and invoice advances draw same-day after setup.",
              },
            ].map((s) => (
              <Card key={s.step} hover className="h-full">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    {s.icon}
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-slate-300">
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {s.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Eligibility check"
            title="See where you stand in 10 seconds"
            description="Flip the toggles that describe your business. No forms, no credit pull — just an honest read on whether an application is worth your time."
          />
          <div className="mt-10">
            <EligibilityChecker />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center sm:px-16">
            <div className="absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Capital shouldn’t be the bottleneck
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                Get a real offer in 48 hours — amount, rate, and schedule —
                without touching your credit score or your week.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button href="/demo" variant="white" size="lg">
                  Get a quote <IconArrowRight className="h-4 w-4" />
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

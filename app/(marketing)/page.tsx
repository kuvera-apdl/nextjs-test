"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, SectionHeading, Stat, Tabs } from "@/components/ui";
import { Donut, LineChart, Sparkline } from "@/components/charts";
import { cn, fmtMoney } from "@/lib/utils";
import {
  IconArrowRight,
  IconBank,
  IconCheck,
  IconGlobe,
  IconSend,
  IconTrendingUp,
} from "@/components/icons";

/* ----------------------------- CountUp ----------------------------- */

function CountUp({
  target,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (started || !entries.some((e) => e.isIntersecting)) return;
        started = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(target * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  const fmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {fmt.format(value)}
      {suffix}
    </span>
  );
}

/* ------------------------------ Data ------------------------------- */

const customers = [
  "Halcyon Robotics",
  "Nordwind Logistics",
  "Cobalt Labs",
  "Atlas Freight",
  "Verdant Foods",
  "Lumen Health",
  "Quill & Co",
  "Basalt Mining",
];

const logoStyles = [
  "text-lg font-bold tracking-tight",
  "text-sm font-semibold uppercase tracking-[0.25em]",
  "text-lg font-medium font-mono tracking-tight",
  "text-lg font-extrabold italic tracking-tight",
  "text-lg font-semibold tracking-wide",
  "text-lg font-light tracking-[0.2em]",
  "text-lg font-serif italic",
  "text-sm font-black uppercase tracking-widest",
];

const productTabs = [
  { id: "payments", label: "Payments" },
  { id: "treasury", label: "Treasury" },
  { id: "lending", label: "Lending" },
  { id: "cards", label: "Cards" },
];

const productContent: Record<
  string,
  { title: string; copy: string; bullets: string[]; href: string; cta: string }
> = {
  payments: {
    title: "Send money like you ship code",
    copy: "One API and one dashboard for every payment your company makes — domestic, cross-border, one-off or batch. Rates are locked before you commit, and every transfer is traceable from initiation to settlement.",
    bullets: [
      "Pay out to 140+ countries in 40+ currencies from a single balance",
      "Mid-market FX with the margin stated up front, never buried",
      "Batch payouts and multi-step approval chains for large runs",
      "Real-time status on every transfer, down to the receiving bank",
    ],
    href: "/solutions/payments",
    cta: "Explore Payments",
  },
  treasury: {
    title: "Every balance, one live view",
    copy: "Connect your banks and entities once and Meridian keeps a real-time, consolidated picture of group cash — then puts idle balances to work automatically.",
    bullets: [
      "Live cash position across accounts, entities, and currencies",
      "13-week forecasts built from your actual inflows and outflows",
      "Auto-sweep idle cash into yield without leaving the platform",
      "One-click consolidation and FX between your own entities",
    ],
    href: "/solutions/treasury",
    cta: "Explore Treasury",
  },
  lending: {
    title: "Credit that reads your cash flow",
    copy: "Revolving credit lines underwritten on the payment volume Meridian already sees — so approval takes days, not quarters, and your rate improves as you grow.",
    bullets: [
      "Lines from $250K to $20M, underwritten on real flows",
      "Draw down and repay in two clicks, with funds landing instantly",
      "Rates that step down automatically as volume grows",
      "No warrants, no covenant surprises — terms in plain English",
    ],
    href: "/solutions/lending",
    cta: "Explore Lending",
  },
  cards: {
    title: "Spend with guardrails built in",
    copy: "Issue physical and virtual cards in seconds, each with its own limit, merchant rules, and auto-locking budget — all settling against the balance you already hold.",
    bullets: [
      "Unlimited virtual cards with per-card and per-project limits",
      "Real-time spend feed with receipt capture and auto-coding",
      "Budgets that lock cards the moment a team hits its cap",
      "1.5% cash back on all card spend, paid monthly",
    ],
    href: "/solutions/corporate-cards",
    cta: "Explore Cards",
  },
};

const testimonials = [
  {
    quote:
      "We replaced four banking portals and a wall of spreadsheets with Meridian. Month-end close went from nine days to four, and our auditors stopped sending us follow-up lists.",
    name: "Ingrid Solberg",
    role: "VP Finance, Nordwind Logistics",
    initials: "IS",
    gradient: "from-emerald-500 to-sky-500",
  },
  {
    quote:
      "Our treasury team finally sees every balance in every currency in one view. The 13-week forecast alone paid for the platform in the first quarter we ran it.",
    name: "Daniel Okafor",
    role: "Group Treasurer, Basalt Mining",
    initials: "DO",
    gradient: "from-violet-500 to-emerald-500",
  },
  {
    quote:
      "Issuing cards with hard limits per project changed how we control burn. Spend approvals that used to take days now take minutes, and nothing slips past a budget.",
    name: "Renata Vogel",
    role: "CFO, Cobalt Labs",
    initials: "RV",
    gradient: "from-amber-400 to-rose-500",
  },
];

const heroPayments = [
  {
    name: "Atlas Freight",
    detail: "Wire · USD",
    amount: fmtMoney(48200),
    tone: "emerald" as const,
    status: "Settled",
  },
  {
    name: "Verdant Foods",
    detail: "SEPA · EUR",
    amount: fmtMoney(12840.5),
    tone: "blue" as const,
    status: "Processing",
  },
  {
    name: "Halcyon Robotics",
    detail: "Wire · USD",
    amount: fmtMoney(96310),
    tone: "amber" as const,
    status: "Pending",
  },
];

/* --------------------------- Tab visuals --------------------------- */

function PaymentsVisual() {
  const rows = [
    { name: "Atlas Freight", detail: "Wire · USD → EUR", amount: fmtMoney(48200), tone: "emerald" as const, status: "Settled" },
    { name: "Verdant Foods", detail: "SEPA · EUR", amount: fmtMoney(12840.5), tone: "blue" as const, status: "Processing" },
    { name: "Halcyon Robotics", detail: "Wire · USD", amount: fmtMoney(96310), tone: "amber" as const, status: "Awaiting approval" },
    { name: "Quill & Co", detail: "ACH · USD", amount: fmtMoney(7425), tone: "slate" as const, status: "Draft" },
  ];
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <IconSend className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-900">Outbound payments</span>
        </div>
        <span className="text-xs text-slate-400">Today</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {r.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-500">{r.detail}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-semibold tabular-nums text-slate-900">{r.amount}</span>
              <Badge tone={r.tone}>{r.status}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TreasuryVisual() {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Group cash position</p>
          <p className="text-xs text-slate-500">All entities · trailing 8 months</p>
        </div>
        <Badge tone="emerald" dot>
          +8.2% QoQ
        </Badge>
      </div>
      <LineChart
        series={[
          { name: "Cash", color: "#10b981", data: [4.1, 4.4, 4.2, 4.8, 5.1, 5.0, 5.6, 6.2] },
          { name: "Forecast", color: "#0ea5e9", data: [3.9, 4.2, 4.3, 4.6, 5.0, 5.2, 5.5, 6.0] },
        ]}
        labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
        height={230}
        valueFormat={(v) => `$${v.toFixed(1)}M`}
      />
    </Card>
  );
}

function LendingVisual() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconBank className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-900">Revolving credit line</span>
        </div>
        <Badge tone="emerald">Active</Badge>
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">{fmtMoney(1240000, "USD", { compact: true })}</span>
        <span className="text-sm text-slate-500">drawn of {fmtMoney(2000000, "USD", { compact: true })}</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
      </div>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5">
        <div>
          <dt className="text-xs text-slate-500">Available</dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-900">{fmtMoney(760000, "USD", { compact: true })}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Rate</dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums text-slate-900">7.2% APR</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Next payment</dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">Jul 1</dd>
        </div>
      </dl>
      <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Latest draw</p>
          <p className="text-xs text-slate-500">Landed in USD balance · Jun 2</p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{fmtMoney(250000)}</span>
      </div>
    </Card>
  );
}

function CardsVisual() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 p-6 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Meridian</span>
          <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-300">
            Virtual
          </span>
        </div>
        <div className="relative mt-7 h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-400/80" />
        <p className="relative mt-5 font-mono text-lg tracking-[0.18em]">4929 0071 •••• 3017</p>
        <div className="relative mt-6 flex items-end justify-between text-xs">
          <div>
            <p className="text-slate-400">Cardholder</p>
            <p className="mt-0.5 font-medium uppercase tracking-wider">Cobalt Labs</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Expires</p>
            <p className="mt-0.5 font-medium tracking-wider">04/29</p>
          </div>
        </div>
      </div>
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-900">Hardware budget</span>
          <span className="tabular-nums text-slate-500">
            {fmtMoney(13890, "USD", { compact: true })} of {fmtMoney(25000, "USD", { compact: true })}
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[56%] rounded-full bg-emerald-500" />
        </div>
        <p className="mt-3 text-xs text-slate-500">Card locks automatically when the budget is reached.</p>
      </Card>
    </div>
  );
}

/* ------------------------------- Page ------------------------------ */

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("payments");
  const [tIndex, setTIndex] = useState(0);
  const [tPaused, setTPaused] = useState(false);

  useEffect(() => {
    document.title = "Meridian Financial — Financial operations for modern business";
  }, []);

  useEffect(() => {
    if (tPaused) return;
    const id = setInterval(() => {
      setTIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, [tPaused]);

  const product = productContent[activeTab];
  const testimonial = testimonials[tIndex];

  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute left-0 top-1/3 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                New: real-time FX rate locks on every transfer
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Payments, treasury, and spend.{" "}
                <span className="text-emerald-400">One platform, one balance.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                Meridian gives finance teams a single, programmable home for global payments,
                multi-currency treasury, credit, and corporate cards — with the controls your
                auditors will actually like.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href="/demo" size="lg">
                  Get a demo
                  <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/pricing" size="lg" variant="white">
                  Explore pricing
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-400">
                No platform fee to start · 40+ currencies · Connect your banks in minutes
              </p>
            </div>

            {/* Hero visual: mock dashboard cluster */}
            <div className="relative animate-fade-up lg:justify-self-end">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-2 shadow-2xl backdrop-blur">
                <div className="rounded-2xl bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Group cash position</span>
                    <Badge tone="emerald" dot>
                      Live
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                    {fmtMoney(8412906.22)}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <IconTrendingUp className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-600">
                      +{fmtMoney(412000, "USD", { compact: true })} this week
                    </span>
                  </div>
                  <div className="mt-3">
                    <Sparkline
                      data={[42, 44, 41, 47, 49, 48, 53, 51, 56, 60, 58, 64]}
                      width={280}
                      height={48}
                      fill
                    />
                  </div>
                  <div className="mt-5 grid gap-6 border-t border-slate-100 pt-5 sm:grid-cols-2 sm:items-center">
                    <Donut
                      size={116}
                      segments={[
                        { label: "USD", value: 52, color: "#10b981" },
                        { label: "EUR", value: 28, color: "#0ea5e9" },
                        { label: "GBP", value: 12, color: "#f59e0b" },
                        { label: "Other", value: 8, color: "#64748b" },
                      ]}
                      centerValue="14"
                      centerLabel="accounts"
                    />
                    <ul className="space-y-2.5">
                      {heroPayments.map((p) => (
                        <li key={p.name} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-slate-900">{p.name}</p>
                            <p className="text-[11px] tabular-nums text-slate-500">{p.amount}</p>
                          </div>
                          <Badge tone={p.tone}>{p.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                  <IconCheck className="h-4 w-4 text-emerald-400" />
                </span>
                <div>
                  <p className="text-xs font-medium text-white">Payment approved</p>
                  <p className="text-[11px] text-slate-400">Atlas Freight · {fmtMoney(48200)}</p>
                </div>
              </div>
              <div className="absolute -right-2 -top-5 hidden items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur sm:flex lg:-right-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20">
                  <IconGlobe className="h-4 w-4 text-sky-400" />
                </span>
                <div>
                  <p className="text-xs font-medium text-white">FX rate locked</p>
                  <p className="text-[11px] tabular-nums text-slate-400">EUR → USD at 1.0842</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- Logo marquee -------------------------- */}
      <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-500">
            Trusted by finance teams at
          </p>
        </div>
        <div className="relative mt-8 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
          <div className="flex w-max animate-marquee">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 items-center gap-14 pr-14 sm:gap-20 sm:pr-20"
              >
                {customers.map((c, i) => (
                  <span key={c} className={cn("whitespace-nowrap text-slate-400", logoStyles[i])}>
                    {c}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Stats ------------------------------ */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            <Card>
              <Stat
                label="Processed annually"
                value={<CountUp target={4.2} decimals={1} prefix="$" suffix="B" />}
                sub="up 38% year over year"
                trend="up"
              />
            </Card>
            <Card>
              <Stat
                label="Currencies supported"
                value={<CountUp target={40} suffix="+" />}
                sub="across 140+ payout countries"
              />
            </Card>
            <Card>
              <Stat
                label="Platform uptime"
                value={<CountUp target={99.99} decimals={2} suffix="%" />}
                sub="trailing 12 months"
              />
            </Card>
            <Card>
              <Stat
                label="Finance teams"
                value={<CountUp target={3400} />}
                sub="from seed stage to enterprise"
                trend="up"
              />
            </Card>
          </div>
        </div>
      </section>

      {/* ------------------------ Product showcase ------------------------ */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The platform"
            title="Four products. One ledger."
            description="Everything settles against the same balance and the same audit trail, so your money never goes missing between tools."
            align="center"
          />
          <div className="mt-10 flex justify-center">
            <Tabs tabs={productTabs} active={activeTab} onChange={setActiveTab} />
          </div>
          <div key={activeTab} className="mt-12 grid items-center gap-12 animate-fade-up lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {product.title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{product.copy}</p>
              <ul className="mt-6 space-y-3">
                {product.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <IconCheck className="h-3.5 w-3.5 text-emerald-700" />
                    </span>
                    <span className="text-slate-600">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href={product.href} variant="secondary">
                  {product.cta}
                  <IconArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              {activeTab === "payments" && <PaymentsVisual />}
              {activeTab === "treasury" && <TreasuryVisual />}
              {activeTab === "lending" && <LendingVisual />}
              {activeTab === "cards" && <CardsVisual />}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- Testimonials -------------------------- */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-12 sm:px-12 sm:py-16">
            <SectionHeading
              eyebrow="Customers"
              title="Finance teams talk back"
              align="center"
            />
            <div key={tIndex} className="mx-auto mt-10 max-w-3xl text-center animate-fade-up">
              <span
                aria-hidden="true"
                className="block font-serif text-6xl leading-none text-emerald-600"
              >
                “
              </span>
              <blockquote className="mt-6 text-xl font-medium leading-relaxed tracking-tight text-slate-900 sm:text-2xl">
                {testimonial.quote}
              </blockquote>
              <div className="mt-8 flex items-center justify-center gap-3">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white",
                    testimonial.gradient
                  )}
                >
                  {testimonial.initials}
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-slate-900">{testimonial.name}</span>
                  <span className="block text-sm text-slate-500">{testimonial.role}</span>
                </span>
              </div>
            </div>
            <div className="mt-10 flex justify-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  aria-label={`Show testimonial from ${t.name}`}
                  onClick={() => {
                    setTIndex(i);
                    setTPaused(true);
                  }}
                  className={cn(
                    "h-2 cursor-pointer rounded-full transition-all",
                    i === tIndex ? "w-7 bg-emerald-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- CTA band ---------------------------- */}
      <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-24">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Run your money like you run your product.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            See your payments, treasury, credit, and cards in one live demo — with your own
            workflows, not a canned script.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button href="/demo" size="lg" variant="white">
              Get a demo
              <IconArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/contact" size="lg">
              Talk to sales
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

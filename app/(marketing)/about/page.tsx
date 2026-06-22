"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Modal, SectionHeading, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  IconArrowRight,
  IconLayers,
  IconPlus,
  IconSearch,
  IconShield,
  IconWallet,
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

/* ------------------------------ Timeline ---------------------------- */

const milestones: {
  year: string;
  type: string;
  tone: "emerald" | "blue" | "violet" | "amber";
  title: string;
  body: string;
}[] = [
  {
    year: "2019",
    type: "Company",
    tone: "emerald",
    title: "Keelstone is founded in Amsterdam",
    body: "Maya Lindqvist and Tomás Ferreira start Keelstone with a simple thesis: moving money should be as programmable as deploying code. The first build is a multi-currency ledger and a payments API, run for three design partners out of a borrowed office above a bicycle shop.",
  },
  {
    year: "2020",
    type: "Product",
    tone: "blue",
    title: "The first rails go live",
    body: "EUR and GBP corridors open for production traffic, and Quill & Co becomes customer number one. By December, fifty finance teams are sending real payments — and the team learns more from one stuck wire than from a year of roadmap debates.",
  },
  {
    year: "2021",
    type: "Product",
    tone: "blue",
    title: "Treasury joins the ledger",
    body: "Multi-currency accounts and a live group cash view ship as Keelstone Treasury. Nordwind Logistics signs as the first enterprise customer and retires eleven banking portals in a single quarter.",
  },
  {
    year: "2022",
    type: "Scale",
    tone: "violet",
    title: "One thousand finance teams",
    body: "Keelstone crosses 1,000 customers and opens offices in London and Singapore. Payment operations move to a follow-the-sun model so a transfer stuck at 3 a.m. gets a human answer at 3:04.",
  },
  {
    year: "2023",
    type: "Product",
    tone: "blue",
    title: "Corporate cards launch",
    body: "Cards arrive with per-project budgets that lock spend automatically at the cap. Cobalt Labs issues four hundred virtual cards in the first month and cancels three reimbursement tools the month after.",
  },
  {
    year: "2024",
    type: "Milestone",
    tone: "amber",
    title: "Lending, underwritten on real flows",
    body: "Credit lines launch, underwritten on the payment volume Keelstone already sees instead of stale financials. The same year, the platform processes its first billion-dollar quarter.",
  },
  {
    year: "2025",
    type: "Scale",
    tone: "violet",
    title: "Nine offices, forty currencies",
    body: "Coverage expands to 40+ currencies and 140+ payout countries, with new offices from São Paulo to Sydney. Support goes fully follow-the-sun across nine locations.",
  },
  {
    year: "2026",
    type: "Today",
    tone: "amber",
    title: "3,400 teams and counting",
    body: "Keelstone now moves $4.2B a year for 3,400 finance teams, from seed-stage startups to multinational groups. The thesis has not changed — and most of the roadmap is still ahead of us.",
  },
];

/* ------------------------------- Values ----------------------------- */

const values = [
  {
    title: "Clarity by default",
    icon: IconSearch,
    base: "Every number in the product traces back to a ledger entry you can open. If we cannot explain a balance, we do not ship it.",
    extra:
      "That standard applies internally too — pricing, incident reports, and roadmaps are written to be understood on the first read. Jargon is treated as a bug, not a register.",
  },
  {
    title: "Care over speed",
    icon: IconShield,
    base: "We move billions on behalf of other people. Correct and a day early beats instant and occasionally wrong, every single time.",
    extra:
      "It shows up in the details: dual controls on risky changes, staged rollouts for anything that touches funds, and a standing rule that nobody deploys payment-path code alone.",
  },
  {
    title: "Built for decades",
    icon: IconLayers,
    base: "Financial infrastructure should be boring, durable, and still standing when the trends change. We pick technology and partners accordingly.",
    extra:
      "There are no exotic dependencies on the payment path, and we rehearse failure twice a quarter. Customers should outgrow their banks — never their platform.",
  },
  {
    title: "Skin in the game",
    icon: IconWallet,
    base: "Keelstone runs its own treasury, payroll, and spend on Keelstone. Every rough edge lands on our own finance team first.",
    extra:
      "Our CFO files the same support tickets customers do, through the same queue. Nothing sharpens a roadmap like closing your own books on your own product.",
  },
];

/* ----------------------------- Leadership --------------------------- */

const leaders = [
  {
    name: "Maya Lindqvist",
    role: "Co-founder & CEO",
    initials: "ML",
    gradient: "from-emerald-500 to-sky-500",
    bio: "Maya spent a decade running group treasury for industrial and logistics companies, ending as Group Treasurer at Nordwind Logistics — where reconciling fourteen banking portals every Friday convinced her the tooling, not the team, was the problem. She co-founded Keelstone in 2019 and still reads every incident postmortem that touches customer funds.",
    history: [
      "Group Treasurer, Nordwind Logistics · 2014–2019",
      "Treasury operations lead, European industrial group · 2009–2014",
    ],
  },
  {
    name: "Tomás Ferreira",
    role: "Co-founder & CTO",
    initials: "TF",
    gradient: "from-violet-500 to-emerald-500",
    bio: "Tomás builds the boring kind of infrastructure that never makes the news. Before Keelstone he was principal engineer at Cobalt Labs, where he led the rebuild of their double-entry ledger under live traffic. He believes any payment system worth trusting should be explainable on a single whiteboard.",
    history: [
      "Principal Engineer, Cobalt Labs · 2015–2019",
      "Platform engineer, Amsterdam payments startup · 2011–2015",
    ],
  },
  {
    name: "Priya Raghavan",
    role: "Head of Treasury Solutions",
    initials: "PR",
    gradient: "from-amber-400 to-rose-500",
    bio: "Priya ran FX and hedging across eleven currencies for Basalt Mining before joining Keelstone in 2021. She turned that experience into Keelstone Treasury — the product she says she spent five years wishing someone would build. She still spends one week each quarter embedded with a customer treasury team.",
    history: [
      "Head of FX & Hedging, Basalt Mining · 2016–2021",
      "Treasury analyst, commodities trading desk · 2012–2016",
    ],
  },
  {
    name: "Jonah Weiss",
    role: "Compliance Lead",
    initials: "JW",
    gradient: "from-sky-500 to-violet-500",
    bio: "Jonah has spent his career on both sides of the audit table — first as a bank examiner, then building financial-crime programs for a cross-border payments provider. He joined Keelstone in 2020 to make compliance a product feature instead of a gate, and his team ships controls the way engineers ship code.",
    history: [
      "Director of Financial-Crime Compliance, cross-border payments provider · 2015–2020",
      "Bank examiner, prudential supervision · 2010–2015",
    ],
  },
  {
    name: "Sofia Marin",
    role: "Head of Product",
    initials: "SM",
    gradient: "from-rose-400 to-amber-400",
    bio: "Sofia led spend-management product at Quill & Co, where she watched finance teams duct-tape five tools together to answer one question. At Keelstone since 2022, she is quietly obsessed with removing one click per week from month-end close — and keeps a public tally of the clicks removed.",
    history: [
      "Director of Product, Quill & Co · 2017–2022",
      "Product manager, B2B software · 2013–2017",
    ],
  },
  {
    name: "Andre Castillo",
    role: "CFO",
    initials: "AC",
    gradient: "from-emerald-400 to-teal-600",
    bio: "Andre was CFO at Atlas Freight — and one of Keelstone’s earliest enterprise customers. After three years of closing Atlas’s books on the platform, he switched sides in 2023. He now runs Keelstone’s own finances on Keelstone, and files his complaints through the same support queue as everyone else.",
    history: [
      "CFO, Atlas Freight · 2016–2023",
      "FP&A lead, global logistics group · 2010–2016",
    ],
  },
];

/* -------------------------------- Page ------------------------------ */

export default function AboutPage() {
  const [activeYear, setActiveYear] = useState("2019");
  const [openValue, setOpenValue] = useState<number | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<number | null>(null);

  useEffect(() => {
    document.title = "About — Keelstone Financial";
  }, []);

  const milestone = milestones.find((m) => m.year === activeYear) ?? milestones[0];
  const leader = selectedLeader === null ? null : leaders[selectedLeader];

  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              About Keelstone
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Moving money should be as programmable as{" "}
              <span className="text-emerald-600">deploying code.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Keelstone exists because our founders were tired of running global finance through
              portals built two decades ago — fourteen logins, five spreadsheets, and a fax number
              for emergencies. We build the platform we wished existed: one ledger for payments,
              treasury, credit, and cards, with an API underneath everything and an audit trail
              behind every number.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------ Metrics ----------------------------- */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            <Card>
              <Stat label="Founded" value="2019" sub="in Amsterdam" />
            </Card>
            <Card>
              <Stat
                label="Employees"
                value={<CountUp target={480} />}
                sub="across 6 disciplines"
              />
            </Card>
            <Card>
              <Stat
                label="Offices worldwide"
                value={<CountUp target={9} />}
                sub="plus remote teammates"
              />
            </Card>
            <Card>
              <Stat
                label="Processed annually"
                value={<CountUp target={4.2} decimals={1} prefix="$" suffix="B" />}
                sub="for 3,400 finance teams"
                trend="up"
              />
            </Card>
          </div>
        </div>
      </section>

      {/* ------------------------------ Timeline ----------------------------- */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The story so far"
            title="Seven years, one thesis"
            description="Pick a year to see what we shipped, broke, and learned along the way."
          />
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {milestones.map((m) => (
              <button
                key={m.year}
                onClick={() => setActiveYear(m.year)}
                aria-pressed={m.year === activeYear}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  m.year === activeYear
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                )}
              >
                {m.year}
              </button>
            ))}
          </div>
          <Card key={milestone.year} className="mt-6 animate-fade-up sm:p-8">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <Badge tone={milestone.tone}>{milestone.type}</Badge>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {milestone.title}
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">{milestone.body}</p>
              </div>
              <span className="hidden select-none text-6xl font-semibold tracking-tight text-slate-100 sm:block">
                {milestone.year}
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* ------------------------------- Values ------------------------------ */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How we work"
            title="Four values we actually use"
            description="They show up in code review and in pricing meetings, not just on the wall. Click any card for the unabridged version."
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {values.map((v, i) => {
              const open = openValue === i;
              const Icon = v.icon;
              return (
                <button
                  key={v.title}
                  onClick={() => setOpenValue(open ? null : i)}
                  aria-expanded={open}
                  className={cn(
                    "cursor-pointer rounded-2xl border bg-white p-6 text-left shadow-sm transition-all",
                    open
                      ? "border-transparent ring-2 ring-emerald-600"
                      : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </span>
                    <IconPlus
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-transform",
                        open && "rotate-45 text-emerald-600"
                      )}
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.base}</p>
                  <span
                    className={cn(
                      "grid transition-all duration-300",
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <span className="overflow-hidden">
                      <span className="mt-3 block border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
                        {v.extra}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------- Leadership ---------------------------- */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Leadership"
            title="The people signing off on it"
            description="Operators first — most of the leadership team ran finance, treasury, or payments infrastructure before building it."
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {leaders.map((l, i) => (
              <button
                key={l.name}
                onClick={() => setSelectedLeader(i)}
                className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white",
                    l.gradient
                  )}
                >
                  {l.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-slate-900">
                    {l.name}
                  </span>
                  <span className="block text-sm text-slate-500">{l.role}</span>
                  <span className="mt-1 block text-xs font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Read bio
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Modal
        open={selectedLeader !== null}
        onClose={() => setSelectedLeader(null)}
        title={leader?.name}
        footer={
          <Button variant="secondary" onClick={() => setSelectedLeader(null)}>
            Close
          </Button>
        }
      >
        {leader && (
          <div>
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-semibold text-white",
                  leader.gradient
                )}
              >
                {leader.initials}
              </span>
              <div>
                <Badge tone="emerald">{leader.role}</Badge>
                <p className="mt-1.5 text-sm text-slate-500">Keelstone Financial</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-600">{leader.bio}</p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Career history
            </p>
            <ul className="mt-2 space-y-2">
              {leader.history.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      {/* ------------------------------ CTA band ----------------------------- */}
      <section className="relative overflow-hidden bg-slate-950 py-16 text-white sm:py-24">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            We’re hiring across 5 teams.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Engineering, product, design, risk, and go-to-market — onsite in nine offices or remote
            across time zones. Come build infrastructure people trust with their payroll.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button href="/careers" size="lg" variant="white">
              View open roles
              <IconArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/contact" size="lg">
              Get in touch
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

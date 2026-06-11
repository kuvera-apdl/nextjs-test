"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  Badge,
  Stat,
  SectionHeading,
  Slider,
} from "@/components/ui";
import { LineChart, Donut, Sparkline } from "@/components/charts";
import {
  IconArrowRight,
  IconBank,
  IconBuilding,
  IconCalendar,
  IconChart,
  IconFile,
  IconRefresh,
} from "@/components/icons";
import { fmtMoney } from "@/lib/utils";

/* ----------------------------- Hero cluster --------------------------- */

const SPARK_TOTAL = [9.6, 9.9, 10.4, 10.2, 10.8, 11.1, 11.6, 11.4, 11.9, 12.1, 12.4];
const SPARK_OPS = [6.2, 6.0, 5.7, 6.1, 5.9, 5.6, 5.8, 6.0, 5.7, 5.9, 5.8];
const SPARK_MMF = [2.4, 2.6, 2.9, 3.1, 3.2, 3.4, 3.6, 3.7, 3.9, 4.0, 4.2];
const SPARK_EUR = [1.8, 1.9, 1.8, 2.0, 2.1, 2.0, 2.2, 2.1, 2.2, 2.3, 2.1];

function BalanceCluster() {
  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">Total cash across entities</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              $12.4M
            </div>
            <div className="mt-1 text-xs text-emerald-600">
              ▲ +$2.8M over the last 11 weeks
            </div>
          </div>
          <Badge tone="emerald" dot>
            Live
          </Badge>
        </div>
        <div className="mt-4">
          <Sparkline data={SPARK_TOTAL} width={280} height={48} fill />
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Operating · USD", value: "$5.8M", spark: SPARK_OPS, color: "#64748b" },
          { label: "Money market", value: "$4.2M", spark: SPARK_MMF, color: "#10b981" },
          { label: "EUR accounts", value: "€2.1M", spark: SPARK_EUR, color: "#0ea5e9" },
        ].map((c) => (
          <Card key={c.label} className="p-4">
            <div className="text-xs text-slate-500">{c.label}</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              {c.value}
            </div>
            <div className="mt-2">
              <Sparkline data={c.spark} width={110} height={30} color={c.color} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------- Cash-flow simulator ------------------------ */

function flowAt(net: number, growthPct: number, month: number): number {
  const g = growthPct / 100;
  return net >= 0 ? net * Math.pow(1 + g, month - 1) : net * Math.pow(1 - g, month - 1);
}

function CashFlowSimulator({
  startingCash,
  onStartingCashChange,
}: {
  startingCash: number;
  onStartingCashChange: (v: number) => void;
}) {
  const [net, setNet] = useState(-150000);
  const [growth, setGrowth] = useState(4);

  const { balances, endBalance, runway } = useMemo(() => {
    const pts: number[] = [startingCash];
    let bal = startingCash;
    for (let m = 1; m <= 12; m++) {
      bal = bal <= 0 ? 0 : Math.max(0, bal + flowAt(net, growth, m));
      pts.push(bal);
    }
    let months: number | null = null;
    let b = startingCash;
    for (let m = 1; m <= 600; m++) {
      b += flowAt(net, growth, m);
      if (b <= 0) {
        months = m;
        break;
      }
    }
    return { balances: pts, endBalance: pts[12], runway: months };
  }, [startingCash, net, growth]);

  const labels = ["Now", ...Array.from({ length: 12 }, (_, i) => `M${i + 1}`)];

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="space-y-7 lg:col-span-2">
          <Slider
            label="Starting cash"
            value={startingCash}
            onChange={onStartingCashChange}
            min={500000}
            max={20000000}
            step={100000}
            format={(v) => fmtMoney(v, "USD", { compact: true })}
          />
          <Slider
            label="Monthly net cash flow"
            value={net}
            onChange={setNet}
            min={-500000}
            max={500000}
            step={25000}
            format={(v) =>
              `${v < 0 ? "−" : "+"}${fmtMoney(Math.abs(v), "USD", { compact: true })}`
            }
          />
          <Slider
            label="Revenue growth / month"
            value={growth}
            onChange={setGrowth}
            min={0}
            max={15}
            step={0.5}
            format={(v) => `${v}%`}
          />
          <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
            <Stat
              label="Projected balance, month 12"
              value={fmtMoney(endBalance, "USD", { compact: true })}
              sub={endBalance >= startingCash ? "growing" : "drawing down"}
              trend={endBalance >= startingCash ? "up" : "down"}
            />
            <Stat
              label="Runway"
              value={runway === null ? "∞" : `${runway} mo`}
              sub={
                runway === null
                  ? "cash never depletes"
                  : runway <= 12
                    ? "depletes within the year"
                    : "beyond this projection"
              }
              trend={runway === null ? "up" : runway <= 12 ? "down" : undefined}
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Growth compounds a monthly surplus — or shrinks a monthly burn — by
            the rate you set. Balances floor at zero in the chart.
          </p>
        </div>
        <div className="lg:col-span-3">
          <LineChart
            height={300}
            labels={labels}
            valueFormat={(v) => fmtMoney(v, "USD", { compact: true })}
            area
            series={[{ name: "Projected cash", color: "#10b981", data: balances }]}
          />
        </div>
      </div>
    </Card>
  );
}

/* -------------------------- Yield allocation -------------------------- */

const YIELD_BUCKETS = [
  { key: "Operating buffer", apy: 0, color: "#64748b" },
  { key: "Money market", apy: 4.1, color: "#0ea5e9" },
  { key: "Term deposits", apy: 4.8, color: "#10b981" },
];

function YieldAllocator({ startingCash }: { startingCash: number }) {
  const [alloc, setAlloc] = useState<[number, number, number]>([25, 45, 30]);

  function update(i: number, raw: number) {
    setAlloc((prev) => {
      const v = Math.min(100, Math.max(0, raw));
      const others = [0, 1, 2].filter((j) => j !== i) as [number, number];
      const otherSum = prev[others[0]] + prev[others[1]];
      const remaining = 100 - v;
      const next: [number, number, number] = [...prev];
      if (otherSum === 0) {
        next[others[0]] = Math.round(remaining / 2);
        next[others[1]] = remaining - next[others[0]];
      } else {
        next[others[0]] = Math.round((remaining * prev[others[0]]) / otherSum);
        next[others[1]] = remaining - next[others[0]];
      }
      next[i] = v;
      return next;
    });
  }

  const blended = useMemo(
    () => YIELD_BUCKETS.reduce((a, b, i) => a + (alloc[i] * b.apy) / 100, 0),
    [alloc]
  );
  const annualYield = (startingCash * blended) / 100;

  return (
    <Card className="p-6 sm:p-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-7">
          {YIELD_BUCKETS.map((b, i) => (
            <Slider
              key={b.key}
              label={`${b.key} · ${b.apy.toFixed(1)}% APY`}
              value={alloc[i]}
              onChange={(v) => update(i, v)}
              min={0}
              max={100}
              step={1}
              format={(v) => `${v}%`}
            />
          ))}
          <p className="text-xs leading-relaxed text-slate-500">
            Sliders auto-balance to 100% of your{" "}
            {fmtMoney(startingCash, "USD", { compact: true })} starting cash from
            the projection above. Sample APYs shown — live rates appear in your
            dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <Donut
            size={190}
            centerValue={`${blended.toFixed(2)}%`}
            centerLabel="blended APY"
            segments={YIELD_BUCKETS.map((b, i) => ({
              label: b.key,
              value: alloc[i],
              color: b.color,
            }))}
          />
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-medium text-emerald-800">
              Projected annual yield
            </div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-emerald-700">
              {fmtMoney(annualYield)}
            </div>
            <div className="mt-1 text-sm text-emerald-700">
              on {fmtMoney(startingCash, "USD", { compact: true })} at a blended{" "}
              {blended.toFixed(2)}% APY — without giving up same-day liquidity on
              your operating buffer.
            </div>
          </div>
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

/* -------------------------------- Page -------------------------------- */

export default function TreasuryPage() {
  const [startingCash, setStartingCash] = useState(6000000);

  useEffect(() => {
    document.title = "Treasury — Meridian Financial";
  }, []);

  return (
    <>
      {/* Hero (light) */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <Badge tone="emerald" dot>
                Treasury
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Every dollar visible. Every idle dollar working.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Meridian Treasury pulls every account, entity, and currency into
                one live cash position — then forecasts it forward and sweeps
                idle balances into yield, automatically.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/demo" size="lg">
                  Book a demo <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button href="/pricing" variant="secondary" size="lg">
                  See pricing
                </Button>
              </div>
            </div>
            <div className="animate-fade-up">
              <BalanceCluster />
            </div>
          </div>
        </div>
      </section>

      {/* Cash-flow simulator */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Cash-flow simulator"
            title="Project your next 12 months in seconds"
            description="Set your starting cash, monthly net flow, and growth rate. Meridian builds the same projection from your live balances — this one’s just for playing."
          />
          <div className="mt-10">
            <CashFlowSimulator
              startingCash={startingCash}
              onStartingCashChange={setStartingCash}
            />
          </div>
        </div>
      </section>

      {/* Yield allocation */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Yield allocation"
            title="Put the cash you’re not using to work"
            description="Split your position across an operating buffer, money market funds, and term deposits. The donut and blended yield update as you drag."
          />
          <div className="mt-10">
            <YieldAllocator startingCash={startingCash} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The treasury toolkit"
            title="Built for lean finance teams with real complexity"
            align="center"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<IconChart className="h-5 w-5" />}
              title="Real-time positions"
              desc="Balances refresh continuously across every connected bank and Meridian account — one number for total cash, no spreadsheet stitching."
            />
            <Feature
              icon={<IconCalendar className="h-5 w-5" />}
              title="13-week forecasts"
              desc="Rolling forecasts built from payables, receivables, and payroll runs, with variance tracking so you learn where the model drifts."
            />
            <Feature
              icon={<IconRefresh className="h-5 w-5" />}
              title="Sweep rules"
              desc="Keep operating accounts at a target balance and sweep the rest into money market funds nightly. Reverse sweeps trigger before big outflows."
            />
            <Feature
              icon={<IconBuilding className="h-5 w-5" />}
              title="Multi-entity rollups"
              desc="Consolidate subsidiaries, currencies, and intercompany positions into one view, with FX translated at the rate set you choose."
            />
            <Feature
              icon={<IconBank className="h-5 w-5" />}
              title="Direct bank connections"
              desc="Native connections to 80+ banks plus open-banking coverage elsewhere. Balances and transactions land without manual statement uploads."
            />
            <Feature
              icon={<IconFile className="h-5 w-5" />}
              title="Audit-ready exports"
              desc="Every position, sweep, and forecast snapshot is timestamped and exportable — your auditors get evidence, not screenshots."
            />
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <figure className="text-center">
            <blockquote className="text-2xl font-medium leading-relaxed tracking-tight text-slate-900 sm:text-3xl">
              “We closed our Friday cash position at 9am instead of 4pm. Meridian
              paid for itself the first month — the sweep rules alone earn more
              than the platform costs us.”
            </blockquote>
            <figcaption className="mt-8 flex items-center justify-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                MH
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-slate-900">
                  Maren Holst
                </span>
                <span className="block text-sm text-slate-500">
                  CFO, Nordwind Logistics
                </span>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center sm:px-16">
            <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Know your position before your coffee’s cold
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
                Connect your banks in an afternoon and see total cash, forecasts,
                and yield opportunities in one dashboard.
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Spinner,
  Stat,
  Tabs,
} from "@/components/ui";
import { Donut, LineChart, Sparkline } from "@/components/charts";
import {
  IconAlert,
  IconDownload,
  IconRefresh,
  IconSearch,
} from "@/components/icons";
import { cn, fmtDate, fmtMoney } from "@/lib/utils";

type Metrics = {
  totalBalance: number;
  accounts: { id: string; name: string; currency: string; balance: number }[];
  inflow30: number;
  outflow30: number;
  runwayMonths: number | null;
  pendingInvoicesTotal: number;
  processingPaymentsCount: number;
  cashflow: { labels: string[]; inflow: number[]; outflow: number[] };
  balanceHistory: number[];
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  counterparty: string;
  category: string;
  account: string;
  amount: number;
  currency: string;
  status: "settled" | "pending";
};

type TxData = {
  transactions: Transaction[];
  categories: string[];
  accounts: string[];
};

const DONUT_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6", "#64748b"];
const RANGE_TABS = [
  { id: "3", label: "3M" },
  { id: "6", label: "6M" },
  { id: "12", label: "12M" },
];

function signedAmount(amount: number, currency: string) {
  const negative = amount < 0;
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        negative ? "text-rose-600" : "text-emerald-700"
      )}
    >
      {negative ? "−" : "+"}
      {fmtMoney(Math.abs(amount), currency)}
    </span>
  );
}

export default function OverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [txData, setTxData] = useState<TxData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Chart range
  const [range, setRange] = useState("12");

  // Transactions table controls
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    document.title = "Overview — Keelstone Financial";
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [mRes, tRes] = await Promise.all([
        fetch("/api/metrics"),
        fetch("/api/transactions"),
      ]);
      if (!mRes.ok || !tRes.ok) throw new Error("Request failed");
      const [m, t] = await Promise.all([mRes.json(), tRes.json()]);
      setMetrics(m);
      setTxData(t);
    } catch {
      setError("We could not load your dashboard data.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    if (!txData) return [];
    const q = query.trim().toLowerCase();
    const rows = txData.transactions.filter((t) => {
      if (category && t.category !== category) return false;
      if (account && t.account !== account) return false;
      if (q && !`${t.description} ${t.counterparty}`.includes(q))
        return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sortKey === "amount") return (a.amount - b.amount) * dir;
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    });
    return rows;
  }, [txData, query, category, account, sortKey, sortDir]);

  function toggleSort(key: "date" | "amount") {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function sortIndicator(key: "date" | "amount") {
    if (sortKey !== key) return null;
    return <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  function clearFilters() {
    setQuery("");
    setCategory("");
    setAccount("");
  }

  function exportCsv() {
    const header = [
      "Date",
      "Description",
      "Counterparty",
      "Category",
      "Account",
      "Status",
      "Amount",
      "Currency",
    ];
    const rows = filtered.map((t) => [
      t.date,
      t.description,
      t.counterparty,
      t.category,
      t.account,
      t.status,
      String(t.amount),
      t.currency,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <IconAlert className="mx-auto h-8 w-8 text-rose-500" />
          <p className="mt-3 text-base font-medium text-slate-900">
            Something went wrong
          </p>
          <p className="mt-1 text-sm text-slate-600">{error}</p>
          <Button className="mt-5" onClick={() => load()}>
            <IconRefresh className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics || !txData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-7 w-7" />
          <p className="text-sm text-slate-500">Loading your overview…</p>
        </div>
      </div>
    );
  }

  const sliceN = Number(range);
  const chartLabels = metrics.cashflow.labels.slice(-sliceN);
  const chartSeries = [
    {
      name: "Inflow",
      color: "#10b981",
      data: metrics.cashflow.inflow.slice(-sliceN),
    },
    {
      name: "Outflow",
      color: "#f43f5e",
      data: metrics.cashflow.outflow.slice(-sliceN),
    },
  ];

  const donutSegments = metrics.accounts.map((a, i) => ({
    label: a.name,
    value: Math.max(a.balance, 0),
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const pendingSub = `${fmtMoney(metrics.pendingInvoicesTotal, "USD")} in pending invoices`;

  return (
    <div className="space-y-6">
      {/* Heading row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Halcyon Robotics Ltd — consolidated view
          </p>
        </div>
        <Button variant="secondary" onClick={refresh} disabled={refreshing}>
          {refreshing ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <IconRefresh className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="flex items-end justify-between gap-3">
            <Stat
              label="Total balance"
              value={fmtMoney(metrics.totalBalance, "USD")}
              sub="All accounts, USD equivalent"
            />
            <Sparkline data={metrics.balanceHistory} fill className="shrink-0" />
          </div>
        </Card>
        <Card>
          <Stat
            label="Inflow · 30d"
            value={fmtMoney(metrics.inflow30, "USD")}
            sub="Last 30 days"
            trend="up"
          />
        </Card>
        <Card>
          <Stat
            label="Outflow · 30d"
            value={fmtMoney(metrics.outflow30, "USD")}
            sub="Last 30 days"
          />
        </Card>
        <Card>
          <Stat
            label="Runway"
            value={
              metrics.runwayMonths === null ? "∞" : `${metrics.runwayMonths} mo`
            }
            sub={
              metrics.runwayMonths === null
                ? `Cash-positive · ${pendingSub}`
                : pendingSub
            }
          />
        </Card>
      </div>

      {/* Cash flow + accounts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900">
                Cash flow
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Monthly inflow vs outflow
              </p>
            </div>
            <Tabs tabs={RANGE_TABS} active={range} onChange={setRange} />
          </div>
          <LineChart
            className="mt-5"
            series={chartSeries}
            labels={chartLabels}
            height={260}
            valueFormat={(v) => fmtMoney(v, "USD", { compact: true })}
          />
          <div className="mt-3 flex gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Inflow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Outflow
            </span>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Accounts
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Balances shown in native currency
          </p>
          <div className="mt-5 flex justify-center">
            <Donut
              segments={donutSegments}
              size={170}
              centerLabel="Total (USD)"
              centerValue={fmtMoney(metrics.totalBalance, "USD", {
                compact: true,
              })}
            />
          </div>
          <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
            {metrics.accounts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm text-slate-700">
                    {a.name}
                  </span>
                  <Badge tone="slate">{a.currency}</Badge>
                </span>
                <span className="text-sm font-medium tabular-nums text-slate-900">
                  {fmtMoney(a.balance, a.currency)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              Transactions
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {filtered.length} of {txData.transactions.length} transactions
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <IconDownload className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Input
              placeholder="Search description or counterparty…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
              aria-label="Search transactions"
            />
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <Select
            aria-label="Filter by category"
            placeholder="All categories"
            options={txData.categories.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Select
            aria-label="Filter by account"
            placeholder="All accounts"
            options={txData.accounts.map((a) => ({ value: a, label: a }))}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<IconSearch className="h-8 w-8" />}
              title="No matching transactions"
              description="Try adjusting your search or filters."
              action={
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4 font-medium">
                    <button
                      onClick={() => toggleSort("date")}
                      className="cursor-pointer uppercase tracking-wider hover:text-slate-600"
                    >
                      Date
                      {sortIndicator("date")}
                    </button>
                  </th>
                  <th className="py-3 pr-4 font-medium">Description</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Account</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">
                    <button
                      onClick={() => toggleSort("amount")}
                      className="cursor-pointer uppercase tracking-wider hover:text-slate-600"
                    >
                      Amount
                      {sortIndicator("amount")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                      {fmtDate(t.date)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">
                        {t.description}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.counterparty}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone="slate">{t.category}</Badge>
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                      {t.account}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={t.status === "settled" ? "emerald" : "amber"}>
                        {t.status === "settled" ? "Settled" : "Pending"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap py-3 text-right tabular-nums">
                      {signedAmount(t.amount, t.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

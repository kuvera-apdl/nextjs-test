import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = getStore();
  const now = Date.now();
  const DAY = 86400000;

  let inflow30 = 0;
  let outflow30 = 0;
  for (const t of store.transactions) {
    if (now - new Date(t.date).getTime() > 30 * DAY) continue;
    const usd = t.amount / (store.fxRates[t.currency] ?? 1);
    if (usd >= 0) inflow30 += usd;
    else outflow30 += -usd;
  }

  const totalBalance = store.accounts.reduce(
    (sum, a) => sum + a.balance / (store.fxRates[a.currency] ?? 1),
    0
  );

  const netBurn = Math.max(outflow30 - inflow30, 0);
  // Near-breakeven burn produces absurd runway figures; treat >10 years as
  // cash-positive (null) so the dashboard shows "Cash-positive" instead.
  const rawRunway = netBurn > 0 ? totalBalance / netBurn : Infinity;
  const runwayMonths =
    rawRunway > 120 ? null : Math.round(rawRunway * 10) / 10;

  const pendingInvoicesTotal = store.invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount / (store.fxRates[i.currency] ?? 1), 0);

  const processingPaymentsCount = store.payments.filter(
    (p) => p.status === "processing"
  ).length;

  return NextResponse.json({
    totalBalance: Math.round(totalBalance),
    accounts: store.accounts,
    inflow30: Math.round(inflow30),
    outflow30: Math.round(outflow30),
    runwayMonths,
    pendingInvoicesTotal: Math.round(pendingInvoicesTotal),
    processingPaymentsCount,
    cashflow: store.cashflow,
    balanceHistory: store.balanceHistory,
  });
}

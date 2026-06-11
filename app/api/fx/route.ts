import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// Static base rates with a small time-based wobble so the converter feels live.
function liveRate(rates: Record<string, number>, from: string, to: string) {
  const base = rates[to] / rates[from];
  const phase = from.charCodeAt(0) + to.charCodeAt(1);
  const wobble = 1 + 0.0015 * Math.sin(Date.now() / 60000 + phase);
  return base * wobble;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const store = getStore();
  const rates = store.fxRates;
  const currencies = Object.keys(rates);
  const asOf = new Date().toISOString();

  const from = searchParams.get("from")?.toUpperCase();
  const to = searchParams.get("to")?.toUpperCase();

  if (!from || !to) {
    const live: Record<string, number> = {};
    for (const c of currencies) {
      live[c] = c === "USD" ? 1 : liveRate(rates, "USD", c);
    }
    return NextResponse.json({ base: "USD", currencies, rates: live, asOf });
  }

  if (!rates[from] || !rates[to]) {
    return NextResponse.json(
      { error: "Unsupported currency pair." },
      { status: 400 }
    );
  }

  const amount = Number(searchParams.get("amount") ?? "1");
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const rate = liveRate(rates, from, to);
  return NextResponse.json({
    from,
    to,
    amount,
    rate,
    converted: amount * rate,
    asOf,
  });
}

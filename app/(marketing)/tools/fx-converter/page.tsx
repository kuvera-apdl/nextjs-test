"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Card, Input, SectionHeading, Select } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { IconAlert, IconArrowRight, IconRefresh } from "@/components/icons";
import { cn, fmtMoney } from "@/lib/utils";

type RatesPayload = {
  base: string;
  currencies: string[];
  rates: Record<string, number>;
  asOf: string;
};

type ConvertPayload = {
  from: string;
  to: string;
  amount: number;
  rate: number;
  converted: number;
  asOf: string;
};

const MAJORS = ["EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "SGD", "HKD"];

export default function FxConverterPage() {
  useEffect(() => {
    document.title = "FX Converter — Keelstone Financial";
  }, []);

  // ---- Rates table (fetched on mount) ----
  const [rates, setRates] = useState<RatesPayload | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [sparks, setSparks] = useState<Record<string, number[]>>({});

  const loadRates = useCallback(async () => {
    setRatesError(null);
    try {
      const res = await fetch("/api/fx");
      if (!res.ok) throw new Error("Request failed");
      setRates((await res.json()) as RatesPayload);
    } catch {
      setRatesError("We couldn’t load FX rates. Please try again.");
    }
  }, []);

  useEffect(() => {
    loadRates();
  }, [loadRates]);

  // Generate plausible sparkline series once per rates fetch — never during render.
  useEffect(() => {
    if (!rates) return;
    const next: Record<string, number[]> = {};
    for (const code of MAJORS) {
      const rate = rates.rates[code];
      if (typeof rate !== "number") continue;
      const points: number[] = [];
      let v = rate * (1 + (Math.random() - 0.5) * 0.004);
      for (let i = 0; i < 19; i++) {
        v += rate * (Math.random() - 0.5) * 0.0025;
        points.push(v);
      }
      points.push(rate);
      next[code] = points;
    }
    setSparks(next);
  }, [rates]);

  // ---- Converter ----
  const [amountStr, setAmountStr] = useState("1000");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [conv, setConv] = useState<ConvertPayload | null>(null);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState<string | null>(null);
  const [movement, setMovement] = useState<"up" | "down" | null>(null);
  const [swapSpin, setSwapSpin] = useState(0);
  const requestRef = useRef(0);
  const prevRateRef = useRef<number | null>(null);

  // A new pair makes the previous rate incomparable.
  useEffect(() => {
    prevRateRef.current = null;
    setMovement(null);
  }, [from, to]);

  const runConversion = useCallback(async () => {
    const amount = Number(amountStr);
    if (amountStr.trim() === "" || !Number.isFinite(amount) || amount < 0) {
      setConvError("Enter a valid, non-negative amount.");
      setConvLoading(false);
      return;
    }
    const id = ++requestRef.current;
    setConvLoading(true);
    setConvError(null);
    try {
      const res = await fetch(
        `/api/fx?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(amount)}`
      );
      const data = (await res.json().catch(() => null)) as
        | (ConvertPayload & { error?: string })
        | null;
      if (id !== requestRef.current) return;
      if (!res.ok || !data || typeof data.rate !== "number") {
        setConvError(data?.error ?? "Conversion failed. Please try again.");
        return;
      }
      const prev = prevRateRef.current;
      if (prev !== null && data.rate !== prev) {
        setMovement(data.rate > prev ? "up" : "down");
      }
      prevRateRef.current = data.rate;
      setConv(data);
    } catch {
      if (id === requestRef.current) {
        setConvError("We couldn’t reach the FX service.");
      }
    } finally {
      if (id === requestRef.current) setConvLoading(false);
    }
  }, [amountStr, from, to]);

  // Debounced fetch on any change + 10s auto-refresh of the current conversion.
  useEffect(() => {
    const t = setTimeout(runConversion, 250);
    const iv = setInterval(runConversion, 10000);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [runConversion]);

  const swap = () => {
    setSwapSpin((s) => s + 180);
    setFrom(to);
    setTo(to);
  };

  const currencyOptions = (rates?.currencies ?? ["USD", "EUR"]).map((c) => ({
    value: c,
    label: c,
  }));

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Tools"
          title="Live FX converter"
          description="Demo mid-market rates across 12 currencies, refreshed continuously. Illustrative only — this tool doesn’t move money."
          align="center"
        />

        {/* ------------------------------ Converter ----------------------------- */}
        <Card className="mx-auto mt-12 max-w-2xl p-6 sm:p-8">
          <Input
            label="Amount"
            type="number"
            min={0}
            inputMode="decimal"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
          />
          <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <Select
              label="From"
              options={currencyOptions}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1"
            />
            <button
              type="button"
              aria-label="Swap currencies"
              onClick={swap}
              style={{ transform: `rotate(${swapSpin}deg)` }}
              className="mx-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition-transform duration-300 hover:border-emerald-600 hover:text-emerald-600 sm:mx-0 sm:mb-0.5"
            >
              <IconRefresh className="h-4 w-4" />
            </button>
            <Select
              label="To"
              options={currencyOptions}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            {convError ? (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
                <IconAlert className="h-4 w-4 shrink-0" />
                {convError}
              </div>
            ) : conv ? (
              <div>
                <p className="text-sm text-slate-500">
                  {fmtMoney(conv.amount, conv.from)} equals
                </p>
                <p
                  className={cn(
                    "mt-1 text-4xl font-semibold tracking-tight tabular-nums text-slate-900",
                    convLoading && "animate-pulse opacity-50"
                  )}
                >
                  {fmtMoney(conv.converted, conv.to)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                  <span className="tabular-nums">
                    1 {conv.from} = {conv.rate.toFixed(4)} {conv.to}
                  </span>
                  {movement === "up" && (
                    <span className="text-xs font-semibold text-emerald-600">▲</span>
                  )}
                  {movement === "down" && (
                    <span className="text-xs font-semibold text-rose-600">▼</span>
                  )}
                  <span className="text-xs text-slate-400">
                    as of{" "}
                    {new Date(conv.asOf).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="animate-pulse">
                <div className="h-3 w-28 rounded bg-slate-100" />
                <div className="mt-2 h-10 w-56 rounded-lg bg-slate-200" />
                <div className="mt-3 h-3 w-44 rounded bg-slate-100" />
              </div>
            )}
          </div>
        </Card>

        {/* ----------------------------- Major rates ----------------------------- */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Major rates against the dollar
          </h2>
          <div className="mt-5">
            {ratesError ? (
              <Card className="flex flex-col items-center gap-4 py-10 text-center">
                <IconAlert className="h-8 w-8 text-rose-500" />
                <p className="text-slate-600">{ratesError}</p>
                <Button variant="secondary" onClick={loadRates}>
                  Try again
                </Button>
              </Card>
            ) : rates ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {MAJORS.map((code) =>
                  typeof rates.rates[code] === "number" ? (
                    <Card key={code} className="p-4" hover>
                      <p className="text-xs font-medium text-slate-500">
                        USD → {code}
                      </p>
                      <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-slate-900">
                        {rates.rates[code].toFixed(4)}
                      </p>
                      {sparks[code] && (
                        <Sparkline
                          data={sparks[code]}
                          width={110}
                          height={32}
                          color="#10b981"
                          fill
                          className="mt-2"
                        />
                      )}
                    </Card>
                  ) : null
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {MAJORS.map((code) => (
                  <div
                    key={code}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="h-3 w-16 rounded bg-slate-100" />
                    <div className="mt-2 h-5 w-20 rounded bg-slate-200" />
                    <div className="mt-3 h-8 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------- CTA card ------------------------------ */}
        <Card className="mx-auto mt-12 max-w-4xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-semibold text-slate-900">
                Move real money at mid-market
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Keelstone Payments converts at the same mid-market rate you see
                here — no hidden spread, ever.
              </p>
            </div>
            <Button href="/solutions/payments">
              Explore Payments
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

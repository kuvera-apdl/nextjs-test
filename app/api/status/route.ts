import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const BASE_LATENCY: Record<string, number> = {
  API: 38,
  Dashboard: 62,
  "Payment processing — ACH & domestic": 84,
  "Payment processing — SWIFT & cross-border": 132,
  "FX engine": 22,
  Webhooks: 210,
  "Card issuing": 96,
};

export async function GET() {
  const store = getStore();
  const services = store.services.map((s) => ({
    ...s,
    latencyMs: Math.round((BASE_LATENCY[s.name] ?? 50) * (0.85 + Math.random() * 0.4)),
  }));

  const overall = services.some((s) => s.status === "outage")
    ? "outage"
    : services.some((s) => s.status === "degraded")
      ? "degraded"
      : "operational";

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    overall,
    services,
    incidents: store.incidents,
  });
}

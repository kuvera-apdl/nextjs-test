import { NextRequest, NextResponse } from "next/server";
import { getStore, uid, RAIL_FEES, type Payment } from "@/lib/store";

export const dynamic = "force-dynamic";

const RAILS: Payment["rail"][] = ["ACH", "Wire", "SEPA", "SWIFT"];
// Payments created via POST settle automatically after this long.
const SETTLE_AFTER_MS = 60000;

function settleDuePayments(payments: Payment[]) {
  const now = Date.now();
  for (const p of payments) {
    if (
      p.status === "processing" &&
      now - new Date(p.createdAt).getTime() > SETTLE_AFTER_MS
    ) {
      p.status = "completed";
    }
  }
}

export async function GET() {
  const store = getStore();
  settleDuePayments(store.payments);
  return NextResponse.json({ payments: store.payments });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const beneficiaryId =
    typeof body?.beneficiaryId === "string" ? body.beneficiaryId : "";
  const amount = Number(body?.amount);
  const rail = RAILS.includes(body?.rail) ? (body.rail as Payment["rail"]) : null;
  const currency = typeof body?.currency === "string" ? body.currency : "";
  const reference = typeof body?.reference === "string" ? body.reference.trim() : "";

  const store = getStore();
  const beneficiary = store.beneficiaries.find((b) => b.id === beneficiaryId);
  if (!beneficiary) {
    return NextResponse.json(
      { error: "Select a valid beneficiary." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be a positive number." },
      { status: 400 }
    );
  }
  if (!rail) {
    return NextResponse.json({ error: "Select a payment rail." }, { status: 400 });
  }

  const payment: Payment = {
    id: `pay_${uid().slice(0, 8)}`,
    beneficiary: beneficiary.name,
    bank: beneficiary.bank,
    amount: Math.round(amount * 100) / 100,
    currency: currency || beneficiary.currency,
    rail,
    reference: reference || `PAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    status: "processing",
    createdAt: new Date().toISOString(),
    fee: RAIL_FEES[rail],
  };
  store.payments.unshift(payment);
  return NextResponse.json({ payment }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getStore, uid, type Invoice } from "@/lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function refreshOverdue(invoices: Invoice[]) {
  const now = Date.now();
  for (const inv of invoices) {
    if (inv.status === "sent" && new Date(inv.dueAt).getTime() < now) {
      inv.status = "overdue";
    }
  }
}

export async function GET() {
  const store = getStore();
  refreshOverdue(store.invoices);
  return NextResponse.json({ invoices: store.invoices });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const client = typeof body?.client === "string" ? body.client.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const amount = Number(body?.amount);
  const currency =
    typeof body?.currency === "string" && body.currency ? body.currency : "USD";
  const dueAt = typeof body?.dueAt === "string" ? body.dueAt : "";

  if (!client) {
    return NextResponse.json({ error: "Client name is required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid billing email is required." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be a positive number." },
      { status: 400 }
    );
  }
  const due = dueAt ? new Date(dueAt) : new Date(Date.now() + 30 * 86400000);
  if (Number.isNaN(due.getTime())) {
    return NextResponse.json({ error: "Invalid due date." }, { status: 400 });
  }

  const store = getStore();
  const invoice: Invoice = {
    id: `inv_${uid().slice(0, 8)}`,
    number: `INV-2026-${String(++store.counters.invoice).padStart(3, "0")}`,
    client,
    email,
    amount: Math.round(amount * 100) / 100,
    currency,
    issuedAt: new Date().toISOString(),
    dueAt: due.toISOString(),
    status: "sent",
  };
  store.invoices.unshift(invoice);
  return NextResponse.json({ invoice }, { status: 201 });
}

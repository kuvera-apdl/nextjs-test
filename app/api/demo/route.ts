import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const teamSize = typeof body?.teamSize === "string" || typeof body?.teamSize === "number" ? String(body.teamSize) : "";
  const products = Array.isArray(body?.products)
    ? body.products.filter((p: unknown) => typeof p === "string")
    : [];
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!company || !name) {
    return NextResponse.json(
      { error: "Company and contact name are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid work email is required." },
      { status: 400 }
    );
  }

  const store = getStore();
  const reference = `DEMO-${++store.counters.demo}`;
  store.demoRequests.push({
    reference,
    company,
    name,
    email,
    teamSize,
    products,
    notes,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, reference });
}

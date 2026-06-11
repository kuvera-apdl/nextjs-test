import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "general";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || !message) {
    return NextResponse.json(
      { error: "Name and message are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const store = getStore();
  const id = `MSG-${++store.counters.contact}`;
  const receivedAt = new Date().toISOString();
  store.contactMessages.push({ id, name, email, company, topic, message, receivedAt });

  return NextResponse.json({ ok: true, id, receivedAt });
}

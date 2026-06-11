import { NextRequest, NextResponse } from "next/server";
import { getStore, type Invoice } from "@/lib/store";

export const dynamic = "force-dynamic";

const ALLOWED: Invoice["status"][] = ["draft", "sent", "paid", "overdue", "void"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const invoice = store.invoices.find((i) => i.id === id);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as Invoice["status"] | undefined;
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if (invoice.status === "paid" && status !== "paid") {
    return NextResponse.json(
      { error: "Paid invoices cannot change status." },
      { status: 409 }
    );
  }

  invoice.status = status;
  return NextResponse.json({ invoice });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const idx = store.invoices.findIndex((i) => i.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }
  const inv = store.invoices[idx];
  if (inv.status !== "draft" && inv.status !== "void") {
    return NextResponse.json(
      { error: "Only draft or void invoices can be deleted." },
      { status: 409 }
    );
  }
  store.invoices.splice(idx, 1);
  return NextResponse.json({ ok: true });
}

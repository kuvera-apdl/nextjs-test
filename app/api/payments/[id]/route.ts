import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const payment = store.payments.find((p) => p.id === id);
  if (!payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (body?.action !== "cancel") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }
  if (payment.status !== "processing") {
    return NextResponse.json(
      { error: "Only processing payments can be canceled." },
      { status: 409 }
    );
  }

  payment.status = "canceled";
  return NextResponse.json({ payment });
}

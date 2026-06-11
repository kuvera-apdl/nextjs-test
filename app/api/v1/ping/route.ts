import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "meridian-api",
    version: "1.4.2",
    region: "us-east-1",
    time: new Date().toISOString(),
    latencyMs: 8 + Math.round(Math.random() * 34),
  });
}

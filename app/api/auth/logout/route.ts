import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("mf_session")?.value;
  if (token) getStore().sessions.delete(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("mf_session", "", { path: "/", maxAge: 0 });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { getStore, uid } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const store = getStore();
  const user = store.users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  const token = uid();
  store.sessions.set(token, {
    email: user.email,
    name: user.name,
    org: user.org,
  });

  const res = NextResponse.json({
    ok: true,
    user: { email: user.email, name: user.name, org: user.org },
  });
  res.cookies.set("mf_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}

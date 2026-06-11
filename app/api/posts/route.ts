import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const tag = searchParams.get("tag") ?? "";

  const all = getStore().posts;
  const posts = all
    .filter((p) => {
      if (tag && p.tag !== tag) return false;
      if (q && !`${p.title} ${p.excerpt}`.toLowerCase().includes(q)) return false;
      return true;
    })
    .map(({ content: _content, ...meta }) => meta);

  return NextResponse.json({
    posts,
    tags: [...new Set(all.map((p) => p.tag))],
  });
}

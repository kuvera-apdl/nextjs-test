import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getStore().posts.find((p) => p.slug === slug);
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  post.likes += 1;
  return NextResponse.json({ likes: post.likes });
}

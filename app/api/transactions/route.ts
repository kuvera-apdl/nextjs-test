import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const category = searchParams.get("category") ?? "";
  const account = searchParams.get("account") ?? "";
  const sort = searchParams.get("sort") === "amount" ? "amount" : "date";
  const dir = searchParams.get("dir") === "asc" ? 1 : -1;

  const all = getStore().transactions;
  const transactions = all
    .filter((t) => {
      if (category && t.category !== category) return false;
      if (account && t.account !== account) return false;
      if (
        q &&
        !`${t.description} ${t.counterparty}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "amount") return (a.amount - b.amount) * dir;
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
    });

  return NextResponse.json({
    transactions,
    categories: [...new Set(all.map((t) => t.category))].sort(),
    accounts: [...new Set(all.map((t) => t.account))].sort(),
  });
}

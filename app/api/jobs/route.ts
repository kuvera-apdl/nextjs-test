import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const department = searchParams.get("department") ?? "";
  const location = searchParams.get("location") ?? "";
  const q = (searchParams.get("q") ?? "").toLowerCase();

  const all = getStore().jobs;
  const jobs = all.filter((j) => {
    if (department && j.department !== department) return false;
    if (location && j.location !== location) return false;
    if (q && !`${j.title} ${j.description}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return NextResponse.json({
    jobs,
    departments: [...new Set(all.map((j) => j.department))],
    locations: [...new Set(all.map((j) => j.location))],
  });
}

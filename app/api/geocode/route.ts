import { NextRequest, NextResponse } from "next/server";
import { geocode } from "@/lib/openweather";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 });

  try {
    const candidates = await geocode(q);
    return NextResponse.json(candidates);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
